import type { Metadata } from "next";
import "./globals.css";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import SessionTimeout from "@/components/SessionTimeout";

export const metadata: Metadata = {
  title: "FlexiPass | Cartes Cadeaux Numériques",
  description: "Offrez le choix avec nos cartes numériques instantanées.",

  verification: {
    google: "HO3jLj3vt59YwRDX0BFE4h0Nuc7GdKQz88XzjKTY0q4",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        />
      </head>
      <body
        style={{
          "--font-sans":
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        } as React.CSSProperties}
      >
        <AuthCallbackHandler />
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}