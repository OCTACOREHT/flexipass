import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const RATE = 145;

export async function GET() {
  const supabase = supabaseAdmin();
  let updatedProducts = 0;
  let updatedVariants = 0;

  // 1. Fetch all products
  const { data: products } = await supabase
    .from("products")
    .select("id,price,currency");

  if (products) {
    for (const p of products) {
      if ((p.currency || "").toUpperCase() === "USD") {
        const newPrice = Math.round(Number(p.price) * RATE);
        await supabase
          .from("products")
          .update({ price: newPrice, currency: "HTG" })
          .eq("id", p.id);
        updatedProducts++;
      }
    }
  }

  // 2. Fetch all variants
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,price,currency");

  if (variants) {
    for (const v of variants) {
      if ((v.currency || "").toUpperCase() === "USD") {
        const newPrice = Math.round(Number(v.price) * RATE);
        await supabase
          .from("product_variants")
          .update({ price: newPrice, currency: "HTG" })
          .eq("id", v.id);
        updatedVariants++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    rate: RATE,
    updatedProducts,
    updatedVariants,
  });
}
