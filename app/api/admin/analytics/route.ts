import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }
  const supabase = supabaseAdmin();
  
  // 1. Fetch Orders to group by customer
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, customer_email, customer_name, total_amount, created_at");

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 400 });
  }

  // 2. Fetch Order Items to group by product
  // In a real app we might join, but Supabase JS makes it tricky to join downwards and group.
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity, products(title)");

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  // Process top customers
  const customersMap: Record<string, { email: string; name: string; totalSpent: number; orderCount: number }> = {};
  (orders || []).forEach((o: any) => {
    const email = o.customer_email;
    if (!email) return;
    if (!customersMap[email]) {
      customersMap[email] = { email, name: o.customer_name || email.split("@")[0], totalSpent: 0, orderCount: 0 };
    }
    customersMap[email].totalSpent += Number(o.total_amount || 0);
    customersMap[email].orderCount += 1;
  });

  const topCustomers = Object.values(customersMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Process top products
  const productsMap: Record<string, { id: string; title: string; quantity: number }> = {};
  (orderItems || []).forEach((i: any) => {
    const pId = i.product_id;
    if (!pId) return;
    if (!productsMap[pId]) {
      const title = Array.isArray(i.products) ? i.products[0]?.title : i.products?.title;
      productsMap[pId] = { id: pId, title: title || "Produit Inconnu", quantity: 0 };
    }
    productsMap[pId].quantity += Number(i.quantity || 1);
  });

  const topProducts = Object.values(productsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Process monthly revenue (last 6 months)
  const monthlyData: Record<string, { month: string; revenue: number; orders: number }> = {};
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  
  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyData[key] = { month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, revenue: 0, orders: 0 };
  }

  (orders || []).forEach((o: any) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyData[key]) {
      monthlyData[key].revenue += Number(o.total_amount || 0);
      monthlyData[key].orders += 1;
    }
  });

  const revenueChart = Object.values(monthlyData);

  return NextResponse.json({
    topCustomers,
    topProducts,
    revenueChart
  });
}
