import { NextResponse } from "next/server";
import { retrieveOrderPayment, retrieveTransactionPayment } from "@/lib/moncash";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactionId = body?.transactionId ? String(body.transactionId) : "";
    const orderId = body?.orderId ? String(body.orderId) : "";

    if (!transactionId && !orderId) {
      return NextResponse.json({ error: "transactionId ou orderId manquant" }, { status: 400 });
    }

    const result = transactionId
      ? await retrieveTransactionPayment(transactionId)
      : await retrieveOrderPayment(orderId);

    const isPaid = result?.payment?.message === "successful";
    const reference = result?.payment?.reference || orderId;

    if (isPaid && process.env.SUPABASE_SERVICE_ROLE_KEY && reference) {
      const supabase = supabaseAdmin();
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", reference);
    }

    return NextResponse.json(
      {
        success: isPaid,
        order_id: reference || null,
        transaction_id: result?.payment?.transaction_id || null,
        moncash: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("MonCash verify error:", error);
    return NextResponse.json({ error: "Erreur lors de la verification MonCash" }, { status: 500 });
  }
}
