import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderConfirmationEmail } from "@/lib/email";

type OrderItemInput = {
  product_id: string;
  quantity: number;
  price: number;
};

export const runtime = "nodejs";

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Utilisateur non authentifie" }, { status: 401 });
    }

    const supabase = supabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const body = await request.json();
    const items = Array.isArray(body?.items) ? (body.items as OrderItemInput[]) : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const normalizedItems = items.map((item) => ({
      product_id: String(item?.product_id || "").trim(),
      quantity: toNumber(item?.quantity),
      price: toNumber(item?.price),
    }));

    const invalidItem = normalizedItems.find(
      (item) => !item.product_id || !item.quantity || item.quantity <= 0 || item.price === null || item.price < 0
    );

    if (invalidItem) {
      return NextResponse.json({ error: "Articles invalides" }, { status: 400 });
    }

    const totalPrice = normalizedItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    const customerEmail = user.email || "";
    if (!customerEmail) {
      return NextResponse.json({ error: "Email client manquant" }, { status: 400 });
    }

    const orderPayload = {
      user_id: user.id,
      customer_email: customerEmail,
      customer_name: body?.customer_name || user.user_metadata?.full_name || "Client",
      total_price: totalPrice,
      total_amount: totalPrice,
      payment_method: body?.payment_method || null,
      payment_status: "pending",
      order_status: "pending",
      status: "pending",
      payment_proof_url: body?.payment_proof_url || null,
    };

    let order: any = null;
    let orderItemsInsertError: string | null = null;

    // Attempt RPC transaction if available
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_order_with_items", {
      order_payload: orderPayload,
      items_payload: normalizedItems,
    });

    if (!rpcError && rpcData) {
      order = rpcData;
    } else {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select("*")
        .single();

      if (orderError) throw orderError;
      order = orderData;

      const itemsPayload = normalizedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsError) {
        orderItemsInsertError = itemsError.message;
        await supabase.from("orders").delete().eq("id", order.id);
      }
    }

    if (orderItemsInsertError) {
      return NextResponse.json({ error: orderItemsInsertError }, { status: 500 });
    }

    // Respond immediately — email is sent asynchronously to avoid SMTP timeouts
    const response = NextResponse.json({ order, email_sent: false }, { status: 201 });

    const emailSubject = `Confirmation de commande #${order.id}`;
    const shouldEmail = (order.payment_method || "").toLowerCase() !== "moncash_test";

    if (shouldEmail) {
      const productIds = normalizedItems.map((i) => i.product_id);
      void (async () => {
        try {
          const { data: products } = await supabase
            .from("products")
            .select("id,title,image_url,service_name")
            .in("id", productIds);

          const productMap = new Map(
            (products || []).map((p: any) => [
              p.id,
              { title: p.title || p.service_name || p.id, image_url: p.image_url || null },
            ])
          );

          const emailItems = normalizedItems.map((item) => {
            const meta = productMap.get(item.product_id);
            return {
              product_id: item.product_id,
              product_name: meta?.title || item.product_id,
              product_image: meta?.image_url || null,
              quantity: item.quantity ?? 0,
              price: item.price ?? 0,
            };
          });

          const emailResult = await sendOrderConfirmationEmail({ order, items: emailItems, totalPrice });
          if (!emailResult) return;

          const logPayload: Record<string, any> = {
            order_id: order.id,
            user_id: user.id,
            to_email: user.email,
            subject: emailSubject,
            status: emailResult.success ? "success" : "failed",
            sujet: emailSubject,
            statut: emailResult.success ? "success" : "failed",
            erreur: emailResult.success ? null : emailResult.error,
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            modele: "order_confirmation",
            template: "order_confirmation",
          };
          const { error: logError } = await supabase.from("email_log").insert([logPayload]);
          if (logError) console.error("Email log insert error:", logError);
        } catch (err) {
          console.error("Background email error:", err);
        }
      })();
    }

    return response;
  } catch (error: any) {
    console.error("Erreur creation commande:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
