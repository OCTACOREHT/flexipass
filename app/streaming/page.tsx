import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import AddToCartButton from "@/components/cart/AddToCartButton";
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
  { title: "Netflix", desc: "Films et séries", price: "1200 HTG", plan: "1 mois", duration_days: 30 },
  { title: "Disney+", desc: "Films et univers Disney", price: "1300 HTG", plan: "1 mois", duration_days: 30, image_url: "/assets/images/brands/disneyplus.svg" },
  { title: "Amazon Prime Video", desc: "Séries et films Prime", price: "1000 HTG", plan: "1 mois", duration_days: 30 },
  { title: "HBO Max", desc: "Blockbusters et séries HBO", price: "1400 HTG", plan: "1 mois", duration_days: 30 },
];

const musicServices: ServiceItem[] = [
  { title: "Spotify Premium", desc: "Musique sans pub", price: "900 HTG", plan: "1 mois", duration_days: 30 },
  { title: "Apple Music", desc: "Catalogue Apple Music", price: "1000 HTG", plan: "1 mois", duration_days: 30 },
];

const animeServices: ServiceItem[] = [
  { title: "Crunchyroll", desc: "Streaming anime", price: "1100 HTG", plan: "1 mois", duration_days: 30 },
];

export default function StreamingPage() {
  const renderServiceCard = (item: ServiceItem) => {
    const planMeta = getPlanBoxData(item.plan, item.duration_days);

    return (
      <article className="compact-card luxe" key={item.title}>
        <div className="compact-logo-white">
          <img
            src={getProductImageSrc(item)}
            alt={item.title}
            width={32}
            height={32}
            loading="lazy"
          />
        </div>
        <div className="compact-info">
          <h3 className="compact-title">{item.title}</h3>
          <div className="compact-subtitle">{item.desc}</div>
          <div className="compact-meta">
            <span className="compact-meta-line">Plan : {planMeta.planLabel}</span>
            <span className="compact-meta-line">
              Durée : <strong className="compact-meta-strong">{planMeta.durationLabel}</strong>
            </span>
          </div>
          <div className="compact-price">{item.price}</div>
        </div>
        <div className="compact-actions">
          <AddToCartButton
            item={{
              title: item.title,
              price: item.price,
              image: getProductImageSrc(item),
            }}
          />
          <a className="btn-icon" href="/catalogue" title="Voir les détails">
            <i className="ri-arrow-right-line" />
          </a>
        </div>
      </article>
    );
  };

  return (
    <>
      <HeaderMain />
      <main className="page-wrap">
        <section className="hero" style={{ marginBottom: '40px' }}>
          <div className="hero-inner" style={{ padding: '60px 20px 80px', textAlign: 'center' }}>
            <div className="hero-eyebrow">FLEXIPASS</div>
            <h1 style={{ margin: '16px auto' }}>Streaming Premium</h1>
            <p style={{ margin: '0 auto 24px', opacity: 0.9 }}>
              Films, séries et musique : activez vos accès en un instant.<br/>
              Profitez du meilleur divertissement sans attendre.
            </p>
            <div className="hero-cta" style={{ justifyContent: 'center' }}>
              <a className="btn-primary" href="/catalogue">Voir les offres</a>
              <a className="btn-ghost" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} href="/cartes-cadeaux">Voir cartes cadeaux</a>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '20px' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '28px' }}>Services disponibles</h2>
            <Link className="link" href="/">Retour accueil →</Link>
          </div>
          <div className="compact-grid" style={{ marginTop: '30px' }}>
            {videoServices.map((item) => renderServiceCard(item))}
          </div>

          <div className="section-head" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '28px' }}>Streaming musique</h2>
          </div>
          <div className="compact-grid" style={{ marginTop: '30px' }}>
            {musicServices.map((item) => renderServiceCard(item))}
          </div>

          <div className="section-head" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '28px' }}>Streaming anime</h2>
          </div>
          <div className="compact-grid" style={{ marginTop: '30px' }}>
            {animeServices.map((item) => renderServiceCard(item))}
          </div>
        </section>

        <section className="section" style={{ paddingTop: '10px', paddingBottom: '80px', marginTop: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d00', fontSize: '24px', flexShrink: 0 }}>
                <i className="ri-flashlight-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Accès immédiat</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Vos accès livrés par email dès la validation.</div>
              </div>
            </div>
            
            <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d00', fontSize: '24px', flexShrink: 0 }}>
                <i className="ri-shield-check-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Sécurisé</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Paiements chiffrés et 100% protégés.</div>
              </div>
            </div>

            <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d00', fontSize: '24px', flexShrink: 0 }}>
                <i className="ri-tv-2-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Haute Qualité</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Profitez du meilleur de la HD et de la 4K.</div>
              </div>
            </div>

            <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d00', fontSize: '24px', flexShrink: 0 }}>
                <i className="ri-customer-service-2-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Support 7j/7</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Une assistance experte à votre écoute.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
