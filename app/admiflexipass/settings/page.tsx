"use client";

import Link from "next/link";
import { type ElementType, type ReactNode } from "react";
import {
  CircleGauge,
  Compass,
  ExternalLink,
  Globe,
  Lock,
  LogOut,
  PanelTop,
  RefreshCcw,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

type IconType = ElementType<{ size?: number; className?: string }>;

type CardItem = {
  label: string;
  description: string;
  icon: IconType;
  href?: string;
  value?: string;
  badge?: string;
  badgeClass?: string;
  valueClassName?: string;
};

const modules: CardItem[] = [
  { label: "Dashboard", description: "Vue principale du panel", icon: PanelTop, href: "/admiflexipass" },
  { label: "Commandes", description: "Paiements et validation", icon: ShoppingCart, href: "/admiflexipass/orders" },
  { label: "Stock", description: "Produits et inventaire", icon: Store, href: "/admiflexipass/stock" },
  { label: "Membres", description: "Comptes clients", icon: Users, href: "/admiflexipass/users" },
  { label: "Admins", description: "Rôles et permissions", icon: Shield, href: "/admiflexipass/admins" },
  { label: "Paramètres", description: "Réglages du panel", icon: Settings, href: "/admiflexipass/settings" },
];

const infos: CardItem[] = [
  { label: "Accès au site", description: "Ouvre la partie publique dans un nouvel onglet.", icon: Lock },
  { label: "Gestion admin", description: "Un seul administrateur peut accéder au contenu du panel.", icon: Settings },
  { label: "Navigation", description: "Une navigation simple et rapide pour atteindre les sections accessibles.", icon: Compass },
  { label: "Sécurité", description: "Une sécurité optimale pour votre interface.", icon: ShieldCheck },
];

function SectionTitle({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-4xl">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.45em] text-red-500">{badge}</p>
      <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{subtitle}</p>
    </div>
  );
}

function Button({
  children,
  onClick,
  href,
  icon: Icon,
  tone = "dark",
  external = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: IconType;
  tone?: "primary" | "dark";
  external?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200";
  const style =
    tone === "primary"
      ? "bg-[#e63946] text-white hover:bg-[#ff7a59] hover:text-white hover:shadow-xl hover:shadow-orange-500/20"
      : "bg-[#171717] text-zinc-100 border border-[#2a2a2a] hover:border-red-500/35 hover:bg-[#1f1f1f]";

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={`${base} ${style}`}
      >
        {Icon ? <Icon size={16} /> : null}
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  description,
  valueClassName = "",
  badge,
  badgeClass,
}: CardItem) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/35 hover:shadow-lg hover:shadow-black/30">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/90">{label}</p>
        <p className={`mt-2 text-2xl font-black text-white ${valueClassName}`}>{value}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
      </div>
      {badge ? (
        <div
          className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${badgeClass}`}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
}

function GridCard({ item }: { item: CardItem }) {
  const cardClasses =
    "group block overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/35 hover:shadow-lg hover:shadow-black/30";

  const content = (
    <div className="min-w-0">
      <h3 className="text-sm font-bold text-white">{item.label}</h3>
      <p className="mt-1 text-xs leading-5 text-zinc-400">{item.description}</p>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

export default function SettingsPage() {
  const handleLogout = () => {
    window.location.href = "/admin-login";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="max-w-4xl">
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-red-500">ADMIN</p>
              <div className="mt-2 flex flex-wrap items-start gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                  Paramètres du Panel FlexiPass
                </h1>
                <Sparkles className="mt-1 text-red-500" size={24} aria-hidden="true" />
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Page claire et liée au panel. Les accès sont simples, les textes sont bien rangés, et les cartes
                restent lisibles sans débordement.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="http://localhost:3000" external tone="primary" icon={ExternalLink}>
                Aller au site
              </Button>
              <Button onClick={handleLogout} icon={LogOut}>
                Déconnexion
              </Button>
              <Button onClick={handleRefresh} icon={RefreshCcw}>
                Rafraîchir
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Accès"
            value="Rapide"
            description="Déconnexion classée et accès direct."
            icon={CircleGauge}
          />
          <StatCard label="Modules" value="6" description="Sections principales du panel." icon={PanelTop} />
          <StatCard
            label="Site"
            value="Ouvert"
            description="Le site public est disponible."
            icon={Globe}
            valueClassName="text-green-400"
            badge="Ouvert"
            badgeClass="bg-green-500/10 text-green-400"
          />
          <StatCard
            label="Statut"
            value="ACTIF"
            description="Le panel est prêt et fonctionnel."
            icon={Shield}
            valueClassName="text-green-400"
            badge="ACTIF"
            badgeClass="bg-green-500/10 text-green-400"
          />
        </section>

        <section className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 sm:p-8">
          <SectionTitle
            badge="●●●●●●●"
            title="Modules du panel"
            subtitle="Accédez directement aux sections principales sans passer par le menu."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {modules.map((item) => (
              <GridCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 sm:p-8">
          <SectionTitle
            badge="●●●●●●●"
            title="Infos du panel"
            subtitle="Infos simples pour garder la page fiable et lisible à l'admin."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {infos.map((item) => (
              <GridCard key={item.label} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
