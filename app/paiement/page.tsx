"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

const CART_KEY = "flexipass_cart";
const WHATSAPP_NUMBER = "50938341517";
const EMPTY_CART: CartItem[] = [];

let cachedRawCart = "__INIT__";
let cachedParsedCart: CartItem[] = EMPTY_CART;

const formatHtg = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} HTG`;

const buildWhatsAppMessage = ({
  orderId,
  customerName,
  customerEmail,
  items,
  total,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
}) => {
  const lines = items.map((item) => `- ${item.title} x${item.qty} (${formatHtg(item.price * item.qty)})`).join("\n");

  return [
    "Bonjour, je souhaite faire traiter cette commande.",
    `Commande : #${orderId}`,
    `Client : ${customerName}`,
    `Email : ${customerEmail}`,
    "",
    "Articles :",
    lines || "- Aucun article",
    "",
    `Total : ${formatHtg(total)}`,
    "Merci.",
  ].join("\n");
};

const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const toCheckoutImageSrc = (raw?: string | null) => {
  const value = raw?.trim();
  if (!value) return "/assets/images/brands/chatgpt.svg";
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return `/api/image?url=${encodeURIComponent(value)}`;
  if (/^(data:|blob:)/i.test(value)) return value;
  return `/${value.replace(/^\/+/, "")}`;
};

const getServerCartSnapshot = (): CartItem[] => EMPTY_CART;

const getCartSnapshot = (): CartItem[] => {
  if (typeof window === "undefined") return EMPTY_CART;
  const raw = localStorage.getItem(CART_KEY) ?? "";
  if (raw === cachedRawCart) return cachedParsedCart;
  cachedRawCart = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedParsedCart = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedParsedCart;
  } catch {
    cachedParsedCart = EMPTY_CART;
    return cachedParsedCart;
  }
};

const subscribeCart = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener("cart:updated", onCustom as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("cart:updated", onCustom as EventListener);
  };
};

export default function PaiementPage() {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const canSubmit = items.length > 0 && !submitting;

  const handleSubmitPayment = async () => {
    if (!items.length) return;

    setSubmitting(true);
    setOrderError(null);
    setAuthRequired(false);

    try {
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabaseBrowser = mod?.supabaseBrowser;

      if (!supabaseBrowser) {
        setOrderError("Configuration Supabase manquante ou invalide.");
        return;
      }

      const { data: userData } = await supabaseBrowser.auth.getUser();
      const currentUser = userData?.user || null;
      const sessionData = await supabaseBrowser.auth.getSession();
      const accessToken = sessionData.data.session?.access_token || null;

      if (!accessToken) {
        setAuthRequired(true);
        return;
      }

      const payload = {
        customer_email: currentUser?.email || "guest@example.com",
        customer_name: currentUser?.user_metadata?.full_name || "Client",
        user_id: currentUser?.id || null,
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty, price: i.price })),
        total,
        payment_method: "whatsapp",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Erreur de création de commande");
      }

      const data = await res.json();
      const createdOrderId = String(data?.order?.id || data?.order_id || "commande");
      const whatsappMessage = buildWhatsAppMessage({
        orderId: createdOrderId,
        customerName: currentUser?.user_metadata?.full_name || "Client",
        customerEmail: currentUser?.email || "guest@example.com",
        items,
        total,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event("cart:updated"));
        window.location.href = buildWhatsAppUrl(whatsappMessage);
        return;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Échec création commande, réessayez.";
      setOrderError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeaderMain />
      <main>
        <div className="pay-shell">

          {/* ── Hero ── */}
          <div className="pay-hero">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="pay-hero-icon">
                <i className="ri-secure-payment-line" aria-hidden="true" />
              </span>
              <div>
                <h1 style={{ margin: 0, fontSize: "clamp(1.25rem, 1rem + 0.9vw, 1.7rem)", lineHeight: 1.1 }}>
                  Finaliser la commande
                </h1>
                <p style={{ margin: "4px 0 0", color: "#6b5f6e" }}>
                  Vérifiez votre panier et validez via WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="pay-grid">

            {/* Left — récapitulatif */}
            <div className="pay-card">
              <div className="pay-card-head">
                <strong>Récapitulatif</strong>
                {items.length > 0 && (
                  <span>
                    {items.length} article{items.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="pay-empty">
                  <i className="ri-shopping-cart-line" style={{ fontSize: 34, color: "#d4b8a0" }} aria-hidden="true" />
                  <p style={{ margin: 0 }}>Votre panier est vide.</p>
                  <Link className="btn-ghost" href="/catalogue">
                    Retour au catalogue
                  </Link>
                </div>
              ) : (
                <>
                  <div className="pay-summary-list">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.price}`} className="pay-summary-item">
                        <div className="pay-summary-thumb">
                          <img
                            className="pay-summary-img"
                            src={toCheckoutImageSrc(item.image)}
                            alt={item.title}
                            width={42}
                            height={42}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/assets/images/brands/chatgpt.svg";
                            }}
                          />
                        </div>
                        <div className="pay-summary-info">
                          <strong>{item.title}</strong>
                          <span>Qté : {item.qty}</span>
                        </div>
                        <div className="pay-summary-price">{formatHtg(item.price * item.qty)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pay-total">
                    <span>Total</span>
                    <strong>{formatHtg(total)}</strong>
                  </div>
                </>
              )}
            </div>

            {/* Right — paiement */}
            <div className="pay-card">
              <div className="pay-card-head">
                <strong>Mode de paiement</strong>
              </div>

              {/* WhatsApp option */}
              <div className="pay-option active" style={{ cursor: "default" }}>
                <span className="pay-wa-icon" aria-hidden="true">
                  <i className="ri-whatsapp-line" />
                </span>
                <div>
                  <div className="pay-option-title">WhatsApp</div>
                  <div className="pay-option-sub">
                    Votre commande est envoyée directement à notre équipe
                  </div>
                </div>
              </div>

              <div className="pay-note">
                <i className="ri-information-line" aria-hidden="true" />{" "}
                En validant, vous serez redirigé sur WhatsApp avec tous les détails de votre commande.
              </div>

              {items.length > 0 && (
                <div className="pay-amount-box">
                  <span style={{ color: "#6a6070", fontWeight: 600 }}>Montant total</span>
                  <strong className="pay-amount-big">{formatHtg(total)}</strong>
                </div>
              )}

              <div className="cta-stack" style={{ marginTop: 4 }}>
                <button
                  className="btn-whatsapp"
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmitPayment}
                  style={!canSubmit ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden="true" />
                      Création en cours…
                    </>
                  ) : (
                    <>
                      <i className="ri-whatsapp-line" aria-hidden="true" />
                      Commander via WhatsApp
                    </>
                  )}
                </button>
                <Link className="ghost-btn" href="/#cart" style={{ display: "block", textAlign: "center" }}>
                  Retour au panier
                </Link>
              </div>

              {orderError && (
                <div className="auth-error" style={{ marginTop: 10 }}>
                  <i className="ri-error-warning-line" aria-hidden="true" /> {orderError}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <FooterMain />

      {authRequired && (
        <div className="modal-overlay" onClick={() => setAuthRequired(false)}>
          <div
            className="modal text-center"
            style={{ padding: "40px 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, color: "#ef4444", marginBottom: 14 }}>
              <i className="ri-lock-2-line" aria-hidden="true" />
            </div>
            <h2 style={{ margin: "0 0 10px" }}>Connexion requise</h2>
            <p className="muted" style={{ margin: "0 0 24px" }}>
              Vous devez être connecté pour passer une commande.
            </p>
            <div className="cta-stack">
              <Link href="/?login=1" className="btn-primary" style={{ display: "block" }}>
                Se connecter
              </Link>
              <button
                className="btn-ghost"
                style={{ display: "block", marginTop: 8 }}
                onClick={() => setAuthRequired(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
