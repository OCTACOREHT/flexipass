"use client";

import Link from "next/link";
import { type ElementType, type ReactNode, useState } from "react";
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
  Eye,
  EyeOff,
  Loader2,
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
    <div className="max-w-2xl">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.35em] text-[#ff6a1a]">{badge}</p>
      <h2 className="text-base font-bold tracking-tight text-[#2f2a33]">{title}</h2>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
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
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm";
  const style =
    tone === "primary"
      ? "bg-[#ff6a1a] text-white hover:bg-[#ff5a00]"
      : "bg-white text-zinc-600 border border-[#efe5d9] hover:bg-[#fff9f4] hover:text-[#ff6a1a] hover:border-orange-200";

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
    <div className="group overflow-hidden rounded-xl border border-[#efe5d9] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm">
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#ff6a1a]/95">{label}</p>
        <p className={`mt-1 text-lg font-bold text-[#2f2a33] ${valueClassName}`}>{value}</p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>
      </div>
      {badge ? (
        <div
          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] border ${badgeClass}`}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
}

function GridCard({ item }: { item: CardItem }) {
  const cardClasses =
    "group block overflow-hidden rounded-xl border border-[#efe5d9] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm";

  const content = (
    <div className="min-w-0">
      <h3 className="text-xs font-bold text-[#2f2a33] group-hover:text-[#ff6a1a] transition-colors">{item.label}</h3>
      <p className="mt-0.5 text-[11px] text-zinc-500">{item.description}</p>
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (!confirmLogout) return;

    try {
      await fetch("/admiflexipass/logout", { method: "POST" });
    } catch (error) {
      console.warn("Logout failed", error);
    }
    window.location.href = "/admin-login";
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || "Une erreur est survenue.");
      } else {
        setSuccess("Votre mot de passe a été mis à jour avec succès !");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Impossible de mettre à jour le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent">
      <div className="w-full pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-2">
              Paramètres du <span className="text-[#ff6a1a]">Panel</span>
            </h1>
            <p className="text-zinc-500 font-medium tracking-wide text-xs mt-0.5">
              Configurez votre panel et gérez votre session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button href="http://localhost:3000" external tone="dark" icon={ExternalLink}>
              Site Public
            </Button>
            <Button onClick={handleLogout} tone="primary" icon={LogOut}>
              Déconnexion
            </Button>
          </div>
        </div>

        <section
          className="mt-4 gap-3"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        >
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
            valueClassName="text-emerald-600"
            badge="Ouvert"
            badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200"
          />
          <StatCard
            label="Statut"
            value="ACTIF"
            description="Le panel est prêt et fonctionnel."
            icon={Shield}
            valueClassName="text-emerald-600"
            badge="ACTIF"
            badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200"
          />
        </section>

        <section className="mt-4 rounded-xl border border-[#efe5d9] bg-white p-4 sm:p-5">
          <SectionTitle
            badge="MODULES"
            title="Modules du panel"
            subtitle="Accédez directement aux sections principales sans passer par le menu."
          />

          <div
            className="mt-3 gap-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
          >
            {modules.map((item) => (
              <GridCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[#efe5d9] bg-white p-4 sm:p-5">
          <SectionTitle
            badge="INFORMATIONS"
            title="Infos du panel"
            subtitle="Infos simples pour garder la page fiable et lisible à l'admin."
          />

          <div
            className="mt-3 gap-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
          >
            {infos.map((item) => (
              <GridCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[#efe5d9] bg-white p-4 sm:p-5">
          <SectionTitle
            badge="SÉCURITÉ"
            title="Modifier mon mot de passe"
            subtitle="Modifiez le mot de passe de votre propre compte de collaborateur."
          />

          <form onSubmit={handlePasswordSubmit} className="mt-4 max-w-xl space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-semibold text-emerald-700">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1" />

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 caractères"
                    className="w-full rounded-xl border border-[#efe5d9] bg-white pl-4 pr-11 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 hover:text-[#ff6a1a]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6a1a] text-white hover:bg-[#ff5a00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Mettre à jour mon mot de passe</span>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
