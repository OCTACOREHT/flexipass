"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admiflexipass", label: "Dashboard", icon: "ri-home-4-line" },
  { href: "/admiflexipass/products", label: "Produits", icon: "ri-shopping-bag-3-line" },
  { href: "/admiflexipass/orders", label: "Commandes", icon: "ri-list-ordered" },
  { href: "/admiflexipass/clients", label: "Clients", icon: "ri-customer-service-2-line" },
  { href: "/admiflexipass/stats", label: "Stats", icon: "ri-pie-chart-2-line" },
  { href: "/admiflexipass/settings", label: "Réglages", icon: "ri-settings-3-line" },
];

type AdminShellProps = {
  children: React.ReactNode;
  onLogout: () => void;
};

export default function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("admin_theme") === "dark"
  );

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_theme", next ? "dark" : "light");
      }
      return next;
    });
  };

  return (
    <main className={`admin-shell${darkMode ? " admin-dark" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-head">
          <div className="logo-dot">F</div>
          <div>
            <strong>FlexiPass</strong>
            <span className="sidebar-sub">Administration</span>
          </div>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`side-link ${pathname === item.href ? "active" : ""}`}
            >
              <i className={item.icon} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar">
          <div>
            <div className="admin-eyebrow">Espace Admin</div>
            <h1 className="admin-title">FlexiPass</h1>
          </div>
          <div className="admin-topbar-actions">
            <button type="button" className="ghost-btn admin-theme-toggle" onClick={toggleTheme}>
              <i className={darkMode ? "ri-sun-line" : "ri-moon-line"} />
              {darkMode ? "Mode clair" : "Mode sombre"}
            </button>
            <button type="button" className="ghost-btn admin-logout" onClick={onLogout}>
              <i className="ri-logout-box-r-line" />
              Déconnexion
            </button>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}






