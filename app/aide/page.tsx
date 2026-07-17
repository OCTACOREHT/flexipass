import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aide & FAQ - FlexiPass",
  description: "Trouvez des réponses à vos questions concernant l'achat, l'activation et la livraison de vos abonnements et cartes cadeaux sur FlexiPass.",
  alternates: {
    canonical: "/aide",
  }
};

export default function AidePage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Comment fonctionne la livraison des abonnements sur FlexiPass ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Les abonnements et cartes cadeaux sont livrés instantanément par voie numérique dès la confirmation du paiement, 24h/24 et 7j/7." }
      },
      {
        "@type": "Question",
        "name": "L'activation de mon abonnement est-elle garantie ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Oui, FlexiPass garantit l'activation de chaque abonnement acheté et propose une assistance premium 7j/7 en cas de problème." }
      },
      {
        "@type": "Question",
        "name": "Quels moyens de paiement sont acceptés sur FlexiPass ?",
        "acceptedAnswer": { "@type": "Answer", "text": "FlexiPass utilise des transactions 100% sécurisées via les principaux moyens de paiement en ligne." }
      },
      {
        "@type": "Question",
        "name": "Puis-je offrir un abonnement FlexiPass en cadeau ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Oui, toutes les cartes cadeaux FlexiPass peuvent être achetées et envoyées numériquement à un tiers." }
      }
    ]
  };

  return (
    <>
      <HeaderMain />
      <main className="market-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
        <section className="market-section" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <div className="section-head market-head" style={{ justifyContent: "center", marginBottom: "40px" }}>
            <h1 style={{ textAlign: "center", width: "100%", fontSize: "2rem" }}>Centre d'Aide & FAQ FlexiPass</h1>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="detail-card">
              <h3 style={{ marginBottom: "12px", color: "var(--text-main)" }}>Comment fonctionne la livraison des abonnements sur FlexiPass ?</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Les abonnements et cartes cadeaux sont livrés instantanément par voie numérique dès la confirmation du paiement, 24h/24 et 7j/7.</p>
            </div>
            
            <div className="detail-card">
              <h3 style={{ marginBottom: "12px", color: "var(--text-main)" }}>L'activation de mon abonnement est-elle garantie ?</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Oui, FlexiPass garantit l'activation de chaque abonnement acheté et propose une assistance premium 7j/7 en cas de problème. En tant que revendeur de licences numériques de confiance, nous vérifions systématiquement la validité de nos produits.</p>
            </div>
            
            <div className="detail-card">
              <h3 style={{ marginBottom: "12px", color: "var(--text-main)" }}>Quels moyens de paiement sont acceptés sur FlexiPass ?</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>FlexiPass utilise des transactions 100% sécurisées via les principaux moyens de paiement en ligne (MonCash, Natcash, Cartes de crédit). Vos données financières sont entièrement chiffrées et protégées.</p>
            </div>
            
            <div className="detail-card">
              <h3 style={{ marginBottom: "12px", color: "var(--text-main)" }}>Puis-je offrir un abonnement FlexiPass en cadeau ?</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Oui, toutes les cartes cadeaux FlexiPass peuvent être achetées et envoyées numériquement à un tiers. C'est l'idée cadeau de dernière minute idéale pour les passionnés de gaming, tech, shopping et divertissement.</p>
            </div>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
