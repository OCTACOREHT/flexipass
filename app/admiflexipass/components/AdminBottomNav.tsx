"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Users, 
  Settings,
  Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/app/admiflexipass/components/Badge";

const navItems = [
  { name: "Tableau de Bord", href: "/admiflexipass", icon: LayoutDashboard, permissionKey: "dashboard" },
  { name: "Analyses", href: "/admiflexipass/analytics", icon: TrendingUp, permissionKey: "dashboard" },
  { name: "Commandes", href: "/admiflexipass/orders", icon: Package, showBadge: true, permissionKey: "orders" },
  { name: "Catalogue", href: "/admiflexipass/stock", icon: Package, permissionKey: "stock" },
  { name: "Membres", href: "/admiflexipass/users", icon: Users, permissionKey: "users" },
];

export default function AdminBottomNav({ admin }: { admin?: any }) {
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!supabase) return;
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    if (supabase) {
      const channel = supabase
        .channel("orders_status_changes_bottom")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => fetchPendingCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (!admin) return false;
    if (admin.role === "superadmin") return true;
    if (item.permissionKey) {
      return admin.permissions?.[item.permissionKey] !== false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#efe5d9] z-50 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {visibleItems.slice(0, 5).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${
              isActive 
                ? "text-[#ff6a1a]" 
                : "text-zinc-400 hover:text-[#ff6a1a] hover:bg-orange-50/50"
            }`}
          >
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-[#ff6a1a] rounded-b-full shadow-[0_0_8px_rgba(255,106,26,0.6)]" />
            )}
            <item.icon size={22} className={`mb-1 transition-transform ${isActive ? "scale-110" : "scale-100"}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-tight text-center leading-none">
              {item.name}
            </span>
            {item.showBadge && pendingCount > 0 && (
              <div className="absolute top-1 right-2 animate-bounce">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
