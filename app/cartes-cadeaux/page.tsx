import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import AddToCartButton from "@/components/cart/AddToCartButton";
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
  { title: "Roblox", desc: "Robux et abonnements", price: "450 HTG", plan: "Variable", duration_days: 0 },
  { title: "Netflix", desc: "Cartes abonnements", price: "1125 HTG", plan: "1 mois", duration_days: 30 },
  { title: "Apple Gift Card", desc: "App Store & iTunes", price: "900 HTG", plan: "Variable", duration_days: 0 },
  { title: "Google Play", desc: "Jeux et applications", price: "900 HTG", plan: "Variable", duration_days: 0 },
];

export default function CartesCadeauxPage() {
  const renderGiftCard = (item: GiftItem) => {
    const planMeta = getPlanBoxData(item.plan, item.duration_days);

    return (
      <article className="compact-card" key={item.title}>
        <div className="compact-logo">
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
            <h1 style={{ margin: '16px auto' }}>Cartes cadeaux digitales</h1>
            <p style={{ margin: '0 auto 24px', opacity: 0.9 }}>
              Offrez la liberté de choisir. Des cartes numériques pour tous vos besoins,<br/>
              livrées instantanément par email et sécurisées.
            </p>
            <div className="hero-cta" style={{ justifyContent: 'center' }}>
              <a className="btn-primary" href="/catalogue">Voir le catalogue</a>
              <a className="btn-ghost" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} href="/streaming">Voir le streaming</a>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '20px' }}>
          <div className="section-head">
            <h2 style={{ fontSize: '28px' }}>Sélections populaires</h2>
            <Link className="link" href="/">Retour accueil →</Link>
          </div>
          <div className="compact-grid" style={{ marginTop: '30px' }}>
            {gifts.map((item) => renderGiftCard(item))}
          </div>
        </section>

        <section className="section" style={{ paddingTop: '10px', paddingBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="feature-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fff0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d00', fontSize: '24px', flexShrink: 0 }}>
                <i className="ri-flashlight-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Instantané</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Livraison par email dès la validation.</div>
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
                <i className="ri-gift-line"></i>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: '#2e2a32', fontWeight: 800 }}>Idéal cadeau</strong>
                <div style={{ fontSize: '14px', color: '#6f656e', lineHeight: 1.4 }}>Montants variés, utilisables de suite.</div>
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
