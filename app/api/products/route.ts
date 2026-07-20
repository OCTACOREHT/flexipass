import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const RATE = 145;

export async function GET() {
  const supabase = supabaseAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,type,price,currency,active,plan,duration_days,short_description,description,image_url,service_name,created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,product_id,label,duration_days,price,currency,active,display_order")
    .eq("active", true)
    .order("display_order", { ascending: true });

  const variantMap = new Map<string, any[]>();
  (variants || []).forEach((v) => {
    const isUsd = (v.currency || "").toUpperCase() === "USD";
    const convertedPrice = isUsd ? Math.round(Number(v.price) * RATE) : Number(v.price);
    const convertedCurrency = "HTG";
    const item = {
      ...v,
      price: convertedPrice,
      currency: convertedCurrency,
    };
    const arr = variantMap.get(v.product_id) || [];
    arr.push(item);
    variantMap.set(v.product_id, arr);
  });

  const merged = (products || []).map((p) => {
    const isUsd = (p.currency || "").toUpperCase() === "USD";
    const convertedPrice = isUsd ? Math.round(Number(p.price) * RATE) : Number(p.price);
    const convertedCurrency = "HTG";
    return {
      ...p,
      price: convertedPrice,
      currency: convertedCurrency,
      variants: variantMap.get(p.id) || [],
    };
  });

  return NextResponse.json(merged);
}
