import FooterMain from "@/components/FooterMain";
import HeaderMain from "@/components/HeaderMain";

export default function ConfidentialitePage() {
  return (
    <>
      <HeaderMain />
      <main className="legal-page market-shell">
        <section className="legal-section market-section">
          <div className="section-head market-head" style={{ justifyContent: "center" }}>
            <h1 style={{ textAlign: "center", width: "100%" }}>Politique de confidentialité</h1>
          </div>

          <div className="legal-content" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24 }}>
            <section className="legal-section">
              <h2>1. Collecte des données personnelles</h2>
              <p>
                FlexiPass peut collecter certaines données personnelles lorsque vous utilisez la plateforme,
                notamment lors de la création d'un compte, de la connexion, d'un achat, d'une demande
                d'assistance ou d'un échange avec notre service client.
              </p>
              <p>
                Ces données peuvent inclure, selon votre utilisation du service, votre nom, votre adresse email,
                vos informations de profil, l'historique de vos commandes, des informations techniques de
                connexion ainsi que toute donnée que vous décidez de nous transmettre volontairement.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Utilisation des données</h2>
              <p>Les données personnelles collectées sont utilisées pour :</p>
              <ul className="legal-list">
                <li>gérer votre compte utilisateur et sécuriser votre accès ;</li>
                <li>traiter vos commandes et assurer la fourniture des produits ou services numériques ;</li>
                <li>répondre à vos demandes d'assistance et améliorer la qualité du service ;</li>
                <li>prévenir les fraudes, abus, accès non autorisés et incidents techniques ;</li>
                <li>respecter nos obligations légales, réglementaires et comptables.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Conservation et protection</h2>
              <p>
                Nous mettons en place des mesures raisonnables de sécurité pour protéger les données personnelles
                contre l'accès non autorisé, la perte, l'altération ou la divulgation abusive. Les données
                sont conservées pendant la durée nécessaire à la gestion du service, au suivi commercial, à la
                prévention des litiges et au respect de la loi.
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Responsabilités des utilisateurs concernant leurs données</h2>
              <p>
                Chaque utilisateur est responsable de l'exactitude des informations personnelles qu'il fournit
                sur FlexiPass. Il lui appartient également de protéger ses identifiants, son mot de passe, ses
                codes de validation et toute information confidentielle liée à son compte.
              </p>
              <p>
                Vous vous engagez à ne pas publier, transmettre ou partager vos données personnelles sensibles sur
                des espaces publics, dans des messages non sécurisés ou avec des tiers non autorisés. En cas de
                suspicion d'accès frauduleux ou de compromission, vous devez modifier vos accès et nous contacter
                sans délai.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Partage volontaire avec des tiers</h2>
              <p>
                Si un utilisateur partage volontairement ses données personnelles, informations de connexion,
                identifiants, codes ou tout autre élément confidentiel avec un tiers, FlexiPass ne pourra être tenu
                responsable des conséquences de ce partage.
              </p>
              <p>
                Aucun remboursement ne sera émis si un utilisateur communique volontairement ses données
                personnelles à un tiers et que cette divulgation entraîne une perte, une utilisation frauduleuse,
                un accès non autorisé ou tout autre préjudice.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Droits et contact</h2>
              <p>
                Vous pouvez demander la mise à jour ou la suppression de certaines informations liées à votre compte,
                sous réserve de nos obligations légales et opérationnelles. Pour toute question relative à la
                confidentialité ou au traitement de vos données, vous pouvez contacter l'équipe FlexiPass via les
                canaux d'assistance disponibles sur la plateforme.
              </p>
            </section>
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}
