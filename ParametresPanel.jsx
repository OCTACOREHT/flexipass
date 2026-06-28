import React from "react";
import {
  ArrowUpRight,
  RefreshCcw,
  LogOut,
  PanelTop,
  ShoppingCart,
  Package,
  Users,
  Shield,
  Lock,
  Settings,
  Compass,
  ShieldCheck,
  CircleDot,
  CircleCheckBig,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    icon: PanelTop,
    title: "Dashboard",
    description: "Vue principale du panel",
    deco: "⌂",
  },
  {
    icon: ShoppingCart,
    title: "Commandes",
    description: "Paiements et validation",
    deco: "🛒",
  },
  {
    icon: Package,
    title: "Stock",
    description: "Produits et inventaire",
    deco: "📦",
  },
  {
    icon: Users,
    title: "Membres",
    description: "Comptes clients",
    deco: "👥",
  },
  {
    icon: Shield,
    title: "Admins",
    description: "Rôles et permissions",
    deco: "🛡️",
  },
];

const infos = [
  {
    icon: Lock,
    title: "Accès au site",
    description: "Accès garanti quelque soit votre niveau de sécurité.",
  },
  {
    icon: Settings,
    title: "Gestion admin",
    description: "Un seul administrateur peut accéder au contenu du panel.",
  },
  {
    icon: Compass,
    title: "Navigation",
    description: "Une navigation simple et rapide pour atteindre les sections accessibles.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité",
    description: "Une sécurité optimale pour votre interface.",
  },
];

function SectionTitle({ badge, title, subtitle }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.45em] text-red-500">
        {badge}
      </p>
      <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{subtitle}</p>
    </div>
  );
}

function ActionButton({ children, variant = "secondary", onClick, href, icon: Icon, external }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-[#e63946] text-white hover:bg-[#ff2d2d] shadow-lg shadow-red-500/15"
      : "bg-[#171717] text-zinc-100 border border-[#2a2a2a] hover:border-red-500/35 hover:bg-[#1f1f1f]";

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={`${base} ${styles}`}
      >
        {Icon ? <Icon size={16} /> : null}
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

function StatCard({ label, value, description, icon: Icon, valueClassName = "" }) {
  return (
    <div className="group rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/30 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500/90">{label}</p>
          <p className={`mt-2 text-2xl font-black text-white ${valueClassName}`}>{value}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2a2a2a] bg-black/20 text-red-500 transition-colors group-hover:border-red-500/35">
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ icon: Icon, title, description, deco }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/35 hover:shadow-lg hover:shadow-black/30">
      <div className="absolute right-4 top-4 text-red-500/90">{deco}</div>
      <div className="flex min-h-[122px] flex-col justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-[#2a2a2a] bg-black/20 text-red-500">
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="pt-6">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/30 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2a2a2a] bg-black/20 text-red-500">
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ParametresPanel() {
  const handleLogout = () => {
    window.location.href = "/admin-login";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* En-tête principal */}
        <section className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-red-500">
                <CircleDot size={10} />
                Panel FlexiPass
              </div>

              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                  Paramètres du Panel FlexiPass
                </h1>
                <Sparkles className="mt-1 text-red-500" size={24} aria-hidden="true" />
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Page claire et liée au panel pour accéder rapidement au site, gérer la session admin et naviguer
                vers les sections importantes sans surcharge visuelle.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionButton href="http://localhost:3000" external variant="primary" icon={ExternalLink}>
                Aller au site
              </ActionButton>
              <ActionButton onClick={handleLogout} icon={LogOut}>
                Déconnexion
              </ActionButton>
              <ActionButton onClick={handleRefresh} icon={RefreshCcw}>
                Rafraîchir
              </ActionButton>
            </div>
          </div>
        </section>

        {/* Bloc de statistiques rapides */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Accès"
            value="Rapide"
            description="Déconnexion classée et accès direct aux sections."
            icon={CircleGauge}
          />
          <StatCard
            label="Modules"
            value="3"
            description="Sections principales toujours à portée."
            icon={PanelTop}
          />
          <StatCard
            label="Site"
            value="Ouvert"
            description="Statut du panel prêt à l’usage."
            icon={Globe}
            valueClassName="text-green-400"
          />
          <StatCard
            label="Statut"
            value="ACTIF"
            description="État général affiché avec badge vert."
            icon={Shield}
            valueClassName="text-green-400"
          />
        </section>

        {/* Section modules du panel */}
        <section className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 sm:p-8">
          <SectionTitle
            badge="●●●●●●●"
            title="Modules du panel"
            subtitle="Accédez directement aux modules de l’administration sans passer par le menu principal."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {modules.map((module) => (
              <ModuleCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                deco={module.deco}
              />
            ))}
          </div>
        </section>

        {/* Section informations utiles */}
        <section className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 sm:p-8">
          <SectionTitle
            badge="●●●●●●●"
            title="Infos du panel"
            subtitle="Infos simples pour garder la page fiable et lire à l’admin."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {infoCards.map((item) => (
              <InfoCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
