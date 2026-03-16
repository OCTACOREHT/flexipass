import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin();
    const body = await request.json();

    const {
      customer_email,
      customer_name,
      user_id,
      items,
      total,
      payment_method,
      payment_proof_url = null
    } = body;

    // Creation de la commande dans la table 'orders'
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user_id,
          customer_email: customer_email,
          customer_name: customer_name,
          total_amount: total,
          status: "pending",
          payment_proof_url: payment_proof_url,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order_id: data.id }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur creation commande:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
