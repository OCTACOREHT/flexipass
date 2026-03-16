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
  crunchyroll: "https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png",
  hbo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  midjourney: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  adobe: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Express_logo.svg",
  zoom: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  roblox: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roblox_Logo_2022.svg",
  fortnite: "https://upload.wikimedia.org/wikipedia/commons/1/1a/FortniteLogo.svg",
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
  if (/^https?:\/\//i.test(value)) return value;
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
    const loadProducts = () => {
      setLoading(true);
      fetch("/api/products")
        .then((r) => r.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    };

    loadProducts();

    // REAL-TIME SYNC
    let channel: any;
    const setupRealtime = async () => {
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabase = mod?.supabaseBrowser;
      if (!supabase) return;

      channel = supabase
        .channel("catalogue-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          () => {
            console.log("Realtime update (Catalogue)");
            loadProducts();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        import("@/lib/supabase-browser").then(mod => {
          mod.supabaseBrowser?.removeChannel(channel);
        });
      }
    };
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
            <div className="compact-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <article className="compact-card skeleton" key={`sk-${i}`}>
                  <div className="compact-logo" />
                  <div className="compact-info">
                    <div className="compact-title" />
                    <div className="compact-subtitle" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="compact-grid">
              {visible.map((p) => (
                <article key={p.id} className={`compact-card ${p.type === "account" ? "luxe" : ""}`}>
                  <div className="compact-logo">
                    <img
                      src={toImageSrc(getBrandAsset(p))}
                      alt={p.title}
                      width={32}
                      height={32}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="compact-info">
                    <h3 className="compact-title">{getDisplayTitle(p.title)}</h3>
                    <div className="compact-subtitle">{p.short_description || p.subtitle || p.plan || "Produit"}</div>
                    <div className="compact-price">{p.price} {p.currency}</div>
                  </div>

                  <div className="compact-actions">
                    <button 
                      type="button" 
                      className="btn-icon primary" 
                      onClick={() => {/* logic handled by handleAddToCart in a real implementation, but catalogue page seems to missing it or use Details only */}}
                      title="Détails"
                    >
                      <i className="ri-arrow-right-line" />
                    </button>
                    <a 
                      className="btn-icon" 
                      href={`/product/${encodeURIComponent(getProductSlug(p))}`}
                      title="Voir le produit"
                    >
                      <i className="ri-eye-line" />
                    </a>
                  </div>
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

