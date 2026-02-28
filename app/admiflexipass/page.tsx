"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  price: number;
};

type Variant = {
  id: string;
  product_id: string;
};

type OrdersSummary = {
  grouped?: { status: string; count: number }[];
  pending_payment?: number;
};

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [orders, setOrders] = useState<OrdersSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    const safeJson = async (resp: Response) => {
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || resp.statusText);
      }
      return resp.json();
    };
    try {
      const [pRes, oRes, vRes] = await Promise.all([
        fetch("/api/admin/products").then(safeJson),
        fetch("/api/admin/orders").then(safeJson),
        fetch("/api/admin/variants").then(safeJson),
      ]);
      setProducts(pRes?.products ?? []);
      setOrders(oRes ?? null);
      setVariants(Array.isArray(vRes) ? vRes : []);
    } catch (err: any) {
      setError(err?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalRevenue = products.reduce((s, p) => s + Number(p.price || 0), 0);
  const totalOrders =
    orders?.grouped?.reduce((s, r) => s + Number(r.count || 0), 0) ?? 0;

  return (
    <>
      <div className="admin-hero">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-hero-sub">Vue globale des ventes, commandes et catalogue.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="btn-primary" type="button" onClick={loadDashboard}>
            Actualiser
          </button>
          {loading && <span className="muted">Chargement...</span>}
          {error && <span className="update-error">{error}</span>}
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Produits</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Variants</div>
          <div className="stat-value">{variants.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Commandes</div>
          <div className="stat-value">{totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenu estimé</div>
          <div className="stat-value">{totalRevenue} HTG</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <span>Ventes (mock)</span>
          </div>
          <div className="mini-bars big">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
              const h = 12 + (i % 6) * 12 + 18;
              return (
                <div key={m} className="bar">
                  <div className="bar-fill" style={{ height: `${h}px` }} />
                  <span>{m}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card donut-card">
          <div className="chart-head">
            <span>Commandes en attente</span>
          </div>
          <div className="donut">
            <div className="donut-inner">
              <strong>{orders?.pending_payment ?? 0}</strong>
              <span>pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Statuts commandes</h3>
          <div className="admin-stats">
            {(orders?.grouped ?? []).map((s) => (
              <div key={s.status} className="stat-pill">
                <strong>{s.status}</strong>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <h3>Actions rapides</h3>
          <div className="admin-actions">
            <a className="btn-full ghost-btn" href="/admiflexipass/products">
              Gérer les produits
            </a>
            <a className="btn-full ghost-btn" href="/admiflexipass/orders">
              Voir les commandes
            </a>
            <a className="btn-full ghost-btn" href="/admiflexipass/settings">
              Réglages
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
