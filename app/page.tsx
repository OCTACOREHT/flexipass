"use client";

import { useEffect, useMemo, useState } from "react";

type Variant = { id: string; label: string; duration_days: number; price: number; currency: string };
type Product = {
  id: string;
  title: string;
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

const brandLogos = [
  { name: "Canva", icon: "https://logo-marque.com/wp-content/uploads/2021/11/Canva-Logo.jpg" },
  { name: "ChatGPT", icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
  { name: "Copilot", icon: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Prime Video", icon: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png" },
  { name: "Netflix", icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Coursera", icon: "https://logos-world.net/wp-content/uploads/2021/02/Coursera-Logo.png" },
  { name: "Claude", icon: "https://seeklogo.com/images/C/claude-ai-logo-A859C5C3E6-seeklogo.com.png" },
  { name: "Spotify", icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { name: "Apple", icon: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Xbox", icon: "https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_one_logo.svg" },
  { name: "YouTube", icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
  { name: "Perplexity", icon: "https://upload.wikimedia.org/wikipedia/commons/4/40/Perplexity_AI_logo_mark.png" },
  { name: "Slack", icon: "https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png" },
];

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
  const [cartItems, setCartItems] = useState<{ id: string; title: string; price: number; qty: number }[]>([]);
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
    // Récupère une éventuelle erreur OAuth dans l'URL et ouvre le modal
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
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
    // Affiche tout de suite un cache local éventuel
    try {
      const cached = localStorage.getItem("products_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setProducts(parsed);
      }
    } catch (_) {}

    setLoadingProducts(true);
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
  }, []);

  const visibleProducts = useMemo(() => {
    const base = Array.isArray(products) ? products : [];
    const list = base.filter((p) =>
      active === "all"
        ? true
        : p.type === "giftcard"
        ? active === "gaming" || active === "shopping" || active === "divertissement"
        : true
    );
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
      if (existing) return items.map((i) => (i.id === p.id && i.price === (price ?? p.price) ? { ...i, qty: i.qty + 1 } : i));
      return [...items, { id: p.id, title: p.title, price: price ?? p.price, qty: 1 }];
    });
    setCartOpen(true);
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
      options: { shouldCreateUser: false },
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
    await supabaseBrowser.auth.signOut();
    setSettingsOpen(false);
    switchAuthMode("login");
    setLoginOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <main>
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">FlexiPass</div>
          <div className="nav-center">
            <nav className="menu">
              <a href="#giftcards">Cartes Cadeaux</a>
              <a href="#streaming">Streaming</a>
              <a href="#premium">Premium</a>
            </nav>
            <div className="nav-search">
              <input
                type="search"
                placeholder="Rechercher un produit..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              <i className="ri-search-line" />
              {searchOpen && query && (
                <div className="nav-results">
                  {searched.length === 0 && <div className="nav-result">Aucun produit</div>}
                  {searched.map((p) => (
                    <a key={p.id} className="nav-result" href={`/product/${p.id}`} onClick={() => setSearchOpen(false)}>
                      {p.title}
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
        <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
          <a href="#giftcards" onClick={() => setMenuOpen(false)}>
            Cartes Cadeaux
          </a>
          <a href="#streaming" onClick={() => setMenuOpen(false)}>
            Streaming
          </a>
          <a href="#premium" onClick={() => setMenuOpen(false)}>
            Premium
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">FlexiPass</div>
          <h1>Cartes Cadeaux Numériques</h1>
          <p>Offrez le choix avec nos cartes numériques instantanées pour le gaming, le shopping et le streaming.</p>
          <div className="hero-cta">
            <button className="btn-primary">Découvrir les cartes</button>
            <button className="btn-ghost">Voir catalogue</button>
          </div>
        </div>
        <div className="floating-stack">
          <div className="float-card fc1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" />
          </div>
          <div className="float-card fc2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="ChatGPT" />
          </div>
          <div className="float-card fc3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Copilot" />
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
          <h2>Cartes Populaires</h2>
          <a className="link" href="#">
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
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <article className="card skeleton" key={`sk-${i}`}>
                <div className="skeleton-line w40" />
                <div className="skeleton-line w70" />
                <div className="skeleton-line w60" />
                <div className="skeleton-pill" />
                <div className="skeleton-btn" />
              </article>
            ))}
          </div>
        ) : (
          <div className="grid">
            {visibleProducts.map((p) => {
              const selectedVariant = (p.variants && p.variants[0]) || null;
              const displayPrice = selectedVariant ? `${selectedVariant.price} ${selectedVariant.currency}` : `${p.price} ${p.currency}`;
              return (
                <article key={p.id} className={`card ${p.type === "account" ? "luxe" : ""}`}>
                  <div className="card-top">
                    <div className={`logo-box ${p.type === "account" ? "premium" : ""}`}>
                      <img src={p.image_url || "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"} alt={p.title} width={40} height={40} />
                    </div>
                  </div>

                  <h3>{p.title}</h3>
                  <div className="muted">{p.short_description || p.subtitle || p.plan || "Produit numérique"}</div>

                  {p.variants && p.variants.length > 0 && (
                    <div className="field">
                      <label htmlFor={`select-${p.id}`}>Montant</label>
                      <select id={`select-${p.id}`} name={`select-${p.id}`} onChange={(e) => {
                        const v = p.variants?.find((v) => v.id === e.target.value);
                        if (v) handleAddToCart(p, v.price);
                      }}>
                        {p.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label} - {v.price} {v.currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!p.variants?.length && (
                    <div className="price-row">
                      <div className="price">{displayPrice}</div>
                    </div>
                  )}
                  <button type="button" className="btn-full" onClick={() => handleAddToCart(p, selectedVariant?.price)}>
                    <i className="ri-shopping-cart-2-line" />
                    Ajouter au panier
                  </button>
                  <a className="btn-full ghost-btn" href={`/product/${p.id}`}>
                    <i className="ri-information-line" />
                    Détails
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section" id="premium">
        <div className="section-head">
          <h2>Premium</h2>
          <a className="link" href="#">
            Voir tout →
          </a>
        </div>
        <div className="premium-grid">
          {visibleProducts
            .filter((p) => p.type === "account")
            .map((p) => (
              <article key={p.id} className="premium-card">
                <div className="premium-top">
                  <div className="premium-badge">Premium</div>
                  <span className="premium-tag">{p.plan || "Plan"}</span>
                </div>
                <h3>{p.title}</h3>
                <p className="premium-sub">{p.short_description || p.subtitle}</p>
                <div className="premium-actions">
                  <button className="btn-full modal-primary" onClick={() => handleAddToCart(p, p.price)}>
                    S'abonner
                  </button>
                  <a className="btn-full ghost-btn" href={`/product/${p.id}`}>
                    <i className="ri-information-line" />
                    Détails
                  </a>
                </div>
              </article>
            ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-mark">FlexiPass</div>
            <p className="footer-tagline">
              Cartes cadeaux et abonnements numériques pour vos apps et services préférés. Livraison instantanée.
            </p>
            <div className="socials">
              <a aria-label="Twitter" href="#">
                <i className="ri-twitter-x-line" />
              </a>
              <a aria-label="Facebook" href="#">
                <i className="ri-facebook-circle-line" />
              </a>
              <a aria-label="Instagram" href="#">
                <i className="ri-instagram-line" />
              </a>
              <a aria-label="LinkedIn" href="#">
                <i className="ri-linkedin-box-line" />
              </a>
            </div>
          </div>

          <div className="footer-grid">
            <div>
              <h4>Catalogue</h4>
              <ul>
                <li><a href="#giftcards">Cartes cadeaux</a></li>
                <li><a href="#streaming">Streaming</a></li>
                <li><a href="#premium">Premium</a></li>
                <li><a href="/product/all">Tous les produits</a></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><a href="mailto:support@flexipass.com">support@flexipass.com</a></li>
                <li><a href="#">Centre d'aide</a></li>
              </ul>
            </div>
            <div>
              <h4>Légal</h4>
              <ul>
                <li><a href="#">Conditions</a></li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">Cookies</a></li>
              </ul>
            </div>
            <div className="newsletter">
              <h4>Newsletter</h4>
              <p>Promos exclusives et nouveautés. Pas de spam.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Votre email" />
                <button type="button">S'inscrire</button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FlexiPass. Tous droits réservés.</span>
          <div className="payments">
            <span className="pay-pill">Visa</span>
            <span className="pay-pill">Mastercard</span>
            <span className="pay-pill">PayPal</span>
          </div>
        </div>
      </footer>

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
              <button className="icon-btn ghost" aria-label="Fermer" onClick={() => setCartOpen(false)}>
                <i className="ri-close-line" />
              </button>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty">Votre panier est vide.</div>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.price}`} className="cart-item">
                      <div className="cart-info">
                        <div className="cart-title">{item.title}</div>
                        <div className="cart-qty">Qté: {item.qty}</div>
                      </div>
                      <div className="cart-price">{item.price * item.qty} HTG</div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{cartItems.reduce((s, i) => s + i.price * i.qty, 0)} HTG</strong>
                  </div>
                  <button className="btn-full modal-primary" onClick={() => alert("Commande simulée")}>
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




