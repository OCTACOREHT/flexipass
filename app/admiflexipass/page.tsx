"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  type: "account" | "giftcard";
  price: number;
  currency: string;
  active: boolean;
  plan?: string | null;
  duration_days?: number | null;
};

const ADMIN_EMAIL = "adminflexipass@gmail.com";
const ADMIN_PASSWORD = "Fl$xip@ss@2k2^";

export default function AdminFlexiPassPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [statusSummary, setStatusSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_authed") === "yes") {
      setAuthed(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const safeJson = async (resp: Response) => {
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || resp.statusText);
      }
      try {
        return await resp.json();
      } catch {
        return null;
      }
    };
    try {
    const [pRes, oRes, vRes] = await Promise.all([
      fetch("/api/admin/products").then(safeJson),
      fetch("/api/admin/orders").then(safeJson),
      fetch("/api/admin/variants").then(safeJson),
    ]);
    setProducts(pRes?.products ?? []);
    setStatusSummary(oRes ?? null);
    setVariants(pRes?.variants ?? vRes ?? []);
  } catch (err: any) {
    setError(err?.message || "Erreur de chargement");
  } finally {
    setLoading(false);
  }
  };

  const filteredProducts = products.filter((p) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      await loadData();
      setSuccess("Produit supprimé");
    } catch (err: any) {
      setError(err?.message || "Suppression échouée");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("admin_authed", "yes");
      loadData();
      setError(null);
    } else {
      setError("Identifiants invalides");
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/admin/seed", { method: "POST" });
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Erreur seed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (formData: FormData) => {
    const name = String(formData.get("name") || "");
    const description = String(formData.get("description") || "");
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    await loadData();
  };

  const handleAddProduct = async (formData: FormData) => {
    const payload = {
      title: String(formData.get("title") || ""),
      type: String(formData.get("type") || "account"),
      price: Number(formData.get("price") || 0),
      currency: "HTG",
      plan: formData.get("plan") || null,
      duration_days: formData.get("duration_days") ? Number(formData.get("duration_days")) : null,
      service_id: formData.get("service_id") || null,
    };
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadData();
  };

  if (!authed) {
    return (
      <main className="update-wrapper">
        <div className="update-card" style={{ maxWidth: 420 }}>
          <h1>Accès admin</h1>
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Mot de passe
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit">Se connecter</button>
          </form>
          {error && <p className="update-error">{error}</p>}
          <p className="update-success">Email par défaut : {ADMIN_EMAIL}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-head">
          <div className="logo-dot">⋮⋮</div>
          <span>FlexiPass Admin</span>
        </div>
        <nav>
          <a className="side-link active"><i className="ri-home-4-line" />Accueil</a>
          <a className="side-link"><i className="ri-shopping-bag-3-line" />Produits</a>
          <a className="side-link"><i className="ri-list-ordered" />Commandes</a>
          <a className="side-link"><i className="ri-customer-service-2-line" />Clients</a>
          <a className="side-link"><i className="ri-pie-chart-2-line" />Stats</a>
          <a className="side-link"><i className="ri-settings-3-line" />Réglages</a>
        </nav>
      </aside>

      <section className="admin-main">
        <div className="section-head">
          <h2>Dashboard Admin</h2>
          <div className="head-actions">
            <button className="ghost-btn" onClick={handleSeed}>Seed demo</button>
            {loading && <span>Chargement...</span>}
            {error && <span className="update-error">{error}</span>}
            {success && <span className="update-success">{success}</span>}
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
          <div className="stat-value">{statusSummary?.grouped?.reduce((s: number, r: any) => s + Number(r.count || 0), 0) ?? 0}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Revenu estimé</div>
            <div className="stat-value">{products.reduce((s, p) => s + Number(p.price || 0), 0)} HTG</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-head">
              <span>Ventes (mock)</span>
            </div>
            <div className="mini-bars big">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
                const h = 10 + (i % 6) * 15 + 20;
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
              <span>Produits actifs</span>
            </div>
            <div className="donut">
              <div className="donut-inner">
                <strong>{products.length}</strong>
                <span>actifs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Statuts commandes</h3>
            <div className="admin-stats">
              {(statusSummary?.grouped ?? []).map((s: any) => (
                <div key={s.status} className="stat-pill">
                  <strong>{s.status}</strong>
                  <span>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h3>Ajouter un produit</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSuccess(null);
                setError(null);
                setLoading(true);
                try {
                  await handleAddProduct(new FormData(e.currentTarget));
                  setSuccess("Produit créé");
                  e.currentTarget.reset();
                } catch (err: any) {
                  setError(err?.message || "Création échouée");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label>
                Titre
                <input name="title" required />
              </label>
              <label>
                Type
                <select name="type">
                  <option value="account">Compte / Abonnement</option>
                  <option value="giftcard">Giftcard</option>
                </select>
              </label>
              <label>
                Prix (HTG)
                <input name="price" type="number" step="0.01" required />
              </label>
              <label>
                Plan
                <input name="plan" placeholder="Premium, Pro, etc." />
              </label>
              <label>
                Durée (jours)
                <input name="duration_days" type="number" />
              </label>
              <label>
                Image URL
                <input name="image_url" placeholder="https://..." />
              </label>
              <label>
                Description courte
                <input name="short_description" placeholder="Résumé produit" />
              </label>
              <button type="submit">Créer</button>
            </form>
          </div>

          <div className="admin-card wide">
            <h3>Produits (liste)</h3>
            <div className="admin-table">
              <div className="admin-table-head">
                <input
                  className="admin-search"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="admin-row head">
                <span>Titre</span>
                <span>Type</span>
                <span>Prix</span>
                <span>Plan</span>
                <span>Actif</span>
                <span>Variants</span>
                <span>Détails</span>
                <span>Actions</span>
              </div>
              {filteredProducts.map((p) => (
                <div className="admin-row" key={p.id}>
                  <span>{p.title}</span>
                  <span>{p.type}</span>
                  <span>
                    {p.price} {p.currency}
                  </span>
                  <span>{p.plan || "-"}</span>
                  <span>{p.active ? "Oui" : "Non"}</span>
                  <span className="muted">{variants.filter((v) => v.product_id === p.id).length}</span>
                  <span>
                    <a className="link" href={`/product/${p.id}`} target="_blank">
                      Voir
                    </a>
                  </span>
                  <span>
                    <button className="link danger" onClick={() => handleDeleteProduct(p.id)}>
                      Supprimer
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
