import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionTimeout from "@/components/SessionTimeout";

const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
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
      <body className={appFont.variable}>
        <SessionTimeout />
        {children}
      </body>
    </html>
  );
}
