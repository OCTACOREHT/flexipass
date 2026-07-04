"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import { addItemToCart } from "@/components/cart/AddToCartButton";
import { getProductImageSrc, handleProductImageError } from "@/lib/product-brand";
import { getPlanBoxData } from "@/lib/plan-display";

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
  duration_days?: number | null;
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

const cleanText = (value?: string | null) => {
  if (!value) return "";

  return value
    .replace(/ÃƒÂ©/g, "Ã©")
    .replace(/ÃƒÂ¨/g, "Ã¨")
    .replace(/ÃƒÂª/g, "Ãª")
    .replace(/ÃƒÂ«/g, "Ã«")
    .replace(/ÃƒÂ /g, "Ã ")
    .replace(/ÃƒÂ¹/g, "Ã¹")
    .replace(/ÃƒÂ»/g, "Ã»")
    .replace(/ÃƒÂ§/g, "Ã§")
    .replace(/ÃƒÂ®/g, "Ã®")
    .replace(/ÃƒÂ¯/g, "Ã¯")
    .replace(/Ã‚/g, "")
    .replace(/Ã¢â‚¬â„¢/g, "â€™")
    .replace(/\bpremuim\b/gi, "premium")
    .replace(/\betflix\b/gi, "Netflix");
};

const getDisplayTitle = (title: string) => cleanText(title).replace(/\s*haiti\s*/gi, "").trim();
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

    let channel: RealtimeChannel | null = null;
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
      const currentChannel = channel;
      if (currentChannel) {
        import("@/lib/supabase-browser").then((mod) => {
          mod.supabaseBrowser?.removeChannel(currentChannel);
        });
      }
    };
  }, []);

  const visible = useMemo(
    () => (active === "all" ? products : products.filter((p) => getCategoryKey(p) === active)),
    [products, active]
  );

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
        <section className="market-section">
          <div className="section-head market-head" style={{ justifyContent: "center" }}>
            <h2 style={{ textAlign: "center", width: "100%" }}>Tous les produits</h2>
          </div>

          <div className="pills market-pills" style={{ justifyContent: "center" }}>
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
              {Array.from({ length: 8 }).map((_, i) => (
                <article className="compact-card skeleton" key={`sk-${i}`} style={{ width: '100%' }}>
                  <div className="compact-logo" style={{ background: '#f5ede6' }}></div>
                  <div className="compact-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Title */}
                    <div className="skeleton-line" style={{ width: '120px', height: '16px', background: '#e3d7cb', margin: 0, borderRadius: '4px' }}></div>
                    {/* Subtitle */}
                    <div className="skeleton-line" style={{ width: '80px', height: '12px', background: '#eee5db', margin: 0, borderRadius: '4px' }}></div>
                    {/* Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '4px 0' }}>
                      <div className="skeleton-line" style={{ width: '110px', height: '10px', background: '#eee5db', margin: 0, borderRadius: '3px' }}></div>
                      <div className="skeleton-line" style={{ width: '90px', height: '10px', background: '#eee5db', margin: 0, borderRadius: '3px' }}></div>
                    </div>
                    {/* Price */}
                    <div className="skeleton-line" style={{ width: '70px', height: '16px', background: '#ffdcc8', margin: 0, borderRadius: '4px' }}></div>
                  </div>
                  <div className="compact-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {/* Orange button */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffdcc8' }}></div>
                    {/* Eye button */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5ede6' }}></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="compact-grid">
              {visible.map((p) => {
                const selectedVariant = (p.variants && p.variants[0]) || null;
                const displayPrice = selectedVariant
                  ? `${selectedVariant.price} ${selectedVariant.currency}`
                  : `${p.price} ${p.currency}`;
                const planMeta = getPlanBoxData(
                  cleanText(selectedVariant?.label || p.plan),
                  selectedVariant?.duration_days ?? p.duration_days
                );

                return (
                  <article key={p.id} className={`compact-card ${p.type === "account" ? "luxe" : ""}`}>
                    <div className="compact-logo-white">
                      <img
                        src={getProductImageSrc(p)}
                        alt={cleanText(p.title)}
                        width={32}
                        height={32}
                        loading="lazy"
                        onError={(e) => {
                          handleProductImageError(e.currentTarget, p);
                        }}
                      />
                    </div>

                    <div className="compact-info">
                      <h3 className="compact-title">{getDisplayTitle(p.title)}</h3>
                      <div className="compact-subtitle">
                        {cleanText(p.short_description || p.subtitle || p.plan || "Produit")}
                      </div>
                      <div className="compact-meta">
                        <span className="compact-meta-line">Plan : {cleanText(planMeta.planLabel)}</span>
                        <span className="compact-meta-line">
                          DurÃ©e : <strong className="compact-meta-strong">{cleanText(planMeta.durationLabel)}</strong>
                        </span>
                      </div>
                      <div className="compact-price">{displayPrice}</div>
                    </div>

                    <div className="compact-actions">
                      <button
                        type="button"
                        className="btn-icon primary"
                        onClick={() => addItemToCart({ id: p.id, title: getDisplayTitle(p.title), price: selectedVariant?.price ?? p.price, image: getProductImageSrc(p) })}
                        title="Ajouter au panier"
                      >
                        <i className="ri-shopping-cart-2-line" />
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
                );
              })}
            </div>
          )}
        </section>
      </main>
      <FooterMain />
    </>
  );
}
