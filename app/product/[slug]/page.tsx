"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";

type Plan = { name: string; note: string; price: string; label?: string };
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

const getBrandAsset = (p: { title?: string; subtitle?: string; short_description?: string; image_url?: string | null }) => {
  if (p.image_url && p.image_url.trim()) return p.image_url.trim();
  const hay = `${p.title ?? ""} ${p.subtitle ?? ""} ${p.short_description ?? ""}`.toLowerCase();
  const key = Object.keys(brandAssetMap).find((k) => hay.includes(k));
  return key ? brandAssetMap[key] : "/assets/images/brands/chatgpt.svg";
};

const toImageSrc = (raw?: string | null) =>
  raw ? `/api/image?url=${encodeURIComponent(raw)}` : "/assets/images/brands/chatgpt.svg";

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
    "Duration:": "Durée :",
    "Durée:": "Durée :",
    "days": "jours",
    "Fast delivery": "Livraison rapide",
    "Livraison rapide": "Livraison rapide",
    "Instant delivery": "Livraison instantanée",
    "Digital delivery": "Livraison digitale",
    "Secure payment": "Paiement sécurisé",
    "Paiement sécurisé": "Paiement sécurisé",
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

const fallbackCatalog: Record<string, CatalogEntry> = {
  "chatgpt-plus": {
    title: "ChatGPT Plus",
    subtitle: "GPT-4, DALL·E, navigation et images illimitées.",
    price: "$6.00",
    badge: "-70%",
    plans: [
      { name: "Shared Plan", note: "Idéal usage occasionnel", price: "$6.00", label: "Budget" },
      { name: "Semi-Shared Plan", note: "3-4 users, réponses rapides", price: "$12.00", label: "Popular" },
      { name: "Private Plan", note: "100% privé, vitesse max", price: "$12.00", label: "Premium" },
    ],
    description: "Accès à ChatGPT Plus avec GPT-4, DALL·E et navigation web.",
    features: ["GPT-4 & GPT-4o", "Génération d’images DALL·E", "Code Interpreter", "Web browsing", "Custom GPTs", "Priority access"],
    bullets: ["Livraison digitale instantanée", "Paiement sécurisé", "Support 24/7", "Satisfaction garantie"],
    icon: "/assets/images/brands/chatgpt.svg",
  },
  "claude-pro": {
    title: "Claude Pro",
    subtitle: "Long contexte, raisonnement fiable.",
    price: "$15.00",
    badge: "-60%",
    plans: [
      { name: "Standard", note: "Usage quotidien", price: "$15.00", label: "Popular" },
      { name: "Team", note: "Collaboration illimitée", price: "$25.00", label: "Team" },
    ],
    description: "Accès à Claude 3 pour analyses, rédaction et idéation.",
    features: ["Contexte étendu", "Raisonnement avancé", "Sécurité Anthropic", "Outils code & data"],
    bullets: ["Livraison instantanée", "Paiement sécurisé", "Support 24/7", "Satisfait ou remboursé"],
    icon: "/assets/images/brands/claude.svg",
  },
  ps: {
    title: "PlayStation Store",
    subtitle: "Crédits et jeux PSN",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code numérique instantané", price: "1350 HTG" }],
    description: "Recharge PSN pour acheter jeux, DLC et abonnements.",
    features: ["Code numérique", "Compatible PS4/PS5", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Satisfait ou remboursé"],
    icon: "/assets/images/brands/playstation.svg",
  },
  xbox: {
    title: "Xbox Gift Card",
    subtitle: "Jeux et contenus Xbox",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Crédits Microsoft Store", price: "1350 HTG" }],
    description: "Crédits pour jeux, DLC et services Xbox.",
    features: ["Code numérique", "Xbox / PC", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/xbox.svg",
  },
  steam: {
    title: "Steam Wallet",
    subtitle: "Crédits Steam PC",
    price: "675 HTG",
    plans: [{ name: "Standard", note: "Recharge immédiate", price: "675 HTG" }],
    description: "Ajoutez des fonds à votre portefeuille Steam pour vos jeux PC.",
    features: ["Code numérique", "Compatible global", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/steam.svg",
  },
  nintendo: {
    title: "Nintendo eShop",
    subtitle: "Crédits Switch",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code eShop", price: "1350 HTG" }],
    description: "Achetez jeux et contenus sur Nintendo eShop.",
    features: ["Code numérique", "Compatible Switch", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/nintendo.svg",
  },
  canva: {
    title: "Canva Pro",
    subtitle: "Création visuelle premium",
    price: "1500 HTG",
    plans: [{ name: "1 mois", note: "Accès complet Canva Pro", price: "1500 HTG" }],
    description: "Accédez à tous les templates, assets et exports Pro.",
    features: ["Templates premium", "Assets libres de droits", "Export HD", "Collaboration"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/canva.jpg",
  },
  netflix: {
    title: "Netflix",
    subtitle: "Streaming illimité",
    price: "950 HTG",
    plans: [{ name: "1 écran", note: "Accès streaming", price: "950 HTG" }],
    description: "Accès Netflix selon le plan choisi.",
    features: ["Séries & films", "Streaming HD", "Multi-device"],
    bullets: ["Livraison rapide", "Paiement sécurisé", "Support 24/7"],
    icon: "/assets/images/brands/netflix.svg",
  },
  spotify: {
    title: "Spotify",
    subtitle: "Musique premium",
    price: "900 HTG",
    plans: [{ name: "1 mois", note: "Spotify Premium", price: "900 HTG" }],
    description: "Abonnement Spotify Premium pour musique et podcasts.",
    features: ["Sans pub", "Offline", "Audio haute qualité"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/spotify.svg",
  },
  apple: {
    title: "Apple Gift Card",
    subtitle: "App Store & iTunes",
    price: "1500 HTG",
    plans: [{ name: "15 USD", note: "Code Apple", price: "1500 HTG" }],
    description: "Crédits pour App Store, iTunes et abonnements Apple.",
    features: ["Code numérique", "App Store / iTunes", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "/assets/images/brands/apple.svg",
  },
  "chatgpt-unlimited": {
    title: "ChatGPT Unlimited",
    subtitle: "1 mois · images illimitées · Codex · Figma",
    price: "1999 HTG",
    plans: [{ name: "Mensuel", note: "Accès illimité", price: "1999 HTG" }],
    description: "Accès ChatGPT avec images illimitées et plugins.",
    features: ["GPT-4", "Images illimitées", "Plugins/Codex", "Support prioritaire"],
    bullets: ["Livraison instantanée", "Paiement sécurisé", "Support 24/7"],
    icon: "/assets/images/brands/chatgpt.svg",
  },
};

export default function ProductPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";
  const slug = normalize(decodeURIComponent(rawSlug));
  const [product, setProduct] = useState<CatalogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartNote, setCartNote] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        const dbProduct = products.find((p: Product) =>
          normalize(p.id) === slug ||
          normalize(p.title) === slug ||
          normalize(p.service_name) === slug
        );
        const mapped = dbProduct
          ? {
              id: dbProduct.id,
              title: dbProduct.title,
              subtitle: dbProduct.description || dbProduct.plan || "Abonnement/Carte",
              price: `${dbProduct.price} ${dbProduct.currency}`,
              rawPrice: dbProduct.price,
              currency: dbProduct.currency,
              badge: "Actif",
              plans: [
                {
                  name: dbProduct.plan || "Standard",
                  note: "Plan de base",
                  price: `${dbProduct.price} ${dbProduct.currency}`,
                },
              ],
              description: dbProduct.description || "Offre disponible immédiatement.",
              features: [
                dbProduct.type === "giftcard" ? "Giftcard" : "Compte/Abonnement",
                dbProduct.plan ? `Plan: ${dbProduct.plan}` : "Plan standard",
                `Durée: ${dbProduct.duration_days ? dbProduct.duration_days + " jours" : "Flexible"}`,
                "Livraison rapide",
              ],
              bullets: ["Paiement sécurisé", "Support 24/7", "Satisfaction garantie"],
              icon: getBrandAsset(dbProduct),
            }
          : fallbackCatalog[slug] || fallbackCatalog[slug.split("-")[0]] || null;
        setProduct(mapped);
        setSelectedPlan(mapped?.plans?.[0] ?? null);
      })
      .catch(() => setProduct(fallbackCatalog[slug] || fallbackCatalog[slug.split("-")[0]] || null))
      .finally(() => setLoading(false));
  }, [slug]);

  const ready = useMemo(() => !loading && product, [loading, product]);

  const pushCartUpdate = () => {
    try {
      window.dispatchEvent(new Event("cart:updated"));
    } catch (_) {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    const price = getNumericPrice(selectedPlan?.price) || product.rawPrice || getNumericPrice(product.price);
    const item = {
      id: product.id || slug,
      title: selectedPlan ? `${product.title} · ${selectedPlan.name}` : product.title,
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
      setCartNote("Ajouté au panier.");
      setTimeout(() => setCartNote(null), 2000);
    } catch {
      setCartNote("Impossible d'ajouter au panier.");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/#cart";
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
            <a className="update-link" href="/">Retour à l'accueil</a>
          </div>
        )}

        {ready && product && (
          <div className="detail-grid">
            <div className="detail-left">
              <div className="detail-card">
                <div className="detail-head">
                  <div className="detail-icon">
                    <img
                      src={toImageSrc(product.icon)}
                      alt={product.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                      }}
                    />
                    {product.badge && <span className="detail-badge">{product.badge}</span>}
                  </div>
                  <div>
                    <h1>{product.title}</h1>
                    <p className="muted">{product.subtitle}</p>
                    <div className="detail-flags">
                      <span>
                        <i className="ri-flashlight-line" /> Livraison instantanée
                      </span>
                      <span>
                        <i className="ri-shield-check-line" /> Sécurisé
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
            </div>

            <div className="detail-right">
              <div className="detail-card">
                {activePrice && (
                  <div className="detail-price">
                    <span className="big">{activePrice}</span>
                    {product.badge && <span className="pill red">{product.badge}</span>}
                  </div>
                )}
                <h4>Select Plan</h4>
                <div className="plan-list">
                  {product.plans.map((p) => (
                    <button
                      type="button"
                      className={`plan-item ${selectedPlan?.name === p.name ? "active" : ""}`}
                      key={p.name}
                      onClick={() => setSelectedPlan(p)}
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
                <div className="cta-stack">
                  <button className="btn-full modal-primary" onClick={handleBuyNow}>Acheter maintenant</button>
                  <button className="btn-full ghost-btn" onClick={handleAddToCart}>
                    <i className="ri-shopping-cart-2-line" /> Ajouter au panier
                  </button>
                </div>
                <div className="detail-bullets fancy-bullets">
                  <span>
                    <i className="ri-flashlight-line" /> Livraison digitale instantanée
                  </span>
                  <span>
                    <i className="ri-shield-check-line" /> Paiement sécurisé
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


