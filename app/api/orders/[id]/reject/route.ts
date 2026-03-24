import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderRejectedEmail } from "@/lib/email";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

async function sendOrderRejectedEmailFallback(order: any) {
  const host = process.env.EMAIL_HOST || "";
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASSWORD || "";
  const port = Number(process.env.EMAIL_PORT || 587);
  const from = process.env.EMAIL_FROM || "pitonrodjy@gmail.com";

  if (!host || !user || !pass) {
    return { success: false, error: "EMAIL_* variables manquantes" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `Commande #${order.id} refusee`;
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(createdAt);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;">Commande refusee</h2>
      <p style="margin:0 0 16px;color:#555;">Commande #${order.id} • ${dateLabel}</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;">
        <p style="margin:0;font-size:14px;color:#9a3412;">
          Votre paiement n'a pas pu etre valide. Merci de re-verifier la preuve et de relancer votre commande ou de contacter le support.
        </p>
      </div>
      <p style="margin:16px 0 0;color:#666;font-size:12px;">Besoin d'aide ? Contactez notre support.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: order.customer_email,
      subject,
      html,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Email send failed" };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const idFromPath = parts.length >= 2 ? parts[parts.length - 2] : "";
    const orderId = idFromPath || (body?.order_id ? String(body.order_id) : "");
    if (!orderId) return NextResponse.json({ error: "id manquant" }, { status: 400 });

    const supabase = supabaseAdmin();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,user_id,customer_email,created_at")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Commande introuvable" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const emailResult =
      typeof sendOrderRejectedEmail === "function"
        ? await sendOrderRejectedEmail({ order })
        : await sendOrderRejectedEmailFallback(order);
    if (emailResult) {
      const logPayload: Record<string, any> = {
        order_id: order.id,
        user_id: order.user_id,
        to_email: order.customer_email,
        subject: `Commande #${order.id} refusee`,
        status: emailResult.success ? "success" : "failed",
        email_type: "order_rejected",
        erreur: emailResult.success ? null : emailResult.error,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        modele: "order_rejected",
        template: "order_rejected",
      };
      await supabase.from("email_log").insert([logPayload]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reject order error:", error);
    return NextResponse.json({ error: error.message || "Erreur" }, { status: 500 });
  }
}
