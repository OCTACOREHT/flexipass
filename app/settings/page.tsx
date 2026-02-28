"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";

type UserInfo = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  provider?: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [oauthReauthing, setOauthReauthing] = useState(false);
  const [oauthInfo, setOauthInfo] = useState<string | null>(null);
  const [emailOriginal, setEmailOriginal] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabase = mod?.supabaseBrowser;
      if (!supabase) {
        if (mounted) setError("Configuration Supabase manquante.");
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      const nextUser = u
        ? {
            id: u.id,
            email: u.email,
            fullName: (u.user_metadata?.full_name as string | undefined) ?? null,
            avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? null,
            provider: (u.app_metadata?.provider as string | undefined) ?? null,
          }
        : null;
      if (!mounted) return;
      setUser(nextUser);
      setFullName(nextUser?.fullName ?? "");
      setAvatarUrl(nextUser?.avatarUrl ?? "");
      const nextEmail = nextUser?.email ?? "";
      setNewEmail(nextEmail);
      setEmailOriginal(nextEmail);
      setOauthProvider(nextUser?.provider ?? null);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shouldResume = params.get("reauth") === "1";
    const pendingEmail = window.sessionStorage.getItem("pending_email_change") || "";
    if (!shouldResume || !pendingEmail) return;

    const resume = async () => {
      setEmailSaving(true);
      setEmailError(null);
      setEmailSuccess(null);
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabase = mod?.supabaseBrowser;
      if (!supabase) {
        setEmailError("Configuration Supabase manquante.");
        setEmailSaving(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        email: pendingEmail,
      });
      if (updateError) {
        setEmailError(updateError.message);
      } else {
        setEmailSuccess("Un email de confirmation a été envoyé.");
        setNewEmail(pendingEmail);
        window.sessionStorage.removeItem("pending_email_change");
      }
      params.delete("reauth");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
      setEmailSaving(false);
    };

    resume();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) {
      setError("Configuration Supabase manquante.");
      setSaving(false);
      return;
    }
    const { error: updateError, data } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      },
    });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    const u = data.user;
    if (u) {
      setUser({
        id: u.id,
        email: u.email,
        fullName: (u.user_metadata?.full_name as string | undefined) ?? null,
        avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? null,
      });
    }
    setSuccess("Profil mis à jour");
    setSaving(false);
  };

  const handleEmailUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(null);

    if (!user?.email) {
      setEmailError("Utilisateur non connecté.");
      setEmailSaving(false);
      return;
    }
    if (!newEmail.trim()) {
      setEmailError("Veuillez saisir un nouvel email.");
      setEmailSaving(false);
      return;
    }
    if (newEmail.trim().toLowerCase() === (emailOriginal || "").toLowerCase()) {
      setEmailError("Le nouvel email doit être différent de l’actuel.");
      setEmailSaving(false);
      return;
    }
    if (oauthProvider && oauthProvider !== "email") {
      setEmailError("Connecte-toi avec ton fournisseur OAuth pour confirmer.");
      setEmailSaving(false);
      return;
    }
    if (!currentPassword) {
      setEmailError("Veuillez saisir votre mot de passe pour confirmer.");
      setEmailSaving(false);
      return;
    }

    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) {
      setEmailError("Configuration Supabase manquante.");
      setEmailSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      setEmailError("Ré-authentification échouée. Vérifiez votre mot de passe.");
      setEmailSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    });
    if (updateError) {
      setEmailError(updateError.message);
      setEmailSaving(false);
      return;
    }

    setEmailSuccess("Un email de confirmation a été envoyé.");
    setCurrentPassword("");
    setEmailSaving(false);
  };

  const handleOAuthReauth = async () => {
    setOauthReauthing(true);
    setEmailError(null);
    setEmailSuccess(null);
    if (!oauthProvider || oauthProvider === "email") {
      setEmailError("Ré-auth OAuth indisponible.");
      setOauthReauthing(false);
      return;
    }
    if (!newEmail.trim()) {
      setEmailError("Veuillez saisir un nouvel email.");
      setOauthReauthing(false);
      return;
    }
    if (newEmail.trim().toLowerCase() === (emailOriginal || "").toLowerCase()) {
      setEmailError("Le nouvel email doit être différent de l’actuel.");
      setOauthReauthing(false);
      return;
    }
    const providerLabel = oauthProvider.charAt(0).toUpperCase() + oauthProvider.slice(1);
    setOauthInfo(`Connecte-toi avec ${providerLabel} pour confirmer.`);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pending_email_change", newEmail.trim());
    }
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) {
      setEmailError("Configuration Supabase manquante.");
      setOauthReauthing(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: oauthProvider as "google" | "github" | "apple",
      options: { redirectTo: `${window.location.origin}/settings?reauth=1` },
    });
    if (error) {
      setEmailError(error.message);
      setOauthReauthing(false);
      return;
    }
    setEmailSuccess("Ré-auth OAuth lancée. Termine la connexion pour valider l’email.");
    setOauthReauthing(false);
  };

  const handleCancelEmailChange = () => {
    setNewEmail(emailOriginal);
    setCurrentPassword("");
    setEmailError(null);
    setEmailSuccess(null);
    setOauthInfo(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("pending_email_change");
    }
  };

  return (
    <>
      <HeaderMain />
      <main className="account-shell">
        <section className="account-hero">
          <div>
            <p className="hero-eyebrow">Compte</p>
            <h1>Paramètres</h1>
            <p>Gérez votre profil, vos préférences et vos informations de contact.</p>
          </div>
          <div className="account-hero-actions">
            <a className="btn-ghost" href="/catalogue">Voir le catalogue</a>
            <a className="btn-primary" href="/history">Voir mes commandes</a>
          </div>
        </section>

        <section className="account-grid">
          <aside className="account-sidebar">
            <div className="account-card profile-card">
              <div className="profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  <span>{(fullName || user?.email || "U").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="profile-meta">
                <strong>{fullName || "Compte"}</strong>
                <span>{user?.email || "Non connecté"}</span>
              </div>
              {oauthProvider && <span className="provider-pill">{oauthProvider}</span>}
            </div>
            <div className="account-card">
              <h3>Raccourcis</h3>
              <div className="account-links">
                <a className="link" href="/history">Historique</a>
                <a className="link" href="/catalogue">Catalogue</a>
                <a className="link" href="/cartes-cadeaux">Cartes cadeaux</a>
              </div>
            </div>
          </aside>

          <div className="account-main">
            {loading && <div className="account-card">Chargement...</div>}

            {!loading && !user && (
              <div className="account-card account-empty">
                <div className="account-empty-icon">
                  <i className="ri-user-3-line" />
                </div>
                <h3>Connexion requise</h3>
                <p className="muted">Connectez-vous pour acceder a vos Paramètres.</p>
                <a className="btn-ghost" href="/login">Se connecter</a>
              </div>
            )}

            {!loading && user && (
              <div className="account-stack">
                <div className="account-card">
                  <div className="card-head">
                    <div>
                      <h3>Informations personnelles</h3>
                      <p className="muted">Mettez à jour vos informations de profil.</p>
                    </div>
                  </div>
                  <form className="account-form" onSubmit={handleSave}>
                    <div className="field">
                      <label>Nom complet</label>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Votre nom" />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input value={user.email ?? ""} disabled />
                    </div>
                    <div className="field">
                      <label>URL Avatar</label>
                      <input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    {error && <div className="update-error">{error}</div>}
                    {success && <div className="update-success">{success}</div>}
                    <div className="form-actions">
                      <button type="submit" disabled={saving}>
                        {saving ? "Mise à jour..." : "Enregistrer"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-card">
                  <div className="card-head">
                    <div>
                      <h3>Changer email</h3>
                      <p className="muted">Une verification par email sera demandee.</p>
                    </div>
                  </div>
                  <form className="account-form" onSubmit={handleEmailUpdate}>
                    <div className="field">
                      <label>Email actuel</label>
                      <input value={user.email ?? ""} disabled />
                    </div>
                    <div className="field">
                      <label>Nouvel email</label>
                      <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nouveau@email.com" />
                    </div>
                    {oauthProvider && oauthProvider !== "email" ? (
                      <div className="form-actions">
                        <button type="button" className="ghost-btn" onClick={handleOAuthReauth} disabled={oauthReauthing}>
                          {oauthReauthing ? "Ré-auth..." : "Se reconnecter avec OAuth"}
                        </button>
                        <button type="button" className="ghost-btn" onClick={handleCancelEmailChange}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="field">
                        <label>Mot de passe actuel</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Confirmer votre mot de passe"
                        />
                      </div>
                    )}
                    {oauthInfo && <div className="muted">{oauthInfo}</div>}
                    {emailError && <div className="update-error">{emailError}</div>}
                    {emailSuccess && <div className="update-success">{emailSuccess}</div>}
                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={
                          emailSaving ||
                          !newEmail.trim() ||
                          newEmail.trim().toLowerCase() === (emailOriginal || "").toLowerCase()
                        }
                      >
                        {emailSaving ? "Mise à jour..." : "Modifier l’email"}
                      </button>
                      <button type="button" className="ghost-btn" onClick={handleCancelEmailChange}>
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-card">
                  <div className="card-head">
                    <div>
                      <h3>Notifications</h3>
                      <p className="muted">Choisissez ce que vous recevez par email.</p>
                    </div>
                  </div>
                  <div className="account-toggle">
                    <div>
                      <strong>Emails de commande</strong>
                      <p>Confirmation, paiement et livraison.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span />
                    </label>
                  </div>
                  <div className="account-toggle">
                    <div>
                      <strong>Offres et promotions</strong>
                      <p>Recevoir les offres exclusives FlexiPass.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterMain />
    </>
  );
}





