import Link from "next/link";

type Plan = { name: string; note: string; price: string; label?: string };
type CatalogEntry = {
  title: string;
  subtitle: string;
  price?: string;
  badge?: string;
  plans: Plan[];
  description: string;
  features: string[];
  bullets: string[];
  icon: string;
};

// Catalogue statique de secours
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
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
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
    description: "Accès à Claude 3 pour analyses, rédaction et ideation.",
    features: ["Contexte étendu", "Raisonnement avancé", "Sécurité Anthropic", "Outils code & data"],
    bullets: ["Livraison instantanée", "Paiement sécurisé", "Support 24/7", "Satisfait ou remboursé"],
    icon: "https://seeklogo.com/images/C/claude-ai-logo-A859C5C3E6-seeklogo.com.png",
  },
  ps: {
    title: "PlayStation Store",
    subtitle: "Crédits et jeux PSN",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code numérique instantané", price: "1350 HTG" }],
    description: "Recharge PSN pour acheter jeux, DLC et abonnements.",
    features: ["Code numérique", "Compatible PS4/PS5", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Satisfait ou remboursé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/4e/PlayStation_logo.svg",
  },
  xbox: {
    title: "Xbox Gift Card",
    subtitle: "Jeux et contenus Xbox",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Crédits Microsoft Store", price: "1350 HTG" }],
    description: "Crédits pour jeux, DLC et services Xbox.",
    features: ["Code numérique", "Xbox / PC", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_one_logo.svg",
  },
  steam: {
    title: "Steam Wallet",
    subtitle: "Crédits Steam PC",
    price: "675 HTG",
    plans: [{ name: "Standard", note: "Recharge immédiate", price: "675 HTG" }],
    description: "Ajoutez des fonds à votre portefeuille Steam pour vos jeux PC.",
    features: ["Code numérique", "Compatible global", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
  },
  nintendo: {
    title: "Nintendo eShop",
    subtitle: "Crédits Switch",
    price: "1350 HTG",
    plans: [{ name: "Standard", note: "Code eShop", price: "1350 HTG" }],
    description: "Achetez jeux et contenus sur Nintendo eShop.",
    features: ["Code numérique", "Compatible Switch", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg",
  },
  canva: {
    title: "Canva Pro",
    subtitle: "Création visuelle premium",
    price: "1500 HTG",
    plans: [{ name: "1 mois", note: "Accès complet Canva Pro", price: "1500 HTG" }],
    description: "Accédez à tous les templates, assets et exports Pro.",
    features: ["Templates premium", "Assets libres de droits", "Export HD", "Collaboration"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://logo-marque.com/wp-content/uploads/2021/11/Canva-Logo.jpg",
  },
  netflix: {
    title: "Netflix",
    subtitle: "Streaming illimité",
    price: "950 HTG",
    plans: [{ name: "1 écran", note: "Accès streaming", price: "950 HTG" }],
    description: "Accès Netflix selon le plan choisi.",
    features: ["Séries & films", "Streaming HD", "Multi-device"],
    bullets: ["Livraison rapide", "Paiement sécurisé", "Support 24/7"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  },
  spotify: {
    title: "Spotify",
    subtitle: "Musique premium",
    price: "900 HTG",
    plans: [{ name: "1 mois", note: "Spotify Premium", price: "900 HTG" }],
    description: "Abonnement Spotify Premium pour musique et podcasts.",
    features: ["Sans pub", "Offline", "Audio haute qualité"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
  },
  apple: {
    title: "Apple Gift Card",
    subtitle: "App Store & iTunes",
    price: "1500 HTG",
    plans: [{ name: "15 USD", note: "Code Apple", price: "1500 HTG" }],
    description: "Crédits pour App Store, iTunes et abonnements Apple.",
    features: ["Code numérique", "App Store / iTunes", "Livraison instantanée"],
    bullets: ["Livraison digitale", "Support 24/7", "Paiement sécurisé"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  "chatgpt-unlimited": {
    title: "ChatGPT Unlimited",
    subtitle: "1 mois · images illimitées · Codex · Figma",
    price: "1999 HTG",
    plans: [{ name: "Mensuel", note: "Accès illimité", price: "1999 HTG" }],
    description: "Accès ChatGPT avec images illimitées et plugins.",
    features: ["GPT-4", "Images illimitées", "Plugins/Codex", "Support prioritaire"],
    bullets: ["Livraison instantanée", "Paiement sécurisé", "Support 24/7"],
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  },
};

async function fetchProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/admin/products`, {
      cache: "no-store",
      next: { revalidate: 0 },
    }).catch(() => null);

    if (!res || !res.ok) {
      const resLocal = await fetch(`/api/admin/products`, { cache: "no-store" }).catch(() => null);
      if (!resLocal || !resLocal.ok) return [];
      return await resLocal.json().catch(() => []);
    }
    return await res.json().catch(() => []);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbProducts = await fetchProducts();
  const dbProduct = dbProducts.find((p: any) => p.id === slug);

  const product: CatalogEntry | null = dbProduct
    ? {
        title: dbProduct.title,
        subtitle: dbProduct.description || dbProduct.plan || "Abonnement/Carte",
        price: `${dbProduct.price} ${dbProduct.currency}`,
        badge: dbProduct.active ? "Actif" : "Inactif",
        plans: [{ name: dbProduct.plan || "Standard", note: "Plan de base", price: `${dbProduct.price} ${dbProduct.currency}` }],
        description: dbProduct.description || "Offre disponible immédiatement.",
        features: [
          dbProduct.type === "giftcard" ? "Giftcard" : "Compte/Abonnement",
          dbProduct.plan ? `Plan: ${dbProduct.plan}` : "Plan standard",
          `Durée: ${dbProduct.duration_days ? dbProduct.duration_days + " jours" : "Flexible"}`,
          "Livraison rapide",
        ],
        bullets: ["Paiement sécurisé", "Support 24/7", "Satisfaction garantie"],
        icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
      }
    : fallbackCatalog[slug] || null;

  if (!product) {
    return (
      <main className="update-wrapper">
        <div className="update-card" style={{ maxWidth: 420 }}>
          <h1>Produit introuvable</h1>
          <Link className="update-link" href="/">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-wrap">
      <div className="detail-grid">
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-head">
              <div className="detail-icon">
                <img src={product.icon} alt={product.title} />
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
          </div>

          <div className="detail-card">
            <h3>What’s included</h3>
            <div className="detail-features">
              {product.features.map((f) => (
                <span key={f}>
                  <i className="ri-check-line" /> {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-card">
            {product.price && (
              <div className="detail-price">
                <span className="big">{product.price}</span>
                {product.badge && <span className="pill red">{product.badge}</span>}
              </div>
            )}
            <h4>Select Plan</h4>
            <div className="plan-list">
              {product.plans.map((p) => (
                <div className="plan-item" key={p.name}>
                  <div>
                    <div className="plan-title">
                      {p.name} {p.label && <span className="pill">{p.label}</span>}
                    </div>
                    <div className="muted">{p.note}</div>
                  </div>
                  <div className="plan-price">{p.price}</div>
                </div>
              ))}
            </div>
            <button className="btn-full modal-primary">Buy Now</button>
            <button className="btn-full ghost-btn">
              <i className="ri-shopping-cart-2-line" /> Add to Cart
            </button>
            <div className="detail-bullets">
              {product.bullets.map((b) => (
                <span key={b}>
                  <i className="ri-checkbox-circle-line" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
