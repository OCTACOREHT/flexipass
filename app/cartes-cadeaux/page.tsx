import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

const gifts = [
  { title: "PlayStation Store", desc: "Credits et jeux PSN", price: "1350 HTG" },
  { title: "Xbox Gift Card", desc: "Jeux et contenus Xbox", price: "1350 HTG" },
  { title: "Steam Wallet", desc: "Credits Steam PC", price: "675 HTG" },
  { title: "Nintendo eShop", desc: "Credits Nintendo Switch", price: "1350 HTG" },
];

export default function CartesCadeauxPage() {
  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <section className="market-hero">
          <div className="market-hero-inner">
            <div>
              <p className="hero-eyebrow">FlexiPass</p>
              <h1>Cartes Cadeaux</h1>
              <p>Offrez la liberté de choisir : cartes digitales, livraison instantanée.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir le catalogue</a>
                <a className="btn-ghost" href="/streaming">Voir streaming</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head">
            <h2>Selections populaires</h2>
            <a className="link" href="/">Retour accueil</a>
          </div>
          <div className="market-grid">
            {gifts.map((p) => (
              <article className="market-card" key={p.title}>
                <h3 className="brand-name">{p.title}</h3>
                <div className="muted">{p.desc}</div>
                <div className="market-meta">
                  <div className="price">{p.price}</div>
                </div>
                <a className="btn-full ghost-btn" href="/catalogue">
                  Voir details
                </a>
              </article>
            ))}
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

