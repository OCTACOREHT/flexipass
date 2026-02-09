import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const titleFont = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-title",
});

const bodyFont = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FlexiPass | Cartes Cadeaux Numériques",
  description: "Offrez le choix avec nos cartes numériques instantanées.",
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
      <body className={`${titleFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
