import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = supabaseAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,type,price,currency,active,plan,duration_days,short_description,image_url,service_name")
    .eq("active", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,product_id,label,duration_days,price,currency,active,display_order")
    .eq("active", true)
    .order("display_order", { ascending: true });

  const variantMap = new Map<string, any[]>();
  (variants || []).forEach((v) => {
    const arr = variantMap.get(v.product_id) || [];
    arr.push(v);
    variantMap.set(v.product_id, arr);
  });

  const merged = (products || []).map((p) => ({
    ...p,
    variants: variantMap.get(p.id) || [],
  }));

  return NextResponse.json(merged);
}

