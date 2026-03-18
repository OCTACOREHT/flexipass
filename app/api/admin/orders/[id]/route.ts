import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseAdmin();
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const { data, error } = await supabase
    .from("orders")
    .select("*,order_items(id,quantity,price,unit_price,product_id)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data });
}
