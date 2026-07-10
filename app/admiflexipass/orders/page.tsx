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
      // Ã‰TAPE 1 : Tenter la requÃªte avec JOINTURE (plus riche)
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
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
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
        console.warn("Jointure Ã©chouÃ©e, fallback sur requÃªte simple:", error.message);
        // Ã‰TAPE 2 : FALLBACK : RequÃªte simple si la jointure Ã©choue
        let fallbackQuery = supabase
          .from("orders")
          .select("*");

        if (statusFilter === "pending") {
          fallbackQuery = fallbackQuery.eq("status", "pending");
        }

        const now = new Date();
        if (timeFilter === "today") {
          const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
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
          user_name: o.customer_name || "Client",
        }));
        setOrders(safeFormatted);
      } else {
        // Map data pour harmoniser
        const formatted = (data || []).map((o: any) => ({
          ...o,
          email: o.userProfile?.email || o.customer_email || "Inconnu",
          user_name: o.userProfile?.name || o.customer_name || "Client",
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

  const filteredOrders = orders.filter(
    (o) =>
      (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((o as any).email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((o as any).user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[#ff6a1a]">
            <Package size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2a33]">
              File de <span className="text-[#ff6a1a]">Vérification</span>
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide text-sm mt-1">
              Gérez les transactions en attente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-x-auto bg-white p-1 rounded-xl border border-[#efe5d9]">
            <button
              onClick={() => setStatusFilter("pending")}
              className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                statusFilter === "pending" ? "shadow-sm" : "text-zinc-500 hover:text-[#ff6a1a]"
              }`}
              style={statusFilter === "pending" ? { backgroundColor: "#ff6a1a", color: "white" } : {}}
            >
              En attente ({orders.filter((o) => o.status === "pending").length})
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                statusFilter === "all" ? "shadow-sm" : "text-zinc-500 hover:text-[#ff6a1a]"
              }`}
              style={statusFilter === "all" ? { backgroundColor: "#2f2a33", color: "white" } : {}}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="w-full">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Recherche par ID, Nom ou Email..." />
        </div>

        {/* FILTRES DE DATE */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#efe5d9]">
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-[#efe5d9]/60">
            {[
              { id: "all", label: "Tout" },
              { id: "today", label: "Aujourd'hui" },
              { id: "week", label: "Semaine" },
              { id: "custom", label: "Archive" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  timeFilter === f.id
                    ? "shadow-sm"
                    : "text-zinc-500 hover:text-[#ff6a1a]"
                }`}
                style={timeFilter === f.id ? { backgroundColor: "#ff6a1a", color: "white" } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          {timeFilter === "custom" && (
            <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-left-4 duration-300">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-white border border-[#efe5d9] text-zinc-700 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#ff6a1a]"
              >
                {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white border border-[#efe5d9] text-zinc-700 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-[#ff6a1a]"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-[#efe5d9] overflow-hidden">
        <OrderTable
          orders={filteredOrders}
          isLoading={isLoading}
          onView={(order) => {
            setSelectedOrder(order);
            setIsModalOpen(true);
          }}
          onRefresh={fetchOrders}
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
