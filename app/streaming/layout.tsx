import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnements Streaming Numériques",
  description: "Achetez vos pass streaming numériques instantanément. Activation immédiate et sécurisée sur FlexiPass.",
  openGraph: {
    title: "Abonnements Streaming Numériques | FlexiPass",
    description: "Achetez vos pass streaming numériques instantanément. Activation immédiate et sécurisée sur FlexiPass.",
    url: "https://www.flexipass.shop/streaming",
  },
  alternates: {
    canonical: "/streaming",
  }
};

export default function StreamingLayout({ children }: { children: React.ReactNode }) {
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.flexipass.shop/" },
      { "@type": "ListItem", "position": 2, "name": "Streaming", "item": "https://www.flexipass.shop/streaming" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {children}
    </>
  );
}
