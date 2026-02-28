"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const AUTH_KEY = "admin_authed";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("admin_clients") : null;
      const clients = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(clients) || clients.length === 0) {
        throw new Error("Aucun client à exporter.");
      }
      const header = ["id", "name", "email", "status"];
      const rows = clients.map((c: any) => [c.id, c.name, c.email, c.status]);
      const clientSheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

      const productRes = await fetch("/api/admin/products");
      if (!productRes.ok) throw new Error(await productRes.text());
      const productData = await productRes.json();
      const products = Array.isArray(productData?.products) ? productData.products : [];
      const productHeader = ["id", "title", "type", "price", "currency", "plan", "active"];
      const productRows = products.map((p: any) => [
        p.id,
        p.title,
        p.type,
        p.price,
        p.currency,
        p.plan ?? "",
        p.active ? "yes" : "no",
      ]);
      const productSheet = XLSX.utils.aoa_to_sheet([productHeader, ...productRows]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, clientSheet, "Clients");
      XLSX.utils.book_append_sheet(workbook, productSheet, "Produits");
      const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flexipass-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSuccess("Export multi-onglets prêt.");
    } catch (err: any) {
      setError(err?.message || "Erreur export");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "/admiflexipass";
  };

  return (
    <>
      <div className="section-head">
        <h2>Réglages</h2>
        <div className="head-actions">
          {loading && <span>Chargement...</span>}
          {error && <span className="update-error">{error}</span>}
          {success && <span className="update-success">{success}</span>}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Exports & maintenance</h3>
          <p className="muted">Téléchargez un export Excel multi-onglets (Clients + Produits).</p>
          <div className="admin-actions">
            <button type="button" onClick={handleExportAll} disabled={loading}>
              {loading ? "Export..." : "Exporter (Clients + Produits)"}
            </button>
          </div>
        </div>
        <div className="admin-card">
          <h3>Session</h3>
          <p className="muted">Déconnectez-vous de l’interface admin.</p>
          <div className="admin-actions">
            <button className="ghost-btn" type="button" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}



