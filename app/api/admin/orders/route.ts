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
  return NextResponse.json({ grouped: groupedArr, pending_payment: pendingCount ?? 0 });
}
