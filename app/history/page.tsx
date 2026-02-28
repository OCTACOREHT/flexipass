"use client";

import { Fragment, useEffect, useState } from "react";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";

type Order = {
  id: string;
  status?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  created_at?: string | null;
  order_items?: OrderItem[] | null;
};

type UserInfo = { id: string; email?: string | null };
type OrderItem = {
  id?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  product_id?: string | null;
  product_image_url?: string | null;
  product?: { title?: string | null; image_url?: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "En attente",
  paid: "Payée",
  processing: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

const getItemTitle = (item: OrderItem) =>
  item.product?.title || item.product_id || "Produit";
const getStatusClass = (status?: string | null) => {
  if (!status) return "status-unknown";
  if (status === "paid" || status === "completed") return "status-success";
  if (status === "processing") return "status-info";
  if (status === "pending_payment") return "status-warn";
  if (status === "cancelled") return "status-danger";
  return "status-unknown";
};

export default function HistoryPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toFriendlyError = (message?: string | null) => {
    if (!message) return "Impossible de charger vos commandes pour le moment.";
    const lower = message.toLowerCase();
    if (lower.includes("does not exist") || lower.includes("column") || lower.includes("product_title")) {
      return "Les détails des articles sont en cours de mise à jour. Vos commandes restent disponibles.";
    }
    return "Impossible de charger vos commandes pour le moment.";
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    const currentUser = data.user ? { id: data.user.id, email: data.user.email } : null;
    setUser(currentUser);
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const baseSelect = "id,status,total_amount,currency,created_at";
    let queryError: { message?: string } | null = null;

    let res = await supabase
      .from("orders")
      .select(
        `${baseSelect},order_items(id,quantity,unit_price,product_id,product_image_url,product:products(title,image_url))`
      )
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (res.error) {
      queryError = res.error;
      res = await supabase
        .from("orders")
        .select(baseSelect)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(50);
    }

    if (!res.data && currentUser.email) {
      const fallback = await supabase
        .from("orders")
        .select(
          `${baseSelect},order_items(id,quantity,unit_price,product_id,product_image_url,product:products(title,image_url))`
        )
        .eq("customer_email", currentUser.email)
        .order("created_at", { ascending: false })
        .limit(50);
      if (fallback.error) {
        queryError = fallback.error;
      } else {
        res = fallback as any;
      }
    }

    if (queryError && !res.data) {
      setError(toFriendlyError(queryError.message));
    } else {
      setOrders(Array.isArray(res.data) ? res.data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <>
      <HeaderMain />
      <main className="account-shell">
        <section className="account-hero">
          <div>
            <p className="hero-eyebrow">Compte</p>
            <h1>Historique</h1>
            <p>Suivez vos achats et l'état de vos commandes en temps réel.</p>
          </div>
          <div className="account-hero-actions">
            <a className="btn-ghost" href="/catalogue">Continuer vos achats</a>
            <a className="btn-primary" href="/settings">Paramètres</a>
          </div>
        </section>

        <section className="account-grid">
          <aside className="account-sidebar">
            <div className="account-card">
              <h3>Résumé</h3>
              <div className="account-stat">
                <span>Commandes</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="account-stat">
                <span>Statut en cours</span>
                <strong>
                  {orders.find((o) => o.status === "processing") ? "En cours" : "Aucun"}
                </strong>
              </div>
              <div className="account-divider" />
              <a className="link" href="/settings">Paramètres du compte</a>
            </div>
          </aside>

          <div className="account-main">
            {loading && <div className="account-card">Chargement...</div>}

            {!loading && !user && (
              <div className="account-card account-empty">
                <div className="account-empty-icon">
                  <i className="ri-lock-line" />
                </div>
                <h3>Connexion requise</h3>
                <p className="muted">Connectez-vous pour voir votre historique.</p>
                <a className="btn-ghost" href="/login">Se connecter</a>
              </div>
            )}

            {!loading && user && error && (
              <div className="account-card account-empty">
                <div className="account-empty-icon">
                  <i className="ri-alert-line" />
                </div>
                <h3>Impossible de charger</h3>
                <p className="muted">{error}</p>
                  <button type="button" className="btn-ghost" onClick={() => loadOrders()}>
                    Réessayer
                  </button>
              </div>
            )}

            {!loading && user && !error && orders.length === 0 && (
              <div className="account-card account-empty">
                <div className="account-empty-icon">
                  <i className="ri-shopping-bag-3-line" />
                </div>
                <h3>Aucune commande pour l'instant</h3>
                <p className="muted">Les commandes confirmées apparaîtront ici automatiquement.</p>
                <a className="btn-primary" href="/catalogue">Explorer le catalogue</a>
              </div>
            )}

            {!loading && user && orders.length > 0 && (
              <div className="account-list">
                {orders.map((o) => (
                  <div className="order-card" key={o.id}>
                    <div className="order-head">
                      <div>
                        <div className="order-id">{o.id}</div>
                        <div className="order-date">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <span className={`status-pill ${getStatusClass(o.status)}`}>
                        {o.status ? (STATUS_LABELS[o.status] ?? o.status) : "—"}
                      </span>
                    </div>
                    <div className="order-meta">
                      <div>
                        <span>Total</span>
                        <strong>
                          {o.total_amount ?? 0} {o.currency ?? "HTG"}
                        </strong>
                      </div>
                      <button type="button" className="ghost-btn" onClick={() => setSelected(o)}>
                        Voir détails
                      </button>
                    </div>
                    {Array.isArray(o.order_items) && o.order_items.length > 0 && (
                      <div className="order-items">
                        {o.order_items.map((item, idx) => (
                          <div className="order-item" key={item.id ?? `${o.id}-${idx}`}>
                            <div>
                              <div className="order-item-title">{getItemTitle(item)}</div>
                              <div className="order-item-meta">
                                x{item.quantity ?? 1} • {item.unit_price ?? 0} {o.currency ?? "HTG"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterMain />

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
                  <div className="admin-detail-value">
                    {selected.status ? (STATUS_LABELS[selected.status] ?? selected.status) : "—"}
                  </div>
                </div>
                <div>
                  <div className="admin-detail-label">Total</div>
                  <div className="admin-detail-value">
                    {selected.total_amount ?? 0} {selected.currency ?? "HTG"}
                  </div>
                </div>
                <div>
                  <div className="admin-detail-label">Date</div>
                  <div className="admin-detail-value">
                    {selected.created_at ? new Date(selected.created_at).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {Array.isArray(selected.order_items) && selected.order_items.length > 0 && (
                <div className="admin-items">
                  {selected.order_items.map((item, idx) => (
                    <div className="admin-item-line" key={item.id ?? `${selected.id}-${idx}`}>
                      <span>{getItemTitle(item)}</span>
                      <span className="muted">x{item.quantity ?? 1}</span>
                      <span className="muted">
                        {item.unit_price ?? 0} {selected.currency ?? "HTG"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}





