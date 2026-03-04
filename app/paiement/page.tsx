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
  const [proofName, setProofName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [moncashRef] = useState("FPMON-001");

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const selectedBank = bankAccounts[bank];
  const transferCode = `${selectedBank.reference}-001`;

  const handleMoncash = () => {
    setMessage("Paiement Moncash lance. Validation automatique en cours.");
  };

  const handleTransfer = () => {
    if (!proofName) {
      setMessage("Ajoutez la preuve de virement avant de soumettre.");
      return;
    }
    setMessage("Preuve recue. Verification manuelle sous environ 24 h.");
  };

  const handleSubmitPayment = () => {
    if (method === "moncash") {
      handleMoncash();
      return;
    }
    handleTransfer();
  };

  return (
    <>
      <HeaderMain />
      <main className="detail-wrap">
        <section className="detail-grid">
          <div className="detail-left">
            <div className="detail-card">
              <div className="detail-head">
                <div className="detail-icon">
                  <img src="/assets/images/payments/MC-removebg-preview.png" alt="Paiement" />
                  <span className="detail-badge">Paiement</span>
                </div>
                <div>
                  <h1>Mode de paiement</h1>
                  <p className="muted">Choisissez votre methode pour finaliser la commande.</p>
                  <div className="detail-flags">
                    <span>
                      <i className="ri-flashlight-line" /> Moncash automatique
                    </span>
                    <span>
                      <i className="ri-bank-line" /> Virement Sogebank / Unibank
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Recapitulatif</h3>
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
                          <span>Qte : {item.qty}</span>
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
                  <i className="ri-shield-check-line" /> Moncash est confirme automatiquement.
                </span>
                <span>
                  <i className="ri-file-upload-line" /> Pour virement, ajoutez la preuve de transfert.
                </span>
                <span>
                  <i className="ri-time-line" /> Verification virement sous environ 24 h.
                </span>
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-card">
              {items.length > 0 && (
                <div className="detail-price">
                  <span className="big">{formatHtg(total)}</span>
                  <span className="pill red">A payer</span>
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
                    <div className="plan-title">Moncash automatique</div>
                    <div className="muted">Confirmation immediate</div>
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
                      <span className="bank-label">Numero Moncash :</span>
                      <strong className="bank-value">+509 37 00 00 00</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Reference :</span>
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
                      <span className="bank-label">No compte :</span>
                      <strong className="bank-value">{selectedBank.accountNumber}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Agence :</span>
                      <strong className="bank-value">{selectedBank.branch}</strong>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">Code reference :</span>
                      <strong className="bank-value">{transferCode}</strong>
                    </div>
                  </div>

                  <div className="pay-proof">
                    <label htmlFor="proof">Preuve de virement</label>
                    <input
                      id="proof"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setProofName(e.target.files?.[0]?.name ?? "")}
                    />
                    {proofName ? <small>Fichier: {proofName}</small> : <small>Aucun fichier selectionne.</small>}
                  </div>

                  <div className="pay-note">Verification manuelle en environ 24 h.</div>
                </div>
              )}

              <div className="cta-stack">
                <button
                  className="btn-full modal-primary"
                  type="button"
                  disabled={!items.length}
                  onClick={handleSubmitPayment}
                >
                  {method === "moncash" ? "Payer avec Moncash" : "Soumettre le virement"}
                </button>
                <Link className="btn-full ghost-btn" href="/#cart">
                  Retour au panier
                </Link>
              </div>

              {message && <div className="auth-success">{message}</div>}
            </div>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
