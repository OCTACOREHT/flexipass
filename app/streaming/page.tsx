import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import { getProductImageSrc } from "@/lib/product-brand";
import Link from "next/link";

type ServiceItem = {
  title: string;
  desc: string;
  price: string;
  image_url?: string;
};

const videoServices: ServiceItem[] = [
  { title: "Netflix", desc: "Films et series", price: "A partir de 1200 HTG" },
  { title: "Disney+", desc: "Films et univers Disney", price: "A partir de 1300 HTG", image_url: "/assets/images/brands/disneyplus.svg" },
  { title: "Amazon Prime Video", desc: "Series et films Prime", price: "A partir de 1000 HTG" },
  { title: "HBO Max", desc: "Blockbusters et series HBO", price: "A partir de 1400 HTG" },
];

const musicServices: ServiceItem[] = [
  { title: "Spotify Premium", desc: "Musique sans pub", price: "A partir de 900 HTG" },
  { title: "Apple Music", desc: "Catalogue Apple Music", price: "A partir de 1000 HTG" },
];

const animeServices: ServiceItem[] = [
  { title: "Crunchyroll", desc: "Streaming anime", price: "A partir de 1100 HTG" },
];

export default function StreamingPage() {
  const renderServiceCard = (item: ServiceItem) => (
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
          <div className="price market-service-price">{item.price}</div>
        </div>
      </div>
      <a className="btn-full ghost-btn" href="/catalogue">
        Voir details
      </a>
    </article>
  );

  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <section className="market-hero">
          <div className="market-hero-inner">
            <div>
              <p className="hero-eyebrow">FlexiPass</p>
              <h1>Streaming</h1>
              <p>Films, series et musique : activez vos acces en un instant.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir les offres</a>
                <a className="btn-ghost" href="/cartes-cadeaux">Voir Cartes Cadeaux</a>
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
            <h2>🎧 Streaming musique</h2>
          </div>
          <div className="market-grid">
            {musicServices.map((item) => renderServiceCard(item))}
          </div>

          <div className="section-head market-head" style={{ marginTop: 24 }}>
            <h2>🍥 Streaming anime</h2>
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
