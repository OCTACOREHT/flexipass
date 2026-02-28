"use client";

import { useEffect, useState } from "react";

type Product = { id: string; type: "account" | "giftcard"; price: number };
type Variant = { id: string };
type OrdersSummary = { grouped?: { status: string; count: number }[] };

export default function AdminStatsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [orders, setOrders] = useState<OrdersSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
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
    loadStats();
  }, []);

  const giftcards = products.filter((p) => p.type === "giftcard").length;
  const accounts = products.filter((p) => p.type === "account").length;

  return (
    <>
      <div className="section-head">
        <h2>Stats</h2>
        <div className="head-actions">
          <button className="ghost-btn" type="button" onClick={loadStats}>
            Actualiser
          </button>
          {loading && <span>Chargement...</span>}
          {error && <span className="update-error">{error}</span>}
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Produits Giftcard</div>
          <div className="stat-value">{giftcards}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Produits Abonnement</div>
          <div className="stat-value">{accounts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Variants</div>
          <div className="stat-value">{variants.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total commandes</div>
          <div className="stat-value">
            {orders?.grouped?.reduce((s, r) => s + Number(r.count || 0), 0) ?? 0}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <span>Répartition produits</span>
          </div>
          <div className="donut" style={{ background: "conic-gradient(#111 0deg, #111 180deg, #ff8a00 180deg 360deg)" }}>
            <div className="donut-inner">
              <strong>{products.length}</strong>
              <span>items</span>
            </div>
          </div>
          <div className="admin-legend">
            <span><i className="legend-dot dark" /> Abonnements</span>
            <span><i className="legend-dot orange" /> Giftcards</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <span>Statuts commandes</span>
          </div>
          <div className="admin-stats">
            {(orders?.grouped ?? []).map((s) => (
              <div key={s.status} className="stat-pill">
                <strong>{s.status}</strong>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


