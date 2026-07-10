"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatCard from "./components/StatCard";
import OrderTable from "./components/OrderTable";
import OrderModal from "./components/OrderModal";
import { Order } from "./components/OrderRow";
import { 
  DollarSign, 
  Clock, 
  Users, 
  Layers, 
  ArrowRight,
  Zap,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    activeProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const { data: salesData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed");
      
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true });

      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .eq("active", true);

      const totalSalesValue = salesData?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

      setStats({
        totalSales: totalSalesValue,
        pendingApprovals: pendingCount || 0,
        totalUsers: userCount || 0,
        activeProducts: productCount || 0
      });

      const { data: pending, error: pendingError } = await supabase
        .from("orders")
        .select(`
          *,
          userProfile:users (
            name,
            email
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (pendingError) {
        console.warn("Jointure Dashboard échouée, fallback sur requête simple:", pendingError.message);
        const { data: simpleData, error: simpleError } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (simpleError) throw simpleError;
        
        const safeFormatted = (simpleData || []).map((o: any) => ({
          ...o,
          email: o.customer_email || "Inconnu",
          user_name: o.customer_name || "Client"
        }));
        setRecentOrders(safeFormatted);
      } else {
        const formatted = (pending || []).map((o: any) => ({
          ...o,
          email: o.userProfile?.email || o.customer_email || "Inconnu",
          user_name: o.userProfile?.name || o.customer_name || "Client"
        }));
        setRecentOrders(formatted);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time synchronization
    const channel = supabase
      .channel("dashboard_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => fetchDashboardData())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-3">
            Tableau de bord <span className="text-[#ff6a1a]">Admin</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide text-sm mt-1">
            Gérez vos commandes, produits et utilisateurs en toute simplicité.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#efe5d9] text-zinc-600 rounded-xl hover:text-[#ff6a1a] hover:bg-zinc-50 hover:border-orange-200 transition-all shadow-sm font-semibold text-sm"
            title="Rafraîchir les données"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <div
        className="gap-4 w-full"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <StatCard 
          title="Chiffre d'Affaires Total" 
          value={`${stats.totalSales.toLocaleString()} HTG`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="File d'Attente" 
          value={stats.pendingApprovals} 
          icon={Clock} 
          trend={`${stats.pendingApprovals} à vérifier`}
          trendUp={false}
        />
        <StatCard 
          title="Base Utilisateurs" 
          value={stats.totalUsers} 
          icon={Users} 
        />
        <StatCard 
          title="SKUs au Catalogue" 
          value={stats.activeProducts} 
          icon={Layers} 
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-[#2f2a33] tracking-tight">
            Flux Prioritaire
          </h2>
          <Link 
            href="/admiflexipass/orders" 
            className="px-4 py-2 bg-white border border-[#efe5d9] hover:bg-zinc-50 hover:border-orange-200 rounded-xl text-zinc-600 hover:text-[#ff6a1a] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        
        <OrderTable 
          orders={recentOrders} 
          onView={handleViewOrder} 
          isLoading={isLoading} 
          onRefresh={fetchDashboardData}
        />
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        order={selectedOrder} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
