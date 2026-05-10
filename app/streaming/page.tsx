import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import { getProductImageSrc } from "@/lib/product-brand";
import { getPlanBoxData } from "@/lib/plan-display";
import Link from "next/link";

type ServiceItem = {
  title: string;
  desc: string;
  price: string;
  plan?: string;
  duration_days?: number;
  image_url?: string;
};

const videoServices: ServiceItem[] = [
  { title: "Netflix", desc: "Films et séries", price: "À partir de 1200 HTG", plan: "1 mois", duration_days: 30 },
  { title: "Disney+", desc: "Films et univers Disney", price: "À partir de 1300 HTG", plan: "1 mois", duration_days: 30, image_url: "/assets/images/brands/disneyplus.svg" },
  { title: "Amazon Prime Video", desc: "Séries et films Prime", price: "À partir de 1000 HTG", plan: "1 mois", duration_days: 30 },
  { title: "HBO Max", desc: "Blockbusters et séries HBO", price: "À partir de 1400 HTG", plan: "1 mois", duration_days: 30 },
];

const musicServices: ServiceItem[] = [
  { title: "Spotify Premium", desc: "Musique sans pub", price: "À partir de 900 HTG", plan: "1 mois", duration_days: 30 },
  { title: "Apple Music", desc: "Catalogue Apple Music", price: "À partir de 1000 HTG", plan: "1 mois", duration_days: 30 },
];

const animeServices: ServiceItem[] = [
  { title: "Crunchyroll", desc: "Streaming anime", price: "À partir de 1100 HTG", plan: "1 mois", duration_days: 30 },
];

export default function StreamingPage() {
  const renderServiceCard = (item: ServiceItem) => {
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
              <h1>Streaming</h1>
              <p>Films, séries et musique : activez vos accès en un instant.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir les offres</a>
                <a className="btn-ghost" href="/cartes-cadeaux">Voir les cartes cadeaux</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head market-head--split">
            <h2>Services disponibles</h2>
            <Link className="link" href="/">Retour accueil</Link>
          </div>
          <div className="market-grid">
            {videoServices.map((item) => renderServiceCard(item))}
          </div>

          <div className="section-head market-head" style={{ marginTop: 24 }}>
            <h2>Streaming musique</h2>
          </div>
          <div className="market-grid">
            {musicServices.map((item) => renderServiceCard(item))}
          </div>

          <div className="section-head market-head" style={{ marginTop: 24 }}>
            <h2>Streaming anime</h2>
          </div>
          <div className="market-grid">
            {animeServices.map((item) => renderServiceCard(item))}
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
