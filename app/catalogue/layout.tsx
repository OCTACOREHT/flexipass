import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Complet - Cartes Cadeaux Gaming, Tech, Shopping",
  description: "Parcourez tout le catalogue FlexiPass : abonnements Tech, Gaming, Shopping et Streaming à prix réduits. Livraison instantanée 24/7.",
  openGraph: {
    title: "Catalogue Complet - Cartes Cadeaux Gaming, Tech, Shopping | FlexiPass",
    description: "Parcourez tout le catalogue FlexiPass : abonnements Tech, Gaming, Shopping et Streaming à prix réduits. Livraison instantanée 24/7.",
    url: "https://www.flexipass.shop/catalogue",
  },
  alternates: {
    canonical: "/catalogue",
  }
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
