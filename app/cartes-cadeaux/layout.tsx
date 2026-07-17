import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartes Cadeaux Numériques - Gaming, Tech & Shopping",
  description: "Offrez une carte cadeau numérique FlexiPass : gaming, tech, shopping. Livraison immédiate par email, idéal cadeau de dernière minute.",
  openGraph: {
    title: "Cartes Cadeaux Numériques - Gaming, Tech & Shopping | FlexiPass",
    description: "Offrez une carte cadeau numérique FlexiPass : gaming, tech, shopping. Livraison immédiate par email, idéal cadeau de dernière minute.",
    url: "https://www.flexipass.shop/cartes-cadeaux",
  },
  alternates: {
    canonical: "/cartes-cadeaux",
  }
};

export default function CartesCadeauxLayout({ children }: { children: React.ReactNode }) {
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.flexipass.shop/" },
      { "@type": "ListItem", "position": 2, "name": "Cartes Cadeaux", "item": "https://www.flexipass.shop/cartes-cadeaux" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {children}
    </>
  );
}
