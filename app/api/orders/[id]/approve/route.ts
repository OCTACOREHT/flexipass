import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAccountDeliveryEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const idFromPath = parts.length >= 2 ? parts[parts.length - 2] : "";
    const orderId = idFromPath || (body?.order_id ? String(body.order_id) : "");
    if (!orderId) return NextResponse.json({ error: "id manquant" }, { status: 400 });
    const accountId = body?.account_id ? String(body.account_id) : "";
    const manualEmail = body?.account_email ? String(body.account_email) : "";
    const manualPassword = body?.account_password ? String(body.account_password) : "";
    const profile = body?.profile ? String(body.profile) : null;

    if (!accountId && (!manualEmail || !manualPassword)) {
      return NextResponse.json({ error: "Compte manquant (email/mot de passe)" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,user_id,customer_email,created_at")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Commande introuvable" }, { status: 404 });
    }

    let accountEmail = manualEmail;
    let accountPassword = manualPassword;
    let service = body?.service ? String(body.service) : "Service";
    let accountRecord: any = null;

    if (accountId) {
      const { data: acc, error: accError } = await supabase
        .from("service_accounts")
        .select("id,service,email,password_encrypted,is_used")
        .eq("id", accountId)
        .single();

      if (accError || !acc) {
        return NextResponse.json({ error: accError?.message || "Compte introuvable" }, { status: 404 });
      }
      if (acc.is_used) {
        return NextResponse.json({ error: "Ce compte est deja utilise" }, { status: 400 });
      }
      accountRecord = acc;
      accountEmail = acc.email;
      accountPassword = acc.password_encrypted;
      service = acc.service || service;
    }

    // Try to infer service from order items/products if not provided
    if (!service || service === "Service") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, products(title)")
        .eq("order_id", orderId)
        .limit(1);
      const first = Array.isArray(items) ? items[0] : null;
      const title = (first as any)?.products?.title || (first as any)?.products?.[0]?.title;
      if (title) service = title;
    }

    const deliveredAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivered_at: deliveredAt,
        account_id: accountRecord?.id || null,
        account_email: accountEmail,
        account_password: accountPassword,
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (accountRecord) {
      await supabase
        .from("service_accounts")
        .update({ is_used: true })
        .eq("id", accountRecord.id);
    }

    const emailResult = await sendAccountDeliveryEmail({
      order,
      service,
      accountEmail,
      accountPassword,
      profile,
    });

    if (emailResult) {
      const logPayload: Record<string, any> = {
        order_id: order.id,
        user_id: order.user_id,
        to_email: order.customer_email,
        subject: `Acces ${service}`,
        status: emailResult.success ? "success" : "failed",
        email_type: "account_delivery",
        erreur: emailResult.success ? null : emailResult.error,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        modele: "account_delivery",
        template: "account_delivery",
      };
      await supabase.from("email_log").insert([logPayload]);
    }

    return NextResponse.json({ success: true, delivered_at: deliveredAt });
  } catch (error: any) {
    console.error("Approve order error:", error);
    return NextResponse.json({ error: error.message || "Erreur" }, { status: 500 });
  }
}
