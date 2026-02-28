import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id,product_id,label,duration_days,price,currency,active,display_order")
    .order("display_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const body = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: body.product_id,
      label: body.label,
      duration_days: body.duration_days,
      price: body.price,
      currency: body.currency || "HTG",
      active: body.active ?? true,
      display_order: body.display_order ?? 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

