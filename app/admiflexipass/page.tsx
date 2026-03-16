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
  Sparkles,
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
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-3">
            Vue d'ensemble <span className="text-red-500">Admin</span> <Sparkles className="text-red-500" size={32} />
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs mt-1">
            Hub d'Intelligence d'Affaires FlexiPass
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-4 bg-[#1e1e2e] border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20"
          >
            <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl flex items-center gap-3 text-red-500">
            <Zap size={20} fill="currentColor" className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchro en temps réel active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-zinc-100 flex items-center gap-3">
            Flux Prioritaire
          </h2>
          <Link 
            href="/admiflexipass/orders" 
            className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        
        <OrderTable 
          orders={recentOrders} 
          onView={handleViewOrder} 
          isLoading={isLoading} 
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
