import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const supabase = supabaseAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,title,type,price,currency,active,plan,duration_days,short_description,image_url,service_name,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,product_id,label,duration_days,price,currency,active,display_order")
    .order("display_order", { ascending: true });

  return NextResponse.json({ products, variants: variants ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .insert({
      title: body.title,
      type: body.type,
      price: body.price,
      currency: body.currency || "HTG",
      plan: body.plan,
      duration_days: body.duration_days,
      service_name: body.service_name || body.title,
      short_description: body.short_description || null,
      image_url: body.image_url || null,
      giftcard_brand_id: body.giftcard_brand_id,
      max_quantity_per_order: body.max_quantity_per_order || 10,
      active: body.active ?? true,
      description: body.description,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const body = await request.json();
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({
      title: body.title,
      type: body.type,
      price: body.price,
      currency: body.currency || "HTG",
      plan: body.plan,
      duration_days: body.duration_days,
      service_name: body.service_name || body.title,
      short_description: body.short_description || null,
      image_url: body.image_url || null,
      active: body.active ?? true,
      description: body.description,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: id });
}

