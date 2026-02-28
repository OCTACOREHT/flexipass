import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

const streaming = [
  { title: "Netflix", desc: "Series & films", price: "A partir de 1200 HTG" },
  { title: "Prime Video", desc: "Streaming HD", price: "A partir de 1000 HTG" },
  { title: "Spotify", desc: "Musique premium", price: "900 HTG" },
  { title: "YouTube Premium", desc: "Sans pub", price: "A partir de 1100 HTG" },
];

export default function StreamingPage() {
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
                <a className="btn-primary" href="/premium">Voir les offres premium</a>
                <a className="btn-ghost" href="/catalogue">Tout le catalogue</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head">
            <h2>Services disponibles</h2>
            <a className="link" href="/">Retour accueil</a>
          </div>
          <div className="market-grid">
            {streaming.map((p) => (
              <article className="market-card" key={p.title}>
                <h3 className="brand-name">{p.title}</h3>
                <div className="muted">{p.desc}</div>
                <div className="market-meta">
                  <div className="price">{p.price}</div>
                </div>
                <a className="btn-full ghost-btn" href="/premium">
                  S'abonner
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}

