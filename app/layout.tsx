import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import SessionTimeout from "@/components/SessionTimeout";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.flexipass.shop"),

  title: "FlexiPass | Cartes Cadeaux Numériques",
  description: "Offrez le choix avec nos cartes numériques instantanées.",

  applicationName: "FlexiPass",

  verification: {
    google: "HO3jLj3vt59YwRDX0BFE4h0Nuc7GdKQz88XzjKTY0q4",
  },

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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