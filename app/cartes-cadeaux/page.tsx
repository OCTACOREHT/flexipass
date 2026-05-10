import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import { getProductImageSrc } from "@/lib/product-brand";
import { getPlanBoxData } from "@/lib/plan-display";
import Link from "next/link";

type GiftItem = {
  title: string;
  desc: string;
  price: string;
  plan?: string;
  duration_days?: number;
  image_url?: string;
};

const gifts: GiftItem[] = [
  { title: "PlayStation Store", desc: "Crédits et jeux PSN", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Xbox Gift Card", desc: "Jeux et contenus Xbox", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Steam Wallet", desc: "Crédits Steam PC", price: "675 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Nintendo eShop", desc: "Crédits Nintendo Switch", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
];

export default function CartesCadeauxPage() {
  const renderGiftCard = (item: GiftItem) => {
    const planMeta = getPlanBoxData(item.plan, item.duration_days);

    return (
      <article className="market-card market-card--service" key={item.title}>
        <div className="market-service-row">
          <div className="compact-logo" aria-hidden="true">
            <img
              src={getProductImageSrc(item)}
              alt=""
              width={32}
              height={32}
              loading="lazy"
            />
          </div>
          <div className="market-service-content">
            <h3 className="brand-name">{item.title}</h3>
            <div className="muted">{item.desc}</div>
            <div className="market-service-meta">
              <span className="market-service-meta-line">Plan : {planMeta.planLabel}</span>
              <span className="market-service-meta-line">
                Durée : <strong className="market-service-meta-strong">{planMeta.durationLabel}</strong>
              </span>
            </div>
            <div className="price market-service-price">{item.price}</div>
          </div>
        </div>
        <a className="btn-full ghost-btn" href="/catalogue">
          Voir détails
        </a>
      </article>
    );
  };

  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <section className="market-hero">
          <div className="market-hero-inner">
            <div>
              <p className="hero-eyebrow">FlexiPass</p>
              <h1>Cartes cadeaux</h1>
              <p>Offrez la liberté de choisir : cartes digitales, livraison instantanée.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir le catalogue</a>
                <a className="btn-ghost" href="/streaming">Voir le streaming</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head market-head--split">
            <h2>Sélections populaires</h2>
            <Link className="link" href="/">Retour accueil</Link>
          </div>
          <div className="market-grid">
            {gifts.map((item) => renderGiftCard(item))}
          </div>
        </section>

        <section className="market-section">
          <div className="market-feature-strip">
            <div className="market-feature">
              <div className="market-dot">Fast</div>
              <div>
                <strong>Instantané</strong>
                <div className="muted">Livraison immédiate par email</div>
              </div>
            </div>
            <div className="market-feature">
              <div className="market-dot">Safe</div>
              <div>
                <strong>Sécurisé</strong>
                <div className="muted">Paiement protégé et fiable</div>
              </div>
            </div>
            <div className="market-feature">
              <div className="market-dot">Gift</div>
              <div>
                <strong>Idéal cadeau</strong>
                <div className="muted">Montants variés, valides immédiatement</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
