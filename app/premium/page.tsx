import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

const premiumProducts = [
  { id: "chatgpt-plus", title: "ChatGPT Plus", subtitle: "Accès avance + images illimitees", badge: "-25%", tag: "AI Tools" },
  { id: "claude-pro", title: "Claude Pro", subtitle: "Raisonnement long et contextes etendus", badge: "-60%", tag: "AI Tools" },
  { id: "gemini-adv", title: "Gemini Advanced", subtitle: "Modeles multimodaux Google", badge: "-40%", tag: "AI Tools" },
  { id: "copilot-pro", title: "Canva + Copilot", subtitle: "Création et assistance IA premium", badge: "Combo", tag: "Crea" },
];

export default function PremiumPage() {
  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <section className="market-hero">
          <div className="market-hero-inner">
            <div>
              <p className="hero-eyebrow">Premium</p>
              <h1>Offres IA et Pro</h1>
              <p>Boostez votre productivite avec nos abonnements IA negocies.</p>
              <div className="market-hero-actions">
                <a className="btn-primary" href="/catalogue">Voir le catalogue</a>
                <a className="btn-ghost" href="/streaming">Voir streaming</a>
              </div>
            </div>
          </div>
        </section>

        <section className="market-section">
          <div className="section-head market-head">
            <h2>Choisissez votre plan</h2>
            <a className="link" href="/">Retour boutique</a>
          </div>
          <div className="premium-grid">
            {premiumProducts.map((p) => (
              <article key={p.id} className="premium-card market-card--premium">
                <div className="premium-top">
                  <div className="premium-badge">{p.badge}</div>
                  <span className="premium-tag">{p.tag}</span>
                </div>
                <h3>{p.title}</h3>
                <p className="premium-sub">{p.subtitle}</p>
                <div className="premium-actions">
                  <button className="btn-full modal-primary" type="button">
                    S'abonner
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}


