import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU) - FlexiPass",
  description: "Consultez nos conditions générales d'utilisation, politique de remboursement et dispositions légales.",
  alternates: {
    canonical: "/cgu",
  }
};

export default function CguPage() {
  return (
    <>
      <HeaderMain />
      <main className="legal-page market-shell">
        <section className="legal-section market-section">
          <div className="section-head market-head" style={{ justifyContent: "center", flexDirection: "column", gap: "12px", textAlign: "center" }}>
            <h1 style={{ width: "100%" }}>Conditions Générales d'Utilisation (CGU)</h1>
            <p className="muted" style={{ maxWidth: 600, margin: "0 auto" }}>Politique de remboursement, d'utilisation et dispositions légales</p>
          </div>

          <div className="legal-content" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 32, marginTop: 24 }}>
            <section className="legal-section">
              <h2>1. Nature des produits vendus</h2>
              <p>
                FlexiPass propose à la vente des licences, abonnements et accès numériques fournis par des 
                partenaires tiers spécialisés. En tant que revendeur, FlexiPass s'engage à garantir l'activation 
                du produit acheté et à assurer un accompagnement en cas de difficulté technique, dans les limites 
                définies ci-dessous.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Seuil d'utilisation et éligibilité au remboursement</h2>
              <p>
                Toute demande de remboursement est évaluée en fonction du niveau d'utilisation constaté du produit 
                au moment de la demande :
              </p>
              <ul className="legal-list">
                <li>
                  <strong>Produit utilisé à 50% ou plus</strong> (durée, volume ou fonctionnalités) : la demande de remboursement 
                  est refusée, le produit étant considéré comme substantiellement consommé.
                </li>
                <li>
                  <strong>Produit utilisé à moins de 50%</strong> : après examen et validation de la demande, un remboursement 
                  partiel correspondant à 40% du montant payé peut être accordé, le solde couvrant les frais 
                  d'activation, de licence et de traitement déjà engagés par FlexiPass.
                </li>
                <li>
                  <strong>Passé un délai de 7 jours calendaires</strong> suivant la date d'achat, aucune demande de remboursement 
                  ne pourra être traitée, quel que soit le niveau d'utilisation constaté.
                </li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Vérification du niveau d'utilisation</h2>
              <p>
                FlexiPass se réserve le droit de vérifier le niveau réel d'utilisation du produit à l'aide des 
                moyens techniques disponibles (statistiques d'usage, journaux d'activation, confirmation du 
                fournisseur partenaire) avant de statuer sur toute demande de remboursement.
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Exclusions de remboursement</h2>
              <p>Aucun remboursement, total ou partiel, ne sera accordé dans les situations suivantes :</p>
              <ul className="legal-list">
                <li>Utilisation du produit au-delà du seuil de 50% défini à l'article 2 ;</li>
                <li>Erreur de sélection imputable à l'utilisateur (mauvais produit ou mauvais plan) signalée après activation ;</li>
                <li>Partage des identifiants, codes d'accès ou informations de connexion avec un tiers non autorisé, conformément à l'article 5 de la Politique de confidentialité relatif au partage volontaire de données avec des tiers ;</li>
                <li>Non-respect des conditions d'utilisation propres au fournisseur tiers du produit numérique concerné.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. Modalités de traitement des demandes</h2>
              <p>
                Toute demande de remboursement doit être adressée via les canaux d'assistance officiels de 
                FlexiPass dans un délai de 7 jours suivant l'achat, accompagnée des justificatifs requis. Après 
                validation, le montant éligible est crédité selon le mode de paiement d'origine dans un délai de 
                5 à 10 jours ouvrés.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Caractère définitif de la décision</h2>
              <p>
                Toute décision rendue par FlexiPass à l'issue de l'examen d'une demande de remboursement est 
                réputée définitive, sous réserve des recours légaux applicables dans la juridiction de 
                l'utilisateur.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Nature juridique du contrat</h2>
              <p>
                FlexiPass agit en qualité de revendeur autorisé de licences et abonnements numériques. 
                L'utilisateur reconnaît que le contrat de service (fonctionnalités, disponibilité, mises à jour) 
                relève des conditions d'utilisation propres à chaque fournisseur tiers, disponibles sur les sites 
                officiels des marques concernées. FlexiPass ne saurait être tenu responsable des modifications, 
                interruptions ou changements tarifaires décidés unilatéralement par ces fournisseurs.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Disponibilité et rupture de stock</h2>
              <p>
                FlexiPass ne garantit pas la disponibilité permanente de chaque produit du catalogue. En cas 
                d'indisponibilité après paiement, l'utilisateur est informé sans délai et un remboursement intégral 
                est effectué automatiquement, sans application du barème de l'article 2.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Limitation de responsabilité</h2>
              <p>
                La responsabilité de FlexiPass ne peut être engagée en cas de dysfonctionnement imputable au 
                fournisseur tiers, à une modification des conditions du service par ce dernier, ou à une utilisation 
                non conforme du produit par l'utilisateur.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. Litiges et médiation</h2>
              <p>
                En cas de litige non résolu à l'amiable, l'utilisateur est invité à contacter le service client de 
                FlexiPass via les canaux d'assistance disponibles sur la plateforme, dans un délai raisonnable 
                suivant la survenance du litige, afin de rechercher une solution amiable préalablement à toute 
                action judiciaire.
              </p>
            </section>

            <section className="legal-section">
              <h2>11. Droit applicable et juridiction</h2>
              <p>
                Les présentes CGU sont soumises au droit haïtien. En cas de litige non résolu à l'amiable, les 
                tribunaux compétents seront ceux de Port-au-Prince, République d'Haïti, sous réserve des 
                dispositions légales impératives éventuellement applicables au consommateur en vertu de son pays 
                de résidence, lorsque celles-ci lui seraient plus favorables.
              </p>
            </section>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
