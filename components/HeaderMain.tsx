"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  title: string;
  service_name?: string | null;
  subtitle?: string | null;
  short_description?: string | null;
  image_url?: string | null;
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
  crunchyroll: "https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png",
  hbo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  midjourney: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  adobe: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Express_logo.svg",
  zoom: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  roblox: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roblox_Logo_2022.svg",
  fortnite: "https://upload.wikimedia.org/wikipedia/commons/1/1a/FortniteLogo.svg",
};
const getDisplayTitle = (title: string) => title.replace(/\s*haiti\s*/gi, "").trim();
const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");
const getProductSlug = (p: Product) => (p.id ? p.id : normalizeSlug(p.service_name || p.title));
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
const CART_KEY = "flexipass_cart";

// Repris du header de la page principale
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

export default function HeaderMain() {
  const user = useSessionUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");

  useEffect(() => {
    if (!settingsOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (!t.closest(".user-chip") && !t.closest(".settings-dropdown")) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    if (user) setLoginOpen(false);
  }, [user]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const readCount = () => {
      try {
        const raw = localStorage.getItem(CART_KEY);
        const items = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items)) return setCartCount(0);
        const total = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };
    readCount();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) readCount();
    };
    const onCustom = () => readCount();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCustom as EventListener);
    };
  }, []);

  const searched = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [products, query]);

  const switchAuthMode = (mode: "login" | "signup" | "reset") => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(false);
    setPassword("");
    setConfirm("");
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
      supabaseBrowser.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          try {
            localStorage.removeItem("supabase.auth.token");
          } catch (_) {}
        }
      });
    }
    setLoginOpen(false);
  };

  const handleSignup = async () => {
    setAuthError(null);
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

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand-logo">
            <img src="/assets/images/brands/flexipass-logo.svg" alt="FlexiPass" />
          </Link>
          <div className="nav-center">
            <nav className="menu">
              <Link href="/cartes-cadeaux">Cartes Cadeaux</Link>
              <Link href="/streaming">Streaming</Link>
              <Link href="/premium">Premium</Link>
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
                    <Link
                      key={p.id}
                      className="nav-result nav-result--thumb"
                      href={`/product/${encodeURIComponent(getProductSlug(p))}`}
                      onClick={() => setSearchOpen(false)}
                    >
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              className="user-chip"
              title={user?.name ?? "Connexion"}
              onClick={() => (user ? setSettingsOpen((v) => !v) : setLoginOpen(true))}
              aria-expanded={settingsOpen}
            >
              <i className="ri-user-smile-line" />
              <span className="user-name">{user?.name ?? "Connexion"}</span>
            </button>
            {user && settingsOpen && (
              <div className="settings-dropdown">
                <Link className="dropdown-item" href="/settings">
                  <i className="ri-settings-3-line" />
                  Paramètres
                </Link>
                <Link className="dropdown-item" href="/history">
                  <i className="ri-time-line" />
                  Historique
                </Link>
                <button type="button" className="dropdown-item danger" onClick={handleSignOut}>
                  <i className="ri-logout-box-r-line" />
                  Déconnexion
                </button>
              </div>
            )}
            <button className="icon-btn cart-btn" aria-label="Panier">
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
                  <Link
                    key={p.id}
                    className="nav-result nav-result--thumb"
                    href={`/product/${encodeURIComponent(getProductSlug(p))}`}
                    onClick={() => setSearchOpen(false)}
                  >
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
          <Link href="/cartes-cadeaux" onClick={() => setMenuOpen(false)}>
            Cartes Cadeaux
          </Link>
          <Link href="/streaming" onClick={() => setMenuOpen(false)}>
            Streaming
          </Link>
          <Link href="/premium" onClick={() => setMenuOpen(false)}>
            Premium
          </Link>
        </div>
      </header>
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
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
    </>
  );
}



