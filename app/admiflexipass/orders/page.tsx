"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OrderTable from "@/app/admiflexipass/components/OrderTable";
import OrderModal from "@/app/admiflexipass/components/OrderModal";
import SearchInput from "@/app/admiflexipass/components/SearchInput";
import SuccessToast from "@/app/admiflexipass/components/SuccessToast";
import { Package, RefreshCcw, Sparkles } from "lucide-react";
import { Order } from "@/app/admiflexipass/components/OrderRow";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"pending" | "all">("pending");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month" | "year" | "custom">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ROBUST FETCH: Handles empty state and network errors without crashing
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // ÉTAPE 1 : Tenter la requête avec JOINTURE (plus riche)
      let query = supabase
        .from("orders")
        .select(`
          *,
          userProfile:users (
            name,
            email
          )
        `);

      // Filtre Statut
      if (statusFilter === "pending") {
        query = query.eq("status", "pending");
      }

      // Filtre Temps
      const now = new Date();
      if (timeFilter === "today") {
        const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
        query = query.gte("created_at", startOfDay);
      } else if (timeFilter === "week") {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", lastWeek);
      } else if (timeFilter === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte("created_at", startOfMonth);
      } else if (timeFilter === "year") {
        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
        query = query.gte("created_at", startOfYear);
      } else if (timeFilter === "custom") {
        const start = new Date(selectedYear, selectedMonth, 1).toISOString();
        const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
        query = query.gte("created_at", start).lte("created_at", end);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.warn("Jointure échouée, fallback sur requête simple:", error.message);
        // ÉTAPE 2 : FALLBACK : Requête simple si la jointure échoue
        let fallbackQuery = supabase
          .from("orders")
          .select("*");

        if (statusFilter === "pending") {
          fallbackQuery = fallbackQuery.eq("status", "pending");
        }

        const now = new Date();
        if (timeFilter === "today") {
          const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
          fallbackQuery = fallbackQuery.gte("created_at", startOfDay);
        } else if (timeFilter === "week") {
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          fallbackQuery = fallbackQuery.gte("created_at", lastWeek);
        } else if (timeFilter === "month") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          fallbackQuery = fallbackQuery.gte("created_at", startOfMonth);
        } else if (timeFilter === "year") {
          const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
          fallbackQuery = fallbackQuery.gte("created_at", startOfYear);
        } else if (timeFilter === "custom") {
          const start = new Date(selectedYear, selectedMonth, 1).toISOString();
          const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
          fallbackQuery = fallbackQuery.gte("created_at", start).lte("created_at", end);
        }

        const { data: simpleData, error: simpleError } = await fallbackQuery.order("created_at", { ascending: false });
        
        if (simpleError) throw simpleError;
        
        const safeFormatted = (simpleData || []).map((o: any) => ({
          ...o,
          email: o.customer_email || "Inconnu",
          user_name: o.customer_name || "Client"
        }));
        setOrders(safeFormatted);
      } else {
        // Map data pour harmoniser
        const formatted = (data || []).map((o: any) => ({
          ...o,
          email: o.userProfile?.email || o.customer_email || "Inconnu",
          user_name: o.userProfile?.name || o.customer_name || "Client"
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error("Critical Fetch Error:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, statusFilter, timeFilter]);

  useEffect(() => {
    fetchOrders();

    let channel: any;
    const setupRealtime = () => {
      channel = supabase
        .channel("orders-live-stream")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            console.log("Realtime order update detected");
            fetchOrders();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchOrders]);
  const filteredOrders = orders.filter(o => 
    (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.user_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((o as any).email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((o as any).user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#0d0d12]/60 p-10 rounded-[2.5rem] border border-zinc-900 backdrop-blur-xl shadow-2xl shadow-black">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500 shadow-inner">
            <Package size={36} />
          </div>
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-100 italic">
              File de <span className="text-red-600">Vérification</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                Transactions en attente
              </p>
              <div className="h-1 w-1 bg-zinc-700 rounded-full"></div>
              <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[9px] flex items-center gap-2">
                <Sparkles size={12} className="animate-pulse" />
                Flux en direct actif
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchOrders}
            className="p-5 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all shadow-lg active:scale-90"
          >
            <RefreshCcw size={22} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="flex bg-zinc-900/80 p-1.5 rounded-[1.5rem] border border-zinc-800">
            <button
               onClick={() => setStatusFilter("pending")}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 statusFilter === "pending" ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
               }`}
            >
              En attente ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
               onClick={() => setStatusFilter("all")}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 statusFilter === "all" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
               }`}
            >
              Toutes les Commandes
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full overflow-hidden">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Recherche par ID, Nom ou Email..." 
          />
        </div>
        
        {/* FILTRES DE DATE */}
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 backdrop-blur-md">
          <div className="flex bg-zinc-800/50 p-1 rounded-xl border border-zinc-700/50">
            {[
              { id: "all", label: "Tout" },
              { id: "today", label: "Aujourd'hui" },
              { id: "week", label: "Semaine" },
              { id: "custom", label: "Archive" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeFilter === f.id 
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/20" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {timeFilter === "custom" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-red-500"
              >
                {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-red-500"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0d0d12] rounded-[3rem] border border-zinc-800/50 overflow-hidden shadow-2xl">
         <OrderTable 
            orders={filteredOrders} 
            isLoading={isLoading} 
            onView={(order) => { setSelectedOrder(order); setIsModalOpen(true); }}
          />
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        order={selectedOrder} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setToast({ message: "Commande traitée avec succès", type: "success" });
        }}
      />

      {toast && (
        <SuccessToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

