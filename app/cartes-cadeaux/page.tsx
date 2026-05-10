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
  { title: "PlayStation Store", desc: "Credits et jeux PSN", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Xbox Gift Card", desc: "Jeux et contenus Xbox", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Steam Wallet", desc: "Credits Steam PC", price: "675 HTG", plan: "12 mois", duration_days: 360 },
  { title: "Nintendo eShop", desc: "Credits Nintendo Switch", price: "1350 HTG", plan: "12 mois", duration_days: 360 },
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
          Voir details
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
              <h1>Cartes Cadeaux</h1>
              <p>Offrez la liberte de choisir : cartes digitales, livraison instantanee.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir le catalogue</a>
                <a className="btn-ghost" href="/streaming">Voir streaming</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head market-head--split">
            <h2>Selections populaires</h2>
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
                <strong>Instantane</strong>
                <div className="muted">Livraison immediate par email</div>
              </div>
            </div>
            <div className="market-feature">
              <div className="market-dot">Safe</div>
              <div>
                <strong>Securise</strong>
                <div className="muted">Paiement protege et fiable</div>
              </div>
            </div>
            <div className="market-feature">
              <div className="market-dot">Gift</div>
              <div>
                <strong>Ideal cadeau</strong>
                <div className="muted">Montants varies, valides immediatement</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
