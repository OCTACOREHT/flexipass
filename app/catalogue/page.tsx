"use client";

import { useEffect, useMemo, useState } from "react";
import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

type Variant = { id: string; label: string; duration_days: number; price: number; currency: string };
type Product = {
  id: string;
  title: string;
  service_name?: string | null;
  subtitle?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  type: "account" | "giftcard";
  price: number;
  currency: string;
  plan?: string | null;
  variants?: Variant[];
};

type Category = { key: string; label: string; icon: string };

const categories: Category[] = [
  { key: "all", label: "Toutes", icon: "ri-gift-line" },
  { key: "gaming", label: "Gaming", icon: "ri-gamepad-line" },
  { key: "tech", label: "Tech", icon: "ri-smartphone-line" },
  { key: "shopping", label: "Shopping", icon: "ri-shopping-bag-3-line" },
  { key: "divertissement", label: "Divertissement", icon: "ri-music-2-line" },
];

const brandAssetMap: Record<string, string> = {
  canva: "/assets/images/brands/canva.jpg",
  chatgpt: "/assets/images/brands/chatgpt.svg",
  copilot: "/assets/images/brands/microsoft.svg",
  microsoft: "/assets/images/brands/microsoft.svg",
  "prime video": "/assets/images/brands/prime-video.png",
  netflix: "/assets/images/brands/netflix.svg",
  coursera: "/assets/images/brands/coursera.svg",
  claude: "/assets/images/brands/claude.svg",
  spotify: "/assets/images/brands/spotify.svg",
  apple: "/assets/images/brands/apple.svg",
  xbox: "/assets/images/brands/xbox.svg",
  youtube: "/assets/images/brands/youtube.svg",
  perplexity: "/assets/images/brands/perplexity.svg",
  slack: "/assets/images/brands/slack.png",
  playstation: "/assets/images/brands/playstation.svg",
  steam: "/assets/images/brands/steam.svg",
  nintendo: "/assets/images/brands/nintendo.svg",
};

const getBrandAsset = (p: Product) => {
  if (p.image_url && p.image_url.trim()) return p.image_url.trim();
  const hay = `${p.title ?? ""} ${p.subtitle ?? ""} ${p.short_description ?? ""}`.toLowerCase();
  const key = Object.keys(brandAssetMap).find((k) => hay.includes(k));
  return key ? brandAssetMap[key] : "/assets/images/brands/chatgpt.svg";
};

const toImageSrc = (raw?: string | null) => {
  const value = raw?.trim();
  if (!value) return "/assets/images/brands/chatgpt.svg";
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return `/api/image?url=${encodeURIComponent(value)}`;
  if (/^(data:|blob:)/i.test(value)) return value;
  return `/${value.replace(/^\/+/, "")}`;
};

const getDisplayTitle = (title: string) => title.replace(/\s*haiti\s*/gi, "").trim();
const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");
const getProductSlug = (p: Product) => (p.id ? p.id : normalizeSlug(p.service_name || p.title));

const getCategoryKey = (p: Product) => {
  const hay = `${p.title ?? ""} ${p.subtitle ?? ""} ${p.short_description ?? ""}`.toLowerCase();
  if (/xbox|playstation|psn|steam|nintendo|switch|gaming|game/.test(hay)) return "gaming";
  if (/netflix|prime|spotify|youtube|stream|musique|video|divert/.test(hay)) return "divertissement";
  if (/apple|chatgpt|copilot|claude|perplexity|slack|canva|tech|ia|ai|pro/.test(hay)) return "tech";
  if (/gift|carte|shopping|store|eshop|wallet/.test(hay)) return "shopping";
  return "all";
};

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const base = active === "all" ? products : products.filter((p) => getCategoryKey(p) === active);
    if (!query.trim()) return base;
    return base.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, query, active]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const c of categories) {
      if (c.key === "all") continue;
      counts[c.key] = products.filter((p) => getCategoryKey(p) === c.key).length;
    }
    return counts;
  }, [products]);

  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <section className="market-hero">
          <div className="market-hero-inner">
            <div>
              <p className="hero-eyebrow">FlexiPass</p>
              <h1>Catalogue</h1>
              <p>Tout l'inventaire en un coup d'oeil : cartes cadeaux et abonnements premium.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/cartes-cadeaux">Cartes cadeaux</a>
                <a className="btn-ghost" href="/premium">Premium</a>
              </div>
            </div>
            <div className="market-search">
              <input
                type="search"
                placeholder="Rechercher un produit..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <i className="ri-search-line" />
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head">
            <h2>Tous les produits</h2>
            <button type="button" className="link" onClick={() => (setActive("all"), setQuery(""))}>
              Voir tout
            </button>
          </div>

          <div className="pills market-pills">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`pill ${active === c.key ? "active" : ""}`}
              >
                <i className={c.icon} /> {c.label} <span className="pill-count">({categoryCounts[c.key] ?? 0})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="market-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <article className="market-card skeleton" key={`sk-${i}`}>
                  <div className="skeleton-line w40" />
                  <div className="skeleton-line w70" />
                  <div className="skeleton-line w60" />
                  <div className="skeleton-pill" />
                  <div className="skeleton-btn" />
                </article>
              ))}
            </div>
          ) : (
            <div className="market-grid">
              {visible.map((p) => (
                <article key={p.id} className={`market-card ${p.type === "account" ? "market-card--premium" : ""}`}>
                  <div className="market-card-top">
                    <div className={`logo-box ${p.type === "account" ? "premium" : ""}`}>
                      <img
                        src={toImageSrc(getBrandAsset(p))}
                        alt={p.title}
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                        }}
                      />
                      <span className="logo-fallback">{p.title?.[0] ?? "?"}</span>
                    </div>
                    <span className="market-pill">{p.type === "account" ? "Abonnement" : "Giftcard"}</span>
                  </div>
                  <h3 className="brand-name">{getDisplayTitle(p.title)}</h3>
                  <div className="muted">{p.short_description || p.subtitle || p.plan || "Produit numérique"}</div>
                  <div className="market-meta">
                    <div className="price">{p.price} {p.currency}</div>
                    <a className="link" href={`/product/${encodeURIComponent(getProductSlug(p))}`}>Details</a>
                  </div>
                  <a className="btn-full ghost-btn" href={`/product/${encodeURIComponent(getProductSlug(p))}`}>Voir le produit</a>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <FooterMain />
    </>
  );
}

