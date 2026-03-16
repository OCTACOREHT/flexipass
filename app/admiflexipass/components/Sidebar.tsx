"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/app/admiflexipass/components/Badge";

const navItems = [
  { name: "Tableau de Bord", href: "/admiflexipass", icon: LayoutDashboard },
  { name: "Commandes", href: "/admiflexipass/orders", icon: Package, showBadge: true },
  { name: "Catalogue Produits", href: "/admiflexipass/stock", icon: TrendingUp },
  { name: "Liste Membres", href: "/admiflexipass/users", icon: Users },
  { name: "Paramètres", href: "/admiflexipass/settings", icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for safety
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Expand by default on desktop
    if (window.innerWidth > 1024) {
      setIsCollapsed(false);
    }
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // Real-time subscription for orders
    const channel = supabase
      .channel("orders_status_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_authed");
    window.location.href = "/admiflexipass";
  };

  return (
    <aside 
      className={`bg-[#0f0f23] text-zinc-400 h-screen transition-all duration-300 border-r border-zinc-800 fixed left-0 top-0 z-50 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6 flex items-center justify-between border-b border-zinc-800">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            FlexiPass
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-zinc-800 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-all group relative ${
                isActive 
                  ? "bg-red-500/10 text-red-500" 
                  : "hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <item.icon size={22} className={isActive ? "text-red-500" : "group-hover:text-zinc-200"} />
              {!isCollapsed && (
                <span className="ml-4 font-medium">{item.name}</span>
              )}
              {item.showBadge && pendingCount > 0 && (
                <div className={`${isCollapsed ? "absolute top-1 right-2" : "ml-auto"}`}>
                  <Badge count={pendingCount} variant="danger" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-all text-zinc-500 group"
        >
          <LogOut size={22} className="group-hover:text-zinc-200" />
          {!isCollapsed && <span className="ml-4 font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
