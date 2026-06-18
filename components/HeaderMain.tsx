"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { getProductImageSrc, handleProductImageError } from "@/lib/product-brand";

type Product = {
  id: string;
  title: string;
  service_name?: string | null;
  subtitle?: string | null;
  short_description?: string | null;
  image_url?: string | null;
};

type SessionUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

const getDisplayTitle = (title: string) => title.replace(/\s*haiti\s*/gi, "").trim();
const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");
const getProductSlug = (p: Product) => (p.id ? p.id : normalizeSlug(p.service_name || p.title));
const CART_KEY = "flexipass_cart";
const PRIVACY_ACCEPTED_KEY = "flexipass_privacy_accepted";

const persistPrivacyAccepted = () => {
  try {
    window.localStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
  } catch {}
};

const readPersistedPrivacyAccepted = () => {
  try {
    return window.localStorage.getItem(PRIVACY_ACCEPTED_KEY) === "true";
  } catch {
    return false;
  }
};

// Repris du header de la page principale
function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

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
                id: u.id,
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
                id: u.id,
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
  const userLabel = user?.name?.trim() || "Connexion";
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchBarVisible, setSearchBarVisible] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [policyStatusLoading, setPolicyStatusLoading] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policySubmitting, setPolicySubmitting] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyAcceptedAt, setPolicyAcceptedAt] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const canAttemptLogin = authMode !== "login" || privacyAccepted;

  useEffect(() => {
    setPrivacyAccepted(readPersistedPrivacyAccepted());
  }, []);

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
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    const closeOnResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.pageYOffset || document.documentElement.scrollTop;
    
    const handleScroll = () => {
      const currentY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Ignore very small scrolls
      if (Math.abs(currentY - lastY) < 5) return;

      if (currentY > lastY && currentY > 80) {
        // Scrolling down
        setSearchBarVisible(false);
      } else {
        // Scrolling up or at the top
        setSearchBarVisible(true);
      }
      
      lastY = currentY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      setLoginOpen(false);
    } else {
      setPolicyModalOpen(false);
      setPolicyAcceptedAt(null);
      setPolicyError(null);
    }
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

  useEffect(() => {
    const checkPolicyStatus = async () => {
      if (!user) {
        setPolicyStatusLoading(false);
        return;
      }

      setPolicyStatusLoading(true);
      setPolicyError(null);

      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabaseBrowser = mod?.supabaseBrowser;
      if (!supabaseBrowser) {
        setPolicyError("Configuration Supabase manquante ou invalide.");
        setPolicyStatusLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setPolicyStatusLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/policy-acceptance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!response.ok) {
          setPolicyError(result?.error || "Impossible de vérifier l’acceptation de la politique.");
          setPolicyStatusLoading(false);
          return;
        }

        const accepted = Boolean(result?.accepted);
        if (accepted) {
          setPrivacyAccepted(true);
          persistPrivacyAccepted();
        }
        setPolicyAcceptedAt(result?.acceptance?.accepted_at || null);
        setPolicyModalOpen(!accepted);
      } catch {
        setPolicyError("Impossible de vérifier l’acceptation de la politique.");
      } finally {
        setPolicyStatusLoading(false);
      }
    };

    checkPolicyStatus();
  }, [user]);

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
    if (!privacyAccepted) {
      setAuthError("Vous devez accepter la politique de confidentialité avant de vous connecter.");
      return;
    }
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
    if (!privacyAccepted) {
      setAuthError("Vous devez accepter la politique de confidentialité avant de vous connecter.");
      return;
    }
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
          } catch {}
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

  const handleAcceptPolicy = async () => {
    setPolicyError(null);
    setPolicySubmitting(true);

    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabaseBrowser = mod?.supabaseBrowser;
    if (!supabaseBrowser) {
      setPolicyError("Configuration Supabase manquante ou invalide.");
      setPolicySubmitting(false);
      return;
    }

    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      setPolicyError("Session introuvable. Veuillez vous reconnecter.");
      setPolicySubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/policy-acceptance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        setPolicyError(result?.error || "Impossible d’enregistrer votre acceptation.");
        setPolicySubmitting(false);
        return;
      }

      setPrivacyAccepted(true);
      persistPrivacyAccepted();
      setPolicyAcceptedAt(result?.acceptance?.accepted_at || new Date().toISOString());
      setPolicyModalOpen(false);
      setAuthMessage("Politique de confidentialité acceptée.");
    } catch {
      setPolicyError("Impossible d’enregistrer votre acceptation.");
    } finally {
      setPolicySubmitting(false);
    }
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
      // On continue quand même le nettoyage local pour éviter que l'utilisateur soit bloqué
    }
    setSettingsOpen(false);
    switchAuthMode("login");
    setLoginOpen(true);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setSearchOpen(false);
    setSettingsOpen(false);
    setMenuOpen((value) => !value);
  };

  return (
    <>
      <header className={`nav ${menuOpen ? "menu-open" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="brand-logo">
            <img src="/Flexipass%20.png" alt="FlexiPass" />
            <span className="brand-logo-text">
              <span className="brand-logo-flexi">Flexi</span>
              <span className="brand-logo-pass">Pass</span>
            </span>
          </Link>
          <div className="nav-center">
            <nav className="menu">
              <Link href="/cartes-cadeaux">Cartes Cadeaux</Link>
              <Link href="/streaming">Streaming</Link>
              <Link href="/catalogue">Catalogue</Link>
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
                        src={getProductImageSrc(p)}
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          handleProductImageError(e.currentTarget, p);
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
              title={userLabel}
              onClick={() => (user ? setSettingsOpen((v) => !v) : setLoginOpen(true))}
              aria-expanded={settingsOpen}
              style={{
                width: "auto",
                minWidth: 0,
                maxWidth: "clamp(96px, 34vw, 156px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 10px",
              }}
            >
              <i className="ri-user-smile-line" />
              <span
                className="user-name"
                style={{
                  display: "inline-block",
                  maxWidth: "calc(100% - 22px)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userLabel}
              </span>
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
            <button
              className="icon-btn cart-btn"
              aria-label="Panier"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/?cart=1";
                }
              }}
            >
              <i className="ri-shopping-bag-3-line" />
              <span className="cart-badge">{cartCount}</span>
            </button>
            <button
              className="icon-btn hamburger-btn"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              onClick={toggleMobileMenu}
            >
              <i className={menuOpen ? "ri-close-line" : "ri-menu-line"} />
            </button>
          </div>
        </div>
        <div className={`mobile-search-wrap ${searchBarVisible ? "" : "mobile-search-hidden"}`}>
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
                      src={getProductImageSrc(p)}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        handleProductImageError(e.currentTarget, p);
                      }}
                    />
                    <span className="nav-result-label">{getDisplayTitle(p.title)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div
            id="mobile-nav-panel"
            className={`mobile-menu ${menuOpen ? "show" : ""}`}
            role="navigation"
            aria-hidden={!menuOpen}
            aria-label="Navigation mobile"
          >
            {user ? <div className="mobile-menu-user">{userLabel}</div> : null}
            <div className="mobile-menu-links">
              <Link className="mobile-menu-link" href="/cartes-cadeaux" onClick={closeMobileMenu}>
                Cartes Cadeaux
              </Link>
              <Link className="mobile-menu-link" href="/streaming" onClick={closeMobileMenu}>
                Streaming
              </Link>
              <Link className="mobile-menu-link" href="/catalogue" onClick={closeMobileMenu}>
                Catalogue
              </Link>
              {user ? (
                <>
                  <Link className="mobile-menu-link" href="/settings" onClick={closeMobileMenu}>
                    Paramètres
                  </Link>
                  <Link className="mobile-menu-link" href="/history" onClick={closeMobileMenu}>
                    Historique
                  </Link>
                  <button
                    type="button"
                    className="mobile-menu-link mobile-menu-link--danger"
                    onClick={() => {
                      closeMobileMenu();
                      handleSignOut();
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="mobile-menu-link mobile-menu-link--primary"
                  onClick={() => {
                    closeMobileMenu();
                    switchAuthMode("login");
                    setLoginOpen(true);
                  }}
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="nav-spacer" />

      {loginOpen && (
        <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>
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
                  <div
                    style={{
                      margin: "12px 0 10px",
                      padding: "12px 14px",
                      border: "1px solid #f3d7bf",
                      borderRadius: "12px",
                      background: "#fff7ef",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        color: "#3a2d24",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => {
                          const accepted = e.target.checked;
                          setPrivacyAccepted(accepted);
                          if (accepted) {
                            persistPrivacyAccepted();
                          }
                        }}
                        style={{ marginTop: "3px" }}
                      />
                      <span>
                        Avant toute connexion, vous devez accepter la{" "}
                        <Link href="/confidentialite" target="_blank" rel="noreferrer">
                          politique de confidentialité
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                  <label className="remember">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <span>Se souvenir de moi</span>
                  </label>
                  {!privacyAccepted && (
                    <div className="auth-error">
                      Accès bloqué : cochez d’abord la case d’acceptation de la politique de confidentialité.
                    </div>
                  )}
                  <button
                    className="btn-full modal-primary"
                    type="button"
                    onClick={handleLoginPassword}
                    disabled={authLoading || !canAttemptLogin}
                    aria-disabled={!canAttemptLogin}
                    style={{
                      opacity: canAttemptLogin ? 1 : 0.55,
                      cursor: canAttemptLogin ? "pointer" : "not-allowed",
                    }}
                    title={!canAttemptLogin ? "Vous devez accepter la politique de confidentialité avant toute connexion." : undefined}
                  >
                    {authLoading ? "Connexion..." : "Se connecter"}
                  </button>
                  <button
                    className="google-btn"
                    type="button"
                    onClick={handleLoginGoogle}
                    disabled={!canAttemptLogin}
                    aria-disabled={!canAttemptLogin}
                    style={{
                      opacity: canAttemptLogin ? 1 : 0.55,
                      cursor: canAttemptLogin ? "pointer" : "not-allowed",
                    }}
                    title={!canAttemptLogin ? "Vous devez accepter la politique de confidentialité avant toute connexion." : undefined}
                  >
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

      {user && policyModalOpen && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Acceptation requise</h3>
            </div>
            <div className="modal-body">
              {policyStatusLoading && <div className="auth-success">Vérification de votre statut en cours...</div>}
              {policyError && <div className="auth-error">{policyError}</div>}
              {!policyStatusLoading && (
                <>
                  <p>
                    Avant d’accéder au système, vous devez accepter la{" "}
                    <Link href="/confidentialite" target="_blank" rel="noreferrer">
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                  <p>
                    Cette acceptation est enregistrée avec votre identifiant, la date et l’heure, ainsi que votre adresse
                    IP lorsque celle-ci est disponible.
                  </p>
                  <button
                    className="btn-full modal-primary"
                    type="button"
                    onClick={handleAcceptPolicy}
                    disabled={policySubmitting}
                  >
                    {policySubmitting ? "Enregistrement..." : "J’accepte la politique de confidentialité"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {user && policyAcceptedAt && !policyModalOpen && (
        <div style={{ display: "none" }} aria-hidden="true">
          {policyAcceptedAt}
        </div>
      )}
    </>
  );
}

