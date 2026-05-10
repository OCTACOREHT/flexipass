"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

type BankKey = "sogebank" | "unibank";
type PaymentMethod = "moncash" | "transfer";

const CART_KEY = "flexipass_cart";
const EMPTY_CART: CartItem[] = [];

let cachedRawCart = "__INIT__";
let cachedParsedCart: CartItem[] = EMPTY_CART;

const bankAccounts: Record<
  BankKey,
  { bank: string; accountName: string; accountNumber: string; branch: string; reference: string }
> = {
  sogebank: {
    bank: "Sogebank",
    accountName: "FlexiPass Haiti",
    accountNumber: "01-234-567890",
    branch: "Port-au-Prince",
    reference: "FPSOG",
  },
  unibank: {
    bank: "Unibank",
    accountName: "FlexiPass Haiti",
    accountNumber: "10-987-654321",
    branch: "Port-au-Prince",
    reference: "FPUNI",
  },
};

const formatHtg = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} HTG`;
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
  const [method, setMethod] = useState<PaymentMethod>("moncash");
  const [bank, setBank] = useState<BankKey>("sogebank");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofName, setProofName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [moncashRef] = useState("FPMON-001");

  const [orderError, setOrderError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);
  const [moncashConfirmed, setMoncashConfirmed] = useState(false);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const selectedBank = bankAccounts[bank];
  const transferCode = `${selectedBank.reference}-001`;
  const isTransferReady = method !== "transfer" || Boolean(proofName);
  const canSubmit = items.length > 0 && !submitting && isTransferReady;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("transactionId") || params.get("transaction_id");
    if (!transactionId) return;

    fetch("/api/payments/moncash/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setMoncashConfirmed(true);
        }
      })
      .catch(() => null);
  }, []);

  const handleSubmitPayment = async () => {
    if (method === "transfer" && !proofName) {
      setOrderError("Ajoutez la preuve de virement avant de soumettre.");
      return;
    }

    setSubmitting(true);
    setOrderError(null);
    setMessage(null);
    setAuthRequired(false);
    setEmailSentToast(false);

    try {
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabaseBrowser = mod?.supabaseBrowser;
      let currentUser = null;

      let accessToken: string | null = null;
      if (supabaseBrowser) {
        const { data } = await supabaseBrowser.auth.getUser();
        currentUser = data?.user || null;
        const sessionData = await supabaseBrowser.auth.getSession();
        accessToken = sessionData.data.session?.access_token || null;
      }

      if (!accessToken) {
        setAuthRequired(true);
        return;
      }

      let proofUrl = null;
      if (method === "transfer" && proofFile && supabaseBrowser) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const { error: uploadError } = await supabaseBrowser.storage
          .from('orders')
          .upload(filePath, proofFile);

        if (uploadError) throw new Error("Échec de l'upload de la preuve : " + uploadError.message);

        const { data: urlData } = supabaseBrowser.storage
          .from('orders')
          .getPublicUrl(filePath);
        
        proofUrl = urlData.publicUrl;
      }

      const payload = {
        customer_email: currentUser?.email || "guest@example.com",
        customer_name: currentUser?.user_metadata?.full_name || "Client",
        user_id: currentUser?.id || null,
        items: items.map(i => ({ product_id: i.id, quantity: i.qty, price: i.price })),
        total,
        payment_method: method === "moncash" ? "moncash_test" : "virement",
        payment_proof_url: proofUrl
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Erreur de création de commande");
      }

      const data = await res.json();
      const createdOrderId = (data?.order?.id || data?.order_id) as string;
      if (method === "transfer") {
        setEmailSentToast(true);
        setTimeout(() => setEmailSentToast(false), 5000);
      }

      if (method === "moncash") {
        const moncashRes = await fetch("/api/payments/moncash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            orderId: createdOrderId,
            customerEmail: currentUser?.email || "guest@example.com",
          }),
        });

        if (!moncashRes.ok) {
          throw new Error((await moncashRes.text()) || "Erreur d'initiation MonCash");
        }

        const moncashData = await moncashRes.json();
        const paymentUrl = moncashData?.redirect_url || moncashData?.payment_url;

        if (!paymentUrl) {
          throw new Error("MonCash n'a pas renvoyé d'URL de paiement");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(CART_KEY, JSON.stringify([]));
          window.dispatchEvent(new Event("cart:updated"));
          window.location.href = paymentUrl;
        }

        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(CART_KEY, JSON.stringify([]));
        window.dispatchEvent(new Event("cart:updated"));
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Échec création commande, réessayez.";
      setOrderError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeaderMain />
      <main className="detail-wrap payment-wrap">
        <section className="detail-grid payment-grid">
          <div className="detail-left payment-left">
            <div className="detail-card">
              <div className="detail-head">
                <div className="detail-icon">
                  <img src="/assets/images/payments/MC-removebg-preview.png" alt="Paiement" />
                  <span className="detail-badge">Paiement</span>
                </div>
                <div className="payment-head-content">
                  <h1>Mode de paiement</h1>
                  <p className="muted">Choisissez votre méthode pour finaliser la commande.</p>
                  <div className="detail-flags payment-flags">
                    <span>
                      <i className="ri-flashlight-line" /> MonCash automatique
                    </span>
                    <span>
                      <i className="ri-bank-line" /> Virement Sogebank / Unibank
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Récapitulatif</h3>
              {items.length === 0 ? (
                <div className="pay-empty">
                  <p>Votre panier est vide.</p>
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

            <div className="detail-card">
              <h3>Informations</h3>
              <div className="detail-bullets fancy-bullets">
                <span>
                  <i className="ri-shield-check-line" /> MonCash est confirmé automatiquement.
                </span>
                <span>
                  <i className="ri-file-upload-line" /> Pour virement, ajoutez la preuve de transfert.
                </span>
                <span>
                  <i className="ri-time-line" /> Vérification du virement sous environ 24 h.
                </span>
              </div>
            </div>
          </div>

          <div className="detail-right payment-right">
            <div className="detail-card">
              {items.length > 0 && (
                <div className="detail-price">
                  <span className="big">{formatHtg(total)}</span>
                  <span className="pill red">À payer</span>
                </div>
              )}

              <h4>Choisir le paiement</h4>
              <div className="plan-list">
                <button
                  type="button"
                  className={`plan-item ${method === "moncash" ? "active" : ""}`}
                  onClick={() => setMethod("moncash")}
                >
                  <div>
                    <div className="plan-title">MonCash automatique</div>
                    <div className="muted">Confirmation immédiate</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`plan-item ${method === "transfer" ? "active" : ""}`}
                  onClick={() => setMethod("transfer")}
                >
                  <div>
                    <div className="plan-title">Virement bancaire</div>
                    <div className="muted">Sogebank ou Unibank + preuve</div>
                  </div>
                </button>
              </div>

              {method === "moncash" && (
                <div className="pay-block">
                  <div className="bank-info">
                    <div className="bank-row">
                      <span className="bank-label">Numéro MonCash :</span>
                      <strong className="bank-value">+509 37 00 00 00</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Référence :</span>
                      <strong className="bank-value">{moncashRef}</strong>
                    </div>
                  </div>
                </div>
              )}

              {method === "transfer" && (
                <div className="pay-block">
                  <div className="pay-banks">
                    <button
                      type="button"
                      className={`pay-bank ${bank === "sogebank" ? "active" : ""}`}
                      onClick={() => setBank("sogebank")}
                    >
                      Sogebank
                    </button>
                    <button
                      type="button"
                      className={`pay-bank ${bank === "unibank" ? "active" : ""}`}
                      onClick={() => setBank("unibank")}
                    >
                      Unibank
                    </button>
                  </div>

                  <div className="bank-info">
                    <div className="bank-row">
                      <span className="bank-label">Banque :</span>
                      <strong className="bank-value">{selectedBank.bank}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Titulaire :</span>
                      <strong className="bank-value">{selectedBank.accountName}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">N° compte :</span>
                      <strong className="bank-value">{selectedBank.accountNumber}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Agence :</span>
                      <strong className="bank-value">{selectedBank.branch}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Code de référence :</span>
                      <strong className="bank-value">{transferCode}</strong>
                    </div>
                  </div>

                  <div className="pay-proof">
                    <label htmlFor="proof">Preuve de virement</label>
                    <input
                      id="proof"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setProofFile(file);
                        setProofName(file?.name ?? "");
                      }}
                    />
                    {proofName ? <small>Fichier : {proofName}</small> : <small>Aucun fichier sélectionné.</small>}
                  </div>

                  <div className="pay-note">Vérification manuelle sous environ 24 h.</div>
                </div>
              )}

              <div className="cta-stack">
                <button
                  className="btn-full modal-primary"
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmitPayment}
                  style={!canSubmit ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                >
                  {submitting ? "Création en cours..." : (method === "moncash" ? "Payer avec MonCash" : "Soumettre le virement")}
                </button>
                <Link className="btn-full ghost-btn" href="/#cart">
                  Retour au panier
                </Link>
              </div>

              {orderError && <div className="auth-error" style={{ color: "red", marginTop: 12 }}>{orderError}</div>}
              {message && <div className="auth-success" style={{ marginTop: 12 }}>{message}</div>}
            </div>
          </div>
        </section>
      </main>
      <FooterMain />

      {/* MonCash Confirmed Modal */}
      {moncashConfirmed && (
        <div className="modal-overlay">
          <div className="modal text-center" style={{ padding: "40px 20px" }}>
            <div className="modal-icon" style={{ fontSize: 48, color: "#10b981", marginBottom: 16 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
            <h2>Commande confirmée !</h2>
            <p className="muted" style={{ margin: "12px 0 24px" }}>
              Votre paiement MonCash a été confirmé.<br/>
              Statut : en traitement.
            </p>
            <div className="cta-stack">
              <Link href="/history" className="btn-primary" style={{ display: "block" }}>
                Consulter mon historique
              </Link>
              <Link href="/catalogue" className="btn-ghost" style={{ display: "block", marginTop: 8 }}>
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auth Required Modal */}
      {authRequired && (
        <div className="modal-overlay" onClick={() => setAuthRequired(false)}>
          <div className="modal text-center" style={{ padding: "40px 20px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ fontSize: 48, color: "#ef4444", marginBottom: 16 }}>
              <i className="ri-lock-2-line" />
            </div>
            <h2>Connexion requise</h2>
            <p className="muted" style={{ margin: "12px 0 24px" }}>
              Vous devez être connecté pour passer une commande.
            </p>
            <div className="cta-stack">
              <Link href="/?login=1" className="btn-primary" style={{ display: "block" }}>
                Se connecter
              </Link>
              <button className="btn-ghost" style={{ display: "block", marginTop: 8 }} onClick={() => setAuthRequired(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Sent Toast Modal */}
      {emailSentToast && (
        <div className="modal-overlay" style={{ animation: "fadeIn 180ms ease-out" }}>
          <div
            className="modal text-center"
            style={{
              padding: "40px 20px",
              transform: "translateY(6px)",
              animation: "popIn 180ms ease-out forwards",
            }}
          >
            <div className="modal-icon" style={{ fontSize: 48, color: "#10b981", marginBottom: 16 }}>
              <i className="ri-checkbox-circle-fill" />
            </div>
            <h2>Votre commande a été effectuée</h2>
            <p className="muted" style={{ margin: "12px 0 0" }}>

            </p>
          </div>
        </div>
      )}
    </>
  );
}
