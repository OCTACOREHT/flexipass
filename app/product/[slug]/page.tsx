"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";
import { getProductImageSrc, handleProductImageError } from "@/lib/product-brand";

type Plan = { name: string; note: string; price: string; label?: string; href?: string };
type CatalogEntry = {
  title: string;
  subtitle: string;
  price?: string;
  rawPrice?: number;
  currency?: string;
  id?: string;
  badge?: string;
  plans: Plan[];
  description: string;
  features: string[];
  bullets: string[];
  icon: string;
};

type Product = {
  id: string;
  title: string;
  service_name?: string | null;
  description?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  type: "account" | "giftcard";
  price: number;
  currency: string;
  plan?: string | null;
  duration_days?: number | null;
};

const normalize = (value: string | undefined | null) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");

const translate = (text: string) => {
  const map: Record<string, string> = {
    "Compte/Abonnement": "Abonnement",
    "Account / Subscription": "Abonnement",
    "Giftcard": "Carte cadeau",
    "Plan standard": "Plan : Standard",
    "Plan: premuim": "Plan : premium",
    "Plan: premium": "Plan : premium",
    "Plan:": "Plan :",
    "Duration:": "DurÃ©e :",
    "DurÃ©e:": "DurÃ©e :",
    "days": "jours",
    "Fast delivery": "Livraison rapide",
    "Livraison rapide": "Livraison rapide",
    "Instant delivery": "Livraison instantanÃ©e",
    "Digital delivery": "Livraison digitale",
    "Secure payment": "Paiement sÃ©curisÃ©",
    "Paiement sÃ©curisÃ©": "Paiement sÃ©curisÃ©",
    "Satisfaction guaranteed": "Satisfaction garantie",
    "Support 24/7": "Support 24/7",
  };
  let t = text;
  for (const [k, v] of Object.entries(map)) {
    t = t.replace(k, v);
  }
  return t;
};

const CART_KEY = "flexipass_cart";
const getNumericPrice = (value?: string) => {
  if (!value) return 0;
  const num = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
};
const isNetflixProduct = (p: Pick<Product, "title" | "service_name">) =>
  /netflix/i.test(`${p.title || ""} ${p.service_name || ""}`);
const isCanvaProduct = (p: Pick<Product, "title" | "service_name">) =>
  /canva/i.test(`${p.title || ""} ${p.service_name || ""}`);
const getPlanGroupKey = (p: Pick<Product, "title" | "service_name">) => {
  if (isNetflixProduct(p)) return "netflix";
  if (isCanvaProduct(p)) return "canva";
  return null;
};

const fallbackCatalog: Record<string, CatalogEntry> = {
  "chatgpt-plus": {
    title: "ChatGPT Plus",
    subtitle: "GPT-4, DALLÂ·E, navigation et images illimitÃ©es.",
    price: "$6.00",
    badge: "-70%",
    plans: [
      { name: "Shared Plan", note: "IdÃ©al usage occasionnel", price: "$6.00", label: "Budget" },
      { name: "Semi-Shared Plan", note: "3-4 users, rÃ©ponses rapides", price: "$12.00", label: "Popular" },
      { name: "Private Plan", note: "100% privÃ©, vitesse max", price: "$12.00", label: "Premium" },
    ],
    description: "AccÃ¨s Ã  ChatGPT Plus avec GPT-4, DALLÂ·E et navigation web.",
    features: ["GPT-4 & GPT-4o", "GÃ©nÃ©ration dâ€™images DALLÂ·E", "Code Interpreter", "Web browsing", "Custom GPTs", "Priority access"],
    bullets: ["Livraison digitale instantanÃ©e", "Paiement sÃ©curisÃ©", "Support 24/7", "Satisfaction garantie"],
    icon: "/assets/images/brands/chatgpt.svg",
  },
  "claude-pro": {
    title: "Claude Pro",
    subtitle: "Long contexte, raisonnement fiable.",
    price: "$15.00",
    badge: "-60%",
    plans: [
      { name: "Standard", note: "Usage quotidien", price: "$15.00", label: "Popular" },
      { name: "Team", note: "Collaboration illimitÃ©e", price: "$25.00", label: "Team" },
    ],
    description: "AccÃ¨s Ã  Claude 3 pour analyses, rÃ©daction et idÃ©ation.",
    features: ["Contexte Ã©tendu", "Raisonnement avancÃ©", "SÃ©curitÃ© Anthropic", "Outils code & data"],
    bullets: ["Livraison instantanÃ©e", "Paiement sÃ©curisÃ©", "Support 24/7", "Satisfait ou remboursÃ©"],
    icon: "/assets/images/brands/claude.svg",
  },
  ps: {
    title: "PlayStation Store",
    subtitle: "CrÃ©dits et jeux PSN",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code numÃ©rique instantanÃ©", price: "1350 HTG" }],
    description: "Recharge PSN pour acheter jeux, DLC et abonnements.",
    features: ["Code numÃ©rique", "Compatible PS4/PS5", "Livraison instantanÃ©e"],
    bullets: ["Livraison digitale", "Support 24/7", "Satisfait ou remboursÃ©"],
    icon: "/assets/images/brands/playstation.svg",
  },
  xbox: {
    title: "Xbox Gift Card",
    subtitle: "Jeux et contenus Xbox",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "CrÃ©dits Microsoft Store", price: "1350 HTG" }],
    description: "CrÃ©dits pour jeux, DLC et services Xbox.",
    features: ["Code numÃ©rique", "Xbox / PC", "Livraison instantanÃ©e"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/xbox.svg",
  },
  steam: {
    title: "Steam Wallet",
    subtitle: "CrÃ©dits Steam PC",
    price: "675 HTG",
    plans: [{ name: "Standard", note: "Recharge immÃ©diate", price: "675 HTG" }],
    description: "Ajoutez des fonds Ã  votre portefeuille Steam pour vos jeux PC.",
    features: ["Code numÃ©rique", "Compatible global", "Livraison instantanÃ©e"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/steam.svg",
  },
  nintendo: {
    title: "Nintendo eShop",
    subtitle: "CrÃ©dits Switch",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code eShop", price: "1350 HTG" }],
    description: "Achetez jeux et contenus sur Nintendo eShop.",
    features: ["Code numÃ©rique", "Compatible Switch", "Livraison instantanÃ©e"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/nintendo.svg",
  },
  canva: {
    title: "Canva Pro",
    subtitle: "CrÃ©ation visuelle premium",
    price: "1500 HTG",
    plans: [{ name: "1 mois", note: "AccÃ¨s complet Canva Pro", price: "1500 HTG" }],
    description: "AccÃ©dez Ã  tous les templates, assets et exports Pro.",
    features: ["Templates premium", "Assets libres de droits", "Export HD", "Collaboration"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/canva.jpg",
  },
  netflix: {
    title: "Netflix",
    subtitle: "Streaming illimitÃ©",
    price: "950 HTG",
    plans: [{ name: "1 Ã©cran", note: "AccÃ¨s streaming", price: "950 HTG" }],
    description: "AccÃ¨s Netflix selon le plan choisi.",
    features: ["SÃ©ries & films", "Streaming HD", "Multi-device"],
    bullets: ["Livraison rapide", "Paiement sÃ©curisÃ©", "Support 24/7"],
    icon: "/assets/images/brands/netflix.svg",
  },
  spotify: {
    title: "Spotify",
    subtitle: "Musique premium",
    price: "900 HTG",
    plans: [{ name: "1 mois", note: "Spotify Premium", price: "900 HTG" }],
    description: "Abonnement Spotify Premium pour musique et podcasts.",
    features: ["Sans pub", "Offline", "Audio haute qualitÃ©"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/spotify.svg",
  },
  apple: {
    title: "Apple Gift Card",
    subtitle: "App Store & iTunes",
    price: "1500 HTG",
    plans: [{ name: "15 USD", note: "Code Apple", price: "1500 HTG" }],
    description: "CrÃ©dits pour App Store, iTunes et abonnements Apple.",
    features: ["Code numÃ©rique", "App Store / iTunes", "Livraison instantanÃ©e"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sÃ©curisÃ©"],
    icon: "/assets/images/brands/apple.svg",
  },
  "chatgpt-unlimited": {
    title: "ChatGPT Unlimited",
    subtitle: "1 mois Â· images illimitÃ©es Â· Codex Â· Figma",
    price: "1999 HTG",
    plans: [{ name: "Mensuel", note: "AccÃ¨s illimitÃ©", price: "1999 HTG" }],
    description: "AccÃ¨s ChatGPT avec images illimitÃ©es et plugins.",
    features: ["GPT-4", "Images illimitÃ©es", "Plugins/Codex", "Support prioritaire"],
    bullets: ["Livraison instantanÃ©e", "Paiement sÃ©curisÃ©", "Support 24/7"],
    icon: "/assets/images/brands/chatgpt.svg",
  },
};

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const slug = normalize(decodeURIComponent(rawSlug));
  const requestedPlan = normalize(searchParams.get("plan"));
  const requestedPrice = getNumericPrice(searchParams.get("price") || "");
  const [product, setProduct] = useState<CatalogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartNote, setCartNote] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        const slugMatches = products.filter((p: Product) =>
          normalize(p.id) === slug ||
          normalize(p.title) === slug ||
          normalize(p.service_name) === slug
        );
        const dbProduct =
          slugMatches.find((p: Product) => {
            const planMatch = requestedPlan ? normalize(p.plan) === requestedPlan : true;
            const priceMatch = requestedPrice ? Number(p.price) === requestedPrice : true;
            return planMatch && priceMatch;
          }) || slugMatches[0];
        const groupKey = dbProduct ? getPlanGroupKey(dbProduct) : null;
        const relatedPlansFromDb = products
          .filter((p: Product) => (groupKey ? getPlanGroupKey(p) === groupKey : false))
          .map((p: Product) => ({
            name: p.plan || "Standard",
            note: p.description || "AccÃ¨s streaming",
            price: `${p.price} ${p.currency}`,
            href: `/product/${encodeURIComponent(
              p.id ? p.id : normalize(p.service_name || p.title)
            )}?plan=${encodeURIComponent(normalize(p.plan || "standard"))}&price=${encodeURIComponent(
              String(p.price)
            )}`,
          }))
          .sort((a: Plan, b: Plan) => getNumericPrice(a.price) - getNumericPrice(b.price))
          .filter((plan: Plan, index: number, arr: Plan[]) => {
            const duplicateIndex = arr.findIndex(
              (item: Plan) => item.name === plan.name && item.price === plan.price
            );
            return duplicateIndex === index;
          });
        const mapped = dbProduct
          ? {
              id: dbProduct.id,
              title: dbProduct.title,
              subtitle: dbProduct.description || dbProduct.plan || "Abonnement/Carte",
              price: `${dbProduct.price} ${dbProduct.currency}`,
              rawPrice: dbProduct.price,
              currency: dbProduct.currency,
              badge: "Actif",
              plans:
                groupKey && relatedPlansFromDb.length > 0
                  ? relatedPlansFromDb
                  : [
                      {
                        name: dbProduct.plan || "Standard",
                        note: "Plan de base",
                        price: `${dbProduct.price} ${dbProduct.currency}`,
                      },
                    ],
              description: dbProduct.description || "Offre disponible immÃ©diatement.",
              features: [
                dbProduct.type === "giftcard" ? "Giftcard" : "Compte/Abonnement",
                dbProduct.plan ? `Plan: ${dbProduct.plan}` : "Plan standard",
                `Durée: ${dbProduct.duration_days ? dbProduct.duration_days + " jours" : "Flexible"}`,
                "Livraison rapide",
              ],
              bullets: ["Paiement sÃ©curisÃ©", "Support 24/7", "Satisfaction garantie"],
              icon: getProductImageSrc(dbProduct),
            }
          : fallbackCatalog[slug] || fallbackCatalog[slug.split("-")[0]] || null;
        setProduct(mapped);
        setSelectedPlan(
          mapped?.plans?.find(
            (plan: Plan) =>
              normalize(plan.name) === normalize(dbProduct?.plan) &&
              getNumericPrice(plan.price) === Number(dbProduct?.price || 0)
          ) ?? mapped?.plans?.[0] ?? null
        );
      })
      .catch(() => setProduct(fallbackCatalog[slug] || fallbackCatalog[slug.split("-")[0]] || null))
      .finally(() => setLoading(false));
  }, [slug, requestedPlan, requestedPrice]);

  const ready = useMemo(() => !loading && product, [loading, product]);

  const pushCartUpdate = () => {
    try {
      window.dispatchEvent(new Event("cart:updated"));
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    const price = getNumericPrice(selectedPlan?.price) || product.rawPrice || getNumericPrice(product.price);
    const item = {
      id: product.id || slug,
      title: selectedPlan ? `${product.title} Â· ${selectedPlan.name}` : product.title,
      price,
      qty: 1,
                image: product.icon,
    };
    try {
      const raw = localStorage.getItem(CART_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(items) ? items : [];
      const idx = list.findIndex((i) => i.id === item.id && i.price === item.price);
      if (idx >= 0) {
        list[idx] = { ...list[idx], qty: (Number(list[idx].qty) || 1) + 1 };
      } else {
        list.push(item);
      }
      localStorage.setItem(CART_KEY, JSON.stringify(list));
      pushCartUpdate();
      setCartNote("AjoutÃ© au panier.");
      setTimeout(() => setCartNote(null), 2000);
    } catch {
      setCartNote("Impossible d'ajouter au panier.");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/#cart";
  };

  const handleOpenPlan = (plan: Plan) => {
    if (plan.href) {
      window.location.assign(plan.href);
      return;
    }
    setSelectedPlan(plan);
  };

  const activePrice = selectedPlan?.price ?? product?.price;

  return (
    <>
      <HeaderMain />
      <main className="detail-wrap">
        {loading && (
          <div className="detail-card">
            <div className="skeleton-line w40" />
            <div className="skeleton-line w70" />
            <div className="skeleton-line w60" />
            <div className="skeleton-pill" />
            <div className="skeleton-btn" />
          </div>
        )}

        {!loading && !product && (
          <div className="update-card" style={{ maxWidth: 420 }}>
            <h1>Produit introuvable</h1>
            <Link className="update-link" href="/">
              Retour Ã  l&apos;accueil
            </Link>
          </div>
        )}

        {ready && product && (
          <div className="detail-grid">
            <div className="detail-left">
              <div className="detail-card">
                <div className="detail-head">
                  <div className="detail-icon">
                    <img
                      src={product.icon}
                      alt={product.title}
                      onError={(e) => {
                        handleProductImageError(e.currentTarget, {
                          title: product.title,
                          subtitle: product.subtitle,
                          image_url: product.icon,
                        });
                      }}
                    />
                    {product.badge && <span className="detail-badge">{product.badge}</span>}
                  </div>
                  <div>
                    <h1>{product.title}</h1>
                    <p className="muted">{product.subtitle}</p>
                    <div className="detail-flags">
                      <span>
                        <i className="ri-flashlight-line" /> Livraison instantanÃ©e
                      </span>
                      <span>
                        <i className="ri-shield-check-line" /> SÃ©curisÃ©
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3>Description</h3>
                <p>{product.description}</p>
                {cartNote && <div className="auth-success" style={{ marginTop: 12 }}>{cartNote}</div>}
              </div>

              <div className="detail-card">
                <h3>Ce qui est inclus</h3>
                <div className="detail-features">
                  {product.features.map((f) => (
                    <span key={f}>
                      <i className="ri-check-line" /> {translate(f)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <h3>Autres plans disponibles</h3>
                <div className="plan-list">
                  {product.plans.map((p, index) => (
                    <button
                      type="button"
                      className={`plan-item ${
                        selectedPlan?.name === p.name &&
                        selectedPlan?.price === p.price &&
                        selectedPlan?.note === p.note
                          ? "active"
                          : ""
                      }`}
                      key={`${p.name}-${p.price}-${p.note}-${index}`}
                      onClick={() => handleOpenPlan(p)}
                    >
                      <div>
                        <div className="plan-title">
                          {p.name} {p.label && <span className="pill">{p.label}</span>}
                        </div>
                        <div className="muted">{p.note}</div>
                      </div>
                      <div className="plan-price">{p.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="detail-right">
              <div className="detail-card">
                {activePrice && (
                  <div className="detail-price">
                    <span className="big">{activePrice}</span>
                    {product.badge && <span className="pill red">{product.badge}</span>}
                  </div>
                )}
                <div className="cta-stack">
                  <button className="btn-full modal-primary" onClick={handleBuyNow}>Acheter maintenant</button>
                  <button className="btn-full ghost-btn" onClick={handleAddToCart}>
                    <i className="ri-shopping-cart-2-line" /> Ajouter au panier
                  </button>
                </div>
                <div className="detail-bullets fancy-bullets">
                  <span>
                    <i className="ri-flashlight-line" /> Livraison digitale instantanÃ©e
                  </span>
                  <span>
                    <i className="ri-shield-check-line" /> Paiement sÃ©curisÃ©
                  </span>
                  <span>
                    <i className="ri-customer-service-2-line" /> Support 24/7
                  </span>
                  <span>
                    <i className="ri-star-smile-line" /> Satisfaction garantie
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <FooterMain />
    </>
  );
}



