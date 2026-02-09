import React from "react";

const premiumProducts = [
  { id: "chatgpt-plus", title: "ChatGPT Plus", subtitle: "Accès avancé + images illimitées", badge: "-25%", tag: "AI Tools" },
  { id: "claude-pro", title: "Claude Pro", subtitle: "Raisonnement long et contextes étendus", badge: "-60%", tag: "AI Tools" },
  { id: "gemini-adv", title: "Gemini Advanced", subtitle: "Modèles multimodaux Google", badge: "-40%", tag: "AI Tools" },
  { id: "copilot-pro", title: "Canva + Copilot", subtitle: "Création et assistance IA premium", badge: "Combo", tag: "Créa" },
];

export default function PremiumPage() {
  return (
    <main className="page-shell">
      <section className="page-hero premium-hero">
        <div className="page-hero-inner">
          <p className="hero-eyebrow">Premium</p>
          <h1>Offres IA et Pro</h1>
          <p>Boostez votre productivité avec nos abonnements IA et outils créatifs négociés.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Choisissez votre plan</h2>
          <a className="link" href="/">Retour boutique →</a>
        </div>
        <div className="premium-grid">
          {premiumProducts.map((p) => (
            <article key={p.id} className="premium-card">
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
  );
}
