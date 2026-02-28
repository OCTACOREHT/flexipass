"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  status?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  created_at?: string | null;
  customer_email?: string | null;
};

type OrdersSummary = {
  grouped?: { status: string; count: number }[];
  pending_payment?: number;
  orders?: Order[];
};

export default function AdminOrdersPage() {
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummary(data ?? null);
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (err: any) {
      setError(err?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadOrders();
    } catch (err: any) {
      setError(err?.message || "Erreur de mise à jour");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <>
      <div className="admin-hero">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-title">Commandes</h1>
          <p className="admin-hero-sub">Gérez les statuts et suivez les commandes récentes.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="btn-primary" type="button" onClick={loadOrders}>
            Actualiser
          </button>
          {loading && <span className="muted">Chargement...</span>}
          {error && <span className="update-error">{error}</span>}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Résumé</h3>
          <div className="admin-stats">
            <div className="stat-pill">
              <strong>pending_payment</strong>
              <span>{summary?.pending_payment ?? 0}</span>
            </div>
            {(summary?.grouped ?? []).map((s) => (
              <div key={s.status} className="stat-pill">
                <strong>{s.status}</strong>
                <span>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card wide">
          <h3>Liste des commandes</h3>
          <div className="admin-table">
            <div className="admin-row head" style={{ gridTemplateColumns: "1.1fr 0.8fr 0.8fr 0.8fr 0.8fr" }}>
              <span>ID</span>
              <span>Statut</span>
              <span>Total</span>
              <span>Date</span>
              <span>Actions</span>
            </div>
            {orders.length === 0 && <div className="admin-empty">Aucune commande pour le moment.</div>}
            {orders.map((o) => (
              <div
                className="admin-row"
                key={o.id}
                style={{ gridTemplateColumns: "1.1fr 0.8fr 0.8fr 0.8fr 0.8fr" }}
              >
                <span>{o.id}</span>
                <span>{o.status ?? "—"}</span>
                <span>{o.total_amount ?? 0} {o.currency ?? "HTG"}</span>
                <span>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</span>
                <span>
                  <div className="admin-inline">
                    <button type="button" className="link" onClick={() => setSelected(o)}>
                      Détails
                    </button>
                    <select
                      value={o.status ?? "pending_payment"}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={savingId === o.id}
                    >
                      <option value="pending_payment">pending_payment</option>
                      <option value="paid">paid</option>
                      <option value="processing">processing</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Détails de la commande</h3>
              <button className="icon-btn ghost" aria-label="Fermer" onClick={() => setSelected(null)}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-detail-grid">
                <div>
                  <div className="admin-detail-label">ID</div>
                  <div className="admin-detail-value">{selected.id}</div>
                </div>
                <div>
                  <div className="admin-detail-label">Statut</div>
                  <div className="admin-detail-value">{selected.status ?? "—"}</div>
                </div>
                <div>
                  <div className="admin-detail-label">Total</div>
                  <div className="admin-detail-value">{selected.total_amount ?? 0} {selected.currency ?? "HTG"}</div>
                </div>
                <div>
                  <div className="admin-detail-label">Date</div>
                  <div className="admin-detail-value">
                    {selected.created_at ? new Date(selected.created_at).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <div className="admin-detail-label">Client</div>
                  <div className="admin-detail-value">{selected.customer_email ?? "—"}</div>
                </div>
              </div>
              <div className="admin-json">
                <pre>{JSON.stringify(selected, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



