import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .order("status", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const grouped: Record<string, number> = {};
  (data || []).forEach((r) => {
    const s = (r as any).status || "unknown";
    grouped[s] = (grouped[s] || 0) + 1;
  });
  const groupedArr = Object.entries(grouped).map(([status, count]) => ({ status, count }));

  const { count: pendingCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending_payment");
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 400 });

  return NextResponse.json({ grouped: groupedArr, pending_payment: pendingCount ?? 0, orders: orders ?? [] });
}

export async function PATCH(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }, { status: 500 });
  }
  const body = await request.json();
  const id = body?.id;
  const status = body?.status;
  if (!id || !status) return NextResponse.json({ error: "id ou status manquant" }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

