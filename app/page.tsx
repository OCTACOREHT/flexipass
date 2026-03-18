"use client";

import { useEffect, useMemo, useState } from "react";
import FooterMain from "@/components/FooterMain";

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

const CART_KEY = "flexipass_cart";

const categories: Category[] = [
  { key: "all", label: "Toutes", icon: "ri-gift-line" },
  { key: "gaming", label: "Gaming", icon: "ri-gamepad-line" },
  { key: "tech", label: "Tech", icon: "ri-smartphone-line" },
  { key: "shopping", label: "Shopping", icon: "ri-shopping-bag-3-line" },
  { key: "divertissement", label: "Divertissement", icon: "ri-music-2-line" },
];

const brandLogos = [
  { name: "Canva", icon: "/assets/images/brands/canva.jpg" },
  { name: "ChatGPT", icon: "/assets/images/brands/chatgpt.svg" },
  { name: "Copilot", icon: "/assets/images/brands/microsoft.svg" },
  { name: "Prime Video", icon: "/assets/images/brands/prime-video.png" },
  { name: "Netflix", icon: "/assets/images/brands/netflix.svg" },
  { name: "Coursera", icon: "/assets/images/brands/coursera.svg" },
  { name: "Claude", icon: "/assets/images/brands/claude.svg" },
  { name: "Spotify", icon: "/assets/images/brands/spotify.svg" },
  { name: "Apple", icon: "/assets/images/brands/apple.svg" },
  { name: "Xbox", icon: "/assets/images/brands/xbox.svg" },
  { name: "YouTube", icon: "/assets/images/brands/youtube.svg" },
  { name: "Perplexity", icon: "/assets/images/brands/perplexity.svg" },
  { name: "Slack", icon: "/assets/images/brands/slack.png" },
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

// Hook client : récupère la session Supabase et fournit un nom si connecté
function useSessionUser() {
  const [user, setUser] = useState<null | { name: string; avatarUrl?: string | null }>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabaseBrowser = mod?.supabaseBrowser;
      if (!supabaseBrowser) return;

      supabaseBrowser.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        setUser(
          u
            ? {
                name: u.user_metadata?.full_name ?? u.email ?? "Compte",
                avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null,
              }
            : null
        );
      });

      const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_evt, session) => {
        const u = session?.user;
        setUser(
          u
            ? {
                name: u.user_metadata?.full_name ?? u.email ?? "Compte",
                avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null,
              }
            : null
        );
      });

      unsubscribe = () => sub?.subscription.unsubscribe();
    };

    load();
    return () => unsubscribe?.();
  }, []);

  return user;
}

export default function Home() {
  const user = useSessionUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; title: string; price: number; qty: number; image?: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [loadingProducts, setLoadingProducts] = useState(true);

  const switchAuthMode = (mode: "login" | "signup" | "reset") => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(false);
    if (mode === "login") {
      setPassword("");
      setConfirm("");
    }
    if (mode === "signup") {
      setPassword("");
      setConfirm("");
    }
  };
  useEffect(() => {
    if (user) setLoginOpen(false);
  }, [user]);

  useEffect(() => {
    if (!settingsOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest(".user-chip") && !target.closest(".settings-dropdown")) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [settingsOpen]);

    useEffect(() => {
      // Ouvre le modal de connexion selon l'URL
      const params = new URLSearchParams(window.location.search);
      const err = params.get("auth_error");
      const login = params.get("login");

      if (login === "1") {
        setLoginOpen(true);
        switchAuthMode("login");
        params.delete("login");
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", next);
        return;
      }

      // Récupère une éventuelle erreur OAuth dans l'URL et ouvre le modal
      if (err) {
        setAuthError(err);
        setLoginOpen(true);
        switchAuthMode("login");
        params.delete("auth_error");
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", next);
      }
    }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const items = raw ? JSON.parse(raw) : [];
      if (Array.isArray(items)) setCartItems(items);
    } catch (_) {}

    if (typeof window !== "undefined") {
      const shouldOpen = window.location.hash === "#cart" || new URLSearchParams(window.location.search).get("cart") === "1";
      if (shouldOpen) setCartOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cart:updated"));
    } catch (_) {}
  }, [cartItems]);

  useEffect(() => {
    // Affiche tout de suite un cache local éventuel
    try {
      const cached = localStorage.getItem("products_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setProducts(parsed);
      }
    } catch (_) {}

    setLoadingProducts(true);
    const fetchProducts = () => {
      fetch("/api/products")
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setProducts(list);
          try {
            localStorage.setItem("products_cache", JSON.stringify(list));
          } catch (_) {}
        })
        .catch(() => setProducts((prev) => prev || []))
        .finally(() => setLoadingProducts(false));
    };

    fetchProducts();

    let channel: any;
    const setupRealtime = async () => {
       const mod = await import("@/lib/supabase-browser").catch(() => null);
       const supabase = mod?.supabaseBrowser;
       if (!supabase) return;

       channel = supabase
         .channel("home-products-sync")
         .on(
           "postgres_changes",
           { event: "*", schema: "public", table: "products" },
           () => {
             console.log("Syncing products (Home)...");
             fetchProducts();
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

  const visibleProducts = useMemo(() => {
    const base = Array.isArray(products) ? products : [];
    const list = base.filter((p) => (active === "all" ? true : getCategoryKey(p) === active));
    if (!query.trim()) return list;
    return list.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [products, active, query]);

  const searched = useMemo(() => {
    if (!query.trim()) return [];
    const base = Array.isArray(products) ? products : [];
    return base.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [products, query]);

  const handleAddToCart = (p: Product, price?: number) => {
    setCartItems((items) => {
      const existing = items.find((i) => i.id === p.id && i.price === (price ?? p.price));
      if (existing) {
        return items.map((i) => (i.id === p.id && i.price === (price ?? p.price) ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...items, { id: p.id, title: getDisplayTitle(p.title), price: price ?? p.price, qty: 1, image: getBrandAsset(p) }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, price: number, delta: number) => {
    setCartItems((items) =>
      items
        .map((i) => (i.id === id && i.price === price ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: string, price: number) => {
    setCartItems((items) => items.filter((i) => !(i.id === id && i.price === price)));
  };

  const handleLoginGoogle = async () => {
    setAuthError(null);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setAuthError("Configuration Supabase manquante ou invalide.");
      return;
    }
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAuthError(error.message);
  };

  const handleLoginPassword = async () => {
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(true);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setAuthError("Configuration Supabase manquante ou invalide.");
      setAuthLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (!remember) {
      // Si l'utilisateur ne veut pas de persistance, on efface le stockage après la session en cours
      supabaseBrowser.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          try {
            localStorage.removeItem("supabase.auth.token");
          } catch (_) {
            /* ignore */
          }
        }
      });
    }
    setLoginOpen(false);
  };

  const handleSignup = async () => {
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(true);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setAuthError("Configuration Supabase manquante ou invalide.");
      setAuthLoading(false);
      return;
    }
    if (password !== confirm) {
      setAuthError("Les mots de passe ne correspondent pas.");
      setAuthLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthMessage("Vérifiez votre email pour confirmer votre compte.");
  };

  const handleReset = async () => {
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(true);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setAuthError("Configuration Supabase manquante ou invalide.");
      setAuthLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update`,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthMessage("Si un compte existe, un email de réinitialisation a été envoyé.");
  };

  const handleSignOut = async () => {
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setAuthError("Impossible de se déconnecter : client Supabase indisponible.");
      return;
    }
    try {
      await supabaseBrowser.auth.signOut();
    } catch (err) {
      console.warn("La déconnexion Supabase a renvoyé une erreur (souvent réseau) :", err);
    }
    setSettingsOpen(false);
    switchAuthMode("login");
    setLoginOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const formatHtg = (value: number) =>
    `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} HTG`;
  const formatPrice = (value: number, currency: string) => {
    if (currency.toUpperCase() === "HTG") return formatHtg(value);
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
  };
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCartOpen(false);
    window.location.href = "/paiement";
  };

  return (
    <main>
      <header className="nav">
        <div className="nav-inner">
          <div className="brand-logo">
            <img src="/assets/images/brands/flexipass-logo.svg" alt="FlexiPass" />
          </div>
          <div className="nav-center">
            <nav className="menu">
              <a href="/cartes-cadeaux">Cartes Cadeaux</a>
              <a href="/streaming">Streaming</a>
              <a href="/premium">Premium</a>
            </nav>
            <div className="nav-search">
              <input
                type="search"
                placeholder="Rechercher un produit..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setSearchOpen(true)}
              />
              <i className="ri-search-line" />
              {searchOpen && query && (
                <div className="nav-results">
                  {searched.length === 0 && <div className="nav-result">Aucun produit</div>}
                  {searched.map((p) => (
                    <a key={p.id} className="nav-result nav-result--thumb" href={`/product/${encodeURIComponent(getProductSlug(p))}`} onClick={() => setSearchOpen(false)}>
                      <img
                        className="nav-result-thumb"
                              src={toImageSrc(getBrandAsset(p))}
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                        }}
                      />
                      <span className="nav-result-label">{getDisplayTitle(p.title)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              className="user-chip"
              title={user?.name ?? "Se connecter"}
              onClick={() => (user ? setSettingsOpen((v) => !v) : (switchAuthMode("login"), setLoginOpen(true)))}
              aria-expanded={settingsOpen}
            >
              <i className="ri-user-smile-line" />
              <span className="user-name">{user?.name ?? "Connexion"}</span>
            </button>
            {user && settingsOpen && (
              <div className="settings-dropdown">
                <a className="dropdown-item" href="/settings">
                  <i className="ri-settings-3-line" />
                  Paramètres
                </a>
                <a className="dropdown-item" href="/history">
                  <i className="ri-time-line" />
                  Historique
                </a>
                <button type="button" className="dropdown-item danger" onClick={handleSignOut}>
                  <i className="ri-logout-box-r-line" />
                  Déconnexion
                </button>
              </div>
            )}
            <button className="icon-btn cart-btn" aria-label="Panier" onClick={() => setCartOpen((v) => !v)}>
              <i className="ri-shopping-bag-3-line" />
              <span className="cart-badge">{cartCount}</span>
            </button>
            <button
              className="icon-btn hamburger-btn"
              aria-label="Menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <i className={menuOpen ? "ri-close-line" : "ri-menu-line"} />
            </button>
          </div>
        </div>
        <div className="mobile-search-wrap">
          <div className="nav-search">
            <input
              type="search"
              placeholder="Rechercher un produit..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(Boolean(e.target.value.trim()));
              }}
              onFocus={() => setSearchOpen(true)}
            />
            <i className="ri-search-line" />
            {searchOpen && query && (
              <div className="nav-results">
                {searched.length === 0 && <div className="nav-result">Aucun produit</div>}
                {searched.map((p) => (
                  <a key={p.id} className="nav-result nav-result--thumb" href={`/product/${encodeURIComponent(getProductSlug(p))}`} onClick={() => setSearchOpen(false)}>
                    <img
                      className="nav-result-thumb"
                      src={toImageSrc(getBrandAsset(p))}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                      }}
                    />
                    <span className="nav-result-label">{getDisplayTitle(p.title)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
          <a href="/cartes-cadeaux" onClick={() => setMenuOpen(false)}>
            Cartes Cadeaux
          </a>
          <a href="/streaming" onClick={() => setMenuOpen(false)}>
            Streaming
          </a>
          <a href="/premium" onClick={() => setMenuOpen(false)}>
            Premium
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">FlexiPass</div>
          <h1>Abonnements & Pass Digitaux</h1>
          <p>Offrez le choix avec nos cartes numériques instantanées pour le gaming, le shopping et le streaming.</p>
          <p className="hero-sub">Simplifiez vos abonnements. Offrez ou profitez d&apos;un accès immédiat à tout votre univers numérique.</p>
          <div className="hero-cta">
            <a className="btn-primary" href="/cartes-cadeaux">Découvrir les cartes</a>
            <a className="btn-ghost" href="/catalogue">Voir catalogue</a>
          </div>
        </div>
        <div className="floating-stack">
          <div className="float-card fc1">
            <img src="/assets/images/brands/spotify.svg" alt="Spotify" loading="lazy" decoding="async" />
          </div>
          <div className="float-card fc2">
            <img src="/assets/images/brands/chatgpt.svg" alt="ChatGPT" loading="lazy" decoding="async" />
          </div>
          <div className="float-card fc3">
            <img src="/assets/images/brands/microsoft.svg" alt="Copilot" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <div className="brands-bar">
        <div className="brands-track">
          {[...brandLogos, ...brandLogos].map((b, idx) => (
            <div className="brand-pill" key={`${b.name}-${idx}`} title={b.name}>
              {b.icon ? (
                <img
                  src={b.icon}
                  alt={b.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.parentElement?.querySelector(".brand-fallback") as HTMLElement | null;
                    if (fb) fb.style.display = "grid";
                  }}
                />
              ) : null}
              <div className="brand-fallback">{b.name[0]}</div>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
        <div className="brands-track reverse">
          {[...brandLogos, ...brandLogos].map((b, idx) => (
            <div className="brand-pill" key={`rev-${b.name}-${idx}`} title={b.name}>
              {b.icon ? (
                <img
                  src={b.icon}
                  alt={b.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.parentElement?.querySelector(".brand-fallback") as HTMLElement | null;
                    if (fb) fb.style.display = "grid";
                  }}
                />
              ) : null}
              <div className="brand-fallback">{b.name[0]}</div>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="section" id="giftcards">
        <div className="section-head">
          <h2>Explorer</h2>
          <a href="/catalogue" className="link">
            Voir tout →
          </a>
        </div>

        <div className="pills">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              className={`pill ${active === c.key ? "active" : ""}`}
            >
              <i className={c.icon} /> {c.label}
            </button>
          ))}
        </div>

        {loadingProducts && visibleProducts.length === 0 ? (
          <div className="compact-grid">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="compact-grid" key={`grid-${active}-${query}`}>
            {visibleProducts.slice(0, 8).map((p) => {
              const selectedVariant = (p.variants && p.variants[0]) || null;
              const displayPrice = selectedVariant ? `${selectedVariant.price} ${selectedVariant.currency}` : `${p.price} ${p.currency}`;
              return (
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
                    <div className="compact-price">{displayPrice}</div>
                  </div>

                  <div className="compact-actions">
                    <button 
                      type="button" 
                      className="btn-icon primary" 
                      onClick={() => handleAddToCart(p, selectedVariant?.price)}
                      title="Ajouter au panier"
                    >
                      <i className="ri-shopping-cart-2-line" />
                    </button>
                    <a 
                      className="btn-icon" 
                      href={`/product/${encodeURIComponent(getProductSlug(p))}`}
                      title="Détails"
                    >
                      <i className="ri-arrow-right-line" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section" id="premium">
        <div className="section-head">
          <h2>Premium</h2>
          <a href="/catalogue" className="link">
            Voir tout →
          </a>
        </div>
        <div className="compact-grid">
          {visibleProducts
            .filter((p) => p.type === "account")
            .slice(0, 4)
            .map((p) => {
              const selectedVariant = (p.variants && p.variants[0]) || null;
              const premiumPrice = selectedVariant ? selectedVariant.price : p.price;
              const premiumCurrency = selectedVariant ? selectedVariant.currency : p.currency;
              const premiumSub = (p.short_description || p.subtitle || "premium").trim();
              return (
              <article key={p.id} className="compact-card luxe">
                <div className="compact-logo">
                  <img
                    src={getBrandAsset(p)}
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
                  <div className="compact-subtitle">{premiumSub}</div>
                  <div className="compact-price">{formatPrice(premiumPrice, premiumCurrency)}</div>
                </div>

                <div className="compact-actions">
                  <button 
                    className="btn-icon primary" 
                    onClick={() => handleAddToCart(p, premiumPrice)}
                    title="Ajouter au panier"
                  >
                    <i className="ri-shopping-cart-2-line" />
                  </button>
                  <a 
                    className="btn-icon" 
                    href={`/product/${encodeURIComponent(getProductSlug(p))}`}
                    title="Détails"
                  >
                    <i className="ri-arrow-right-line" />
                  </a>
                </div>
              </article>
            )})}
        </div>
      </section>

      <FooterMain />

      {loginOpen && (
        <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                {authMode === "login" && "Connexion"}
                {authMode === "signup" && "Créer un compte"}
                {authMode === "reset" && "Mot de passe oublié"}
              </h3>
              <button className="icon-btn ghost" aria-label="Fermer" onClick={() => setLoginOpen(false)}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="modal-body">
              {authError && <div className="auth-error">{authError}</div>}
              {authMessage && <div className="auth-success">{authMessage}</div>}
              {authMode === "login" && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="remember">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button className="btn-full modal-primary" type="button" onClick={handleLoginPassword} disabled={authLoading}>
                    {authLoading ? "Connexion..." : "Se connecter"}
                  </button>
                  <button className="google-btn" type="button" onClick={handleLoginGoogle}>
                    <i className="ri-google-fill" />
                    Continuer avec Google
                  </button>
                  <div className="modal-links">
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("signup")}>
                      Pas encore inscrit ? Créer un compte
                    </button>
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("reset")}>
                      Mot de passe oublié
                    </button>
                  </div>
                </>
              )}

              {authMode === "signup" && (
                <>
                  <input
                    type="text"
                    placeholder="Nom complet (optionnel)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button className="btn-full modal-primary" type="button" onClick={handleSignup} disabled={authLoading}>
                    {authLoading ? "Création..." : "Créer un compte"}
                  </button>
                  <div className="modal-links">
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("login")}>
                      Déjà inscrit ? Se connecter
                    </button>
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("reset")}>
                      Mot de passe oublié
                    </button>
                  </div>
                </>
              )}

              {authMode === "reset" && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="btn-full modal-primary" type="button" onClick={handleReset} disabled={authLoading}>
                    {authLoading ? "Envoi..." : "Envoyer le lien"}
                  </button>
                  <div className="modal-links">
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("login")}>
                      Revenir à la connexion
                    </button>
                    <button type="button" className="link-btn" onClick={() => switchAuthMode("signup")}>
                      Créer un compte
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-drawer" onClick={() => setCartOpen(false)}>
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-head">
              <h4>Mon panier</h4>
              <div className="cart-head-actions">
                {cartItems.length > 0 && (
                  <button className="link-btn" type="button" onClick={() => setCartItems([])}>
                    Vider
                  </button>
                )}
                <button className="icon-btn ghost" aria-label="Fermer" onClick={() => setCartOpen(false)}>
                  <i className="ri-close-line" />
                </button>
              </div>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty">Votre panier est vide.</div>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.price}`} className="cart-item">
                      <div className="cart-thumb">
                        <img src={item.image || "/assets/images/brands/chatgpt.svg"} alt={item.title} />
                      </div>
                      <div className="cart-content">
                        <div className="cart-item-top">
                          <div className="cart-title">{item.title}</div>
                          <button type="button" className="icon-btn ghost cart-remove" aria-label="Supprimer" onClick={() => removeItem(item.id, item.price)}>
                            <i className="ri-delete-bin-6-line" />
                          </button>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="cart-qty-row">
                            <span className="cart-qty-label">Qté</span>
                            <div className="qty-controls">
                              <button type="button" onClick={() => updateQty(item.id, item.price, -1)}>-</button>
                              <span>{item.qty}</span>
                              <button type="button" onClick={() => updateQty(item.id, item.price, 1)}>+</button>
                            </div>
                          </div>
                          <div className="cart-price">{formatHtg(item.price * item.qty)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{formatHtg(cartItems.reduce((s, i) => s + i.price * i.qty, 0))}</strong>
                  </div>
                  <button className="btn-full modal-primary" onClick={handleCheckout}>
                    Commander
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}





