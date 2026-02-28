"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Toaster from "@/components/admin/ui/Toaster";
import { useToasts } from "@/components/admin/hooks/useToasts";

type Product = {
  id: string;
  title: string;
  type: "account" | "giftcard";
  price: number;
  currency: string;
  active: boolean;
  plan?: string | null;
  duration_days?: number | null;
  image_url?: string | null;
  short_description?: string | null;
};

type Variant = { id: string; product_id: string };

const normalizeImageUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  return `https://${trimmed}`;
};

const toProxyImage = (raw?: string | null) =>
  raw && raw.trim() ? `/api/image?url=${encodeURIComponent(raw)}` : "/assets/images/brands/chatgpt.svg";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const addFormRef = useRef<HTMLFormElement>(null);

  const { toasts, pushToast, dismissToast } = useToasts();

  const loadData = async () => {
    setLoading(true);
    const safeJson = async (resp: Response) => {
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || resp.statusText);
      }
      return resp.json();
    };
    try {
      const [pRes, vRes] = await Promise.all([
        fetch("/api/admin/products").then(safeJson),
        fetch("/api/admin/variants").then(safeJson),
      ]);
      setProducts(pRes?.products ?? []);
      setVariants(Array.isArray(vRes) ? vRes : []);
    } catch (err: any) {
      pushToast({ variant: "error", title: "Erreur", message: err?.message || "Erreur de chargement" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProduct = async (formData: FormData) => {
    const imageUrl = normalizeImageUrl(String(formData.get("image_url") || ""));
    const payload = {
      title: String(formData.get("title") || ""),
      type: String(formData.get("type") || "account"),
      price: Number(formData.get("price") || 0),
      currency: "HTG",
      plan: formData.get("plan") || null,
      duration_days: formData.get("duration_days") ? Number(formData.get("duration_days")) : null,
      service_id: formData.get("service_id") || null,
      image_url: imageUrl || null,
      short_description: formData.get("short_description") || null,
    };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    await loadData();
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editing) return;
    const imageUrl = normalizeImageUrl(String(formData.get("image_url") || ""));
    const payload = {
      id: editing.id,
      title: String(formData.get("title") || ""),
      type: String(formData.get("type") || "account"),
      price: Number(formData.get("price") || 0),
      currency: "HTG",
      plan: formData.get("plan") || null,
      duration_days: formData.get("duration_days") ? Number(formData.get("duration_days")) : null,
      image_url: imageUrl || null,
      short_description: formData.get("short_description") || null,
      active: formData.get("active") === "on",
    };
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    await loadData();
  };

  const handleDeleteProduct = async (product: Product) => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/products?id=${product.id}`, { method: "DELETE" });
      await loadData();
      pushToast({ variant: "success", title: "Supprimé", message: "Produit supprimé." });
    } catch (err: any) {
      pushToast({ variant: "error", title: "Erreur", message: err?.message || "Suppression échouée" });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/seed", { method: "POST" });
      await loadData();
      pushToast({ variant: "success", title: "Données", message: "Données démo chargées." });
    } catch (err: any) {
      pushToast({ variant: "error", title: "Erreur", message: err?.message || "Erreur seed" });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(
    () => products.filter((p) => (p.title || "").toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <>
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      <div className="admin-hero">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-title">Produits</h1>
          <p className="admin-hero-sub">Creez, editez et suivez vos offres en un coup d'oeil.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="ghost-btn" type="button" onClick={handleSeed}>
            Seed démo
          </button>
          <button className="btn-primary" type="button" onClick={loadData}>
            Actualiser
          </button>
          {loading && <span className="muted">Chargement...</span>}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Ajouter un produit</h3>
          <form
            ref={addFormRef}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setLoading(true);
              try {
                await handleAddProduct(new FormData(form));
                pushToast({ variant: "success", title: "Création", message: "Produit créé." });
                addFormRef.current?.reset();
              } catch (err: any) {
                pushToast({ variant: "error", title: "Erreur", message: err?.message || "Création échouée" });
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
            <p className="muted">Utilisez un lien https pour garantir l’affichage de l’image.</p>
            <label>
              Description courte
              <input name="short_description" placeholder="Résumé produit" />
            </label>
            <button type="submit">Créer</button>
          </form>
        </div>

        {editing && (
          <div className="admin-card">
            <h3>Modifier le produit</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await handleUpdateProduct(new FormData(e.currentTarget));
                  pushToast({ variant: "success", title: "Mise à jour", message: "Produit mis à jour." });
                  setEditing(null);
                } catch (err: any) {
                  pushToast({ variant: "error", title: "Erreur", message: err?.message || "Mise à jour échouée" });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label>
                Titre
                <input name="title" defaultValue={editing.title} required />
              </label>
              <label>
                Type
                <select name="type" defaultValue={editing.type}>
                  <option value="account">Compte / Abonnement</option>
                  <option value="giftcard">Giftcard</option>
                </select>
              </label>
              <label>
                Prix (HTG)
                <input name="price" type="number" step="0.01" defaultValue={editing.price} required />
              </label>
              <label>
                Plan
                <input name="plan" defaultValue={editing.plan ?? ""} />
              </label>
              <label>
                Durée (jours)
                <input name="duration_days" type="number" defaultValue={editing.duration_days ?? ""} />
              </label>
              <label>
                Image URL
                <input name="image_url" defaultValue={editing.image_url ?? ""} />
              </label>
              <p className="muted">Utilisez un lien https pour garantir l’affichage de l’image.</p>
              {editing.image_url && (
                <div className="admin-image-preview">
                  <img
                    src={toProxyImage(editing.image_url)}
                    alt={editing.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                    }}
                  />
                </div>
              )}
              <label>
                Description courte
                <input name="short_description" defaultValue={editing.short_description ?? ""} />
              </label>
              <label className="admin-switch">
                <input name="active" type="checkbox" defaultChecked={editing.active} />
                <span>Actif</span>
              </label>
              <div className="admin-actions">
                <button type="submit">Enregistrer</button>
                <button type="button" className="ghost-btn" onClick={() => setEditing(null)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

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
              <span>Image</span>
              <span>Titre</span>
              <span>Type</span>
              <span>Prix</span>
              <span>Plan</span>
              <span>Actif</span>
              <span>Variants</span>
              <span>URL image</span>
              <span>Détails</span>
              <span>Actions</span>
            </div>
            {filteredProducts.map((p) => (
              <div className="admin-row" key={p.id}>
                <span>
                  <img
                    className="admin-thumb"
                    src={toProxyImage(p.image_url)}
                    alt={p.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                    }}
                  />
                </span>
                <span>{p.title}</span>
                <span>{p.type}</span>
                <span>
                  {p.price} {p.currency}
                </span>
                <span>{p.plan || "-"}</span>
                <span>{p.active ? "Oui" : "Non"}</span>
                <span className="muted">{variants.filter((v) => v.product_id === p.id).length}</span>
                <span>
                  {p.image_url ? (
                    <a className="link" href={p.image_url} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  ) : (
                    <span className="muted">Aucune</span>
                  )}
                </span>
                <span>
                  <a className="link" href={`/product/${p.id}`} target="_blank" rel="noreferrer">
                    Voir
                  </a>
                </span>
                <span>
                  <button className="link" type="button" onClick={() => setEditing(p)}>
                    Modifier
                  </button>
                  <button className="link danger" type="button" onClick={() => setConfirmDelete(p)}>
                    Supprimer
                  </button>
                </span>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="admin-empty">Aucun produit trouvé.</div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Confirmer la suppression</h3>
              <button
                className="icon-btn ghost"
                aria-label="Fermer"
                onClick={() => !deleting && setConfirmDelete(null)}
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="modal-body">
              <p className="muted">
                Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.title}</strong> ? Cette action est
                irréversible.
              </p>
              <div className="confirm-actions">
                <button className="ghost-btn" type="button" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Annuler
                </button>
                <button
                  className="btn-danger"
                  type="button"
                  disabled={deleting}
                  onClick={() => handleDeleteProduct(confirmDelete)}
                >
                  {deleting ? "Suppression..." : "Oui, supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
