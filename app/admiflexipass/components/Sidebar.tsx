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
  LogOut,
  Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Badge from "@/app/admiflexipass/components/Badge";

const navItems = [
  { name: "Tableau de Bord", href: "/admiflexipass", icon: LayoutDashboard, permissionKey: "dashboard" },
  { name: "Commandes", href: "/admiflexipass/orders", icon: Package, showBadge: true, permissionKey: "orders" },
  { name: "Catalogue Produits", href: "/admiflexipass/stock", icon: TrendingUp, permissionKey: "stock" },
  { name: "Liste Membres", href: "/admiflexipass/users", icon: Users, permissionKey: "users" },
  { name: "Paramètres", href: "/admiflexipass/settings", icon: Settings, permissionKey: "settings" },
  { name: "Gestion Admins", href: "/admiflexipass/admins", icon: Shield, permissionKey: "admins" },
];

export default function Sidebar({ admin }: { admin?: any }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth <= 1024;
  });
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  // 1. Fetch pending orders count and subscribe to updates
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
    }
  }, []);

  // 2. Client-side security redirection based on permissions
  useEffect(() => {
    if (admin) {
      const currentItem = navItems.find((item) => pathname === item.href);
      if (currentItem && currentItem.permissionKey && admin.role !== "superadmin") {
        const hasAccess = admin.permissions?.[currentItem.permissionKey] !== false;
        if (!hasAccess) {
          // Find the first tab they have access to
          const firstAllowed = navItems.find(
            (item) => admin.permissions?.[item.permissionKey] !== false
          );
          if (firstAllowed) {
            window.location.href = firstAllowed.href;
          } else {
            window.location.href = "/admin-login";
          }
        }
      }
    }
  }, [pathname, admin]);

  const handleLogout = async () => {
    try {
      await fetch("/admiflexipass/logout", { method: "POST" });
    } catch (error) {
      console.warn("Logout failed", error);
    }
    window.location.href = "/admin-login";
  };

  // 3. Filter menu items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (!admin) return false;
    // SuperAdmin has full access to all sections
    if (admin.role === "superadmin") return true;
    
    // Check permission key
    if (item.permissionKey) {
      return admin.permissions?.[item.permissionKey] !== false;
    }
    return true;
  });

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
        {visibleItems.map((item) => {
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

      {/* Admin Name/Role Indicator */}
      {admin && !isCollapsed && (
        <div className="px-6 py-3 border-t border-zinc-800 flex flex-col gap-0.5">
          <p className="text-[11px] font-bold text-white truncate">{admin.name}</p>
          <p className="text-[9px] font-semibold text-red-500/80 uppercase tracking-widest">{admin.role}</p>
        </div>
      )}

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
