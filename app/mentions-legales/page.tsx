import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

export default function MentionsLegalesPage() {
  return (
    <>
      <HeaderMain />
      <main className="legal-page market-shell">
        <section className="legal-section market-section">
          <div className="section-head market-head" style={{ justifyContent: "center" }}>
            <h1 style={{ textAlign: "center", width: "100%" }}>Mentions légales</h1>
          </div>

          <div className="legal-content" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24 }}>
            <section className="legal-section">
              <h2>1. Présentation du service</h2>
              <p>
                Le site FlexiPass propose la vente et la distribution de produits numériques, notamment des cartes
                cadeaux, abonnements et accès à des services en ligne. L'utilisation de la plateforme implique
                l'acceptation pleine et entière des présentes mentions légales ainsi que des règles applicables
                aux services proposés.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Conditions d'utilisation des services</h2>
              <p>
                L'accès aux services FlexiPass est réservé à une utilisation légale, personnelle et conforme aux
                lois en vigueur. L'utilisateur s'engage à fournir des informations exactes lors de son inscription,
                de ses achats et de toute interaction avec la plateforme.
              </p>
              <ul className="legal-list">
                <li>Les services doivent être utilisés uniquement pour des besoins licites et autorisés.</li>
                <li>Les produits numériques achetés ne doivent pas être revendus de manière frauduleuse.</li>
                <li>FlexiPass peut suspendre ou restreindre un accès en cas d'usage abusif ou suspect.</li>
                <li>La disponibilité de certains services peut varier selon les périodes, fournisseurs ou zones.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Règles et obligations des utilisateurs</h2>
              <p>En utilisant FlexiPass, chaque utilisateur accepte de respecter les obligations suivantes :</p>
              <ul className="legal-list">
                <li>ne pas usurper l'identité d'une autre personne ni créer de faux compte ;</li>
                <li>ne pas tenter d'accéder sans autorisation aux systèmes, comptes ou données du service ;</li>
                <li>ne pas utiliser la plateforme pour diffuser du contenu illicite, frauduleux ou trompeur ;</li>
                <li>protéger ses identifiants, mots de passe et moyens d'accès personnels ;</li>
                <li>respecter les conditions spécifiques applicables aux produits et fournisseurs partenaires.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Responsabilité</h2>
              <p>
                FlexiPass s'efforce d'assurer un accès fiable à la plateforme, mais ne peut garantir une
                disponibilité continue et sans interruption. Des opérations de maintenance, incidents techniques ou
                contraintes liées à des services tiers peuvent affecter temporairement le fonctionnement du site.
              </p>
              <p>
                L'utilisateur demeure responsable de l'usage fait de son compte, de ses achats et des informations
                qu'il communique. Toute utilisation non conforme aux présentes règles peut entraîner la suspension
                de l'accès au service, sans préjudice de toute action appropriée.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Propriété du contenu</h2>
              <p>
                Les éléments présents sur la plateforme, y compris les textes, visuels, logos, interfaces et
                contenus associés, sont protégés par les règles applicables en matière de propriété intellectuelle.
                Toute reproduction, extraction, diffusion ou exploitation non autorisée peut être interdite.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Contact</h2>
              <p>
                Pour toute question relative au fonctionnement du site, aux conditions d'utilisation des services
                ou aux obligations applicables aux utilisateurs, vous pouvez contacter l'équipe FlexiPass via les
                moyens de contact proposés sur la plateforme.
              </p>
            </section>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
