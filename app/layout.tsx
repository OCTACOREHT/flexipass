import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import SessionTimeout from "@/components/SessionTimeout";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.flexipass.shop"),
  title: {
    default: "FlexiPass | Cartes Cadeaux & Abonnements Numériques Instantanés",
    template: "%s | FlexiPass",
  },
  description: "Achetez vos abonnements Google One, Grok, TradingView, N8N, Eleven Labs et plus. Livraison numérique instantanée, activation garantie, assistance 7j/7.",
  applicationName: "FlexiPass",
  authors: [{ name: "FlexiPass" }],
  keywords: ["carte cadeau numérique", "abonnement digital", "Google One", "Grok", "N8N", "TradingView", "Eleven Labs", "VidIQ", "Edx", "gift card gaming", "pass streaming"],
  alternates: {
    canonical: "/",
    languages: {
      "fr": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FlexiPass",
    locale: "fr_FR",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "mMaZO31Js4dGAoaYXrWf_YdqfmVLlPCsgaios4LxK1U",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        />
      </head>

      <body>
        <AuthCallbackHandler />
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}