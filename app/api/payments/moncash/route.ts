import { NextResponse } from "next/server";
import { createPayment, getRedirectUrl } from "@/lib/moncash";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    const orderId = String(body?.orderId || "");

    if (!amount || !orderId) {
      return NextResponse.json({ error: "amount ou orderId manquant" }, { status: 400 });
    }

    const payment = await createPayment(amount, orderId);
    const paymentToken = payment?.payment_token?.token;

    if (!paymentToken) {
      return NextResponse.json(
        { error: "MonCash n'a pas retourné de payment_token", details: payment },
        { status: 502 }
      );
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = supabaseAdmin();
      await supabase
        .from("orders")
        .update({ status: "pending_payment" })
        .eq("id", orderId);
    }

    return NextResponse.json(
      {
        success: true,
        order_id: orderId,
        payment_token: paymentToken,
        redirect_url: getRedirectUrl(paymentToken),
        moncash: payment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("MonCash init error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initiation MonCash" }, { status: 500 });
  }
}
