"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import HeaderMain from "@/components/HeaderMain";
import FooterMain from "@/components/FooterMain";

type UserInfo = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  provider?: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
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
        setEmailSuccess("Un email de confirmation a Ã©tÃ© envoyÃ©.");
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
      });
    }
    setSuccess("Profil mis Ã  jour");
    setSaving(false);
  };

  const handleEmailUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail.trim()) {
      setEmailError("Veuillez saisir un nouvel email.");
      setEmailSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail.trim() }),
      });

      if (!res.ok) throw new Error(await res.text() || "Erreur lors de l'envoi du code.");

      setEmailSuccess(`Code envoyÃ© Ã  ${newEmail.trim()}`);
      setAwaitingVerification(true);
    } catch (err: any) {
      setEmailError(err?.message || "Erreur inattendue");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(null);

    if (!verificationCode.trim()) {
      setEmailError("Veuillez saisir le code de vÃ©rification.");
      setEmailSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/verify-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });

      if (!res.ok) throw new Error(await res.text() || "Code invalide ou expirÃ©.");

      setEmailSuccess("Code valide, email mis Ã  jour !");
      setEmailOriginal(newEmail.trim());
      setAwaitingVerification(false);
      setVerificationCode("");
      
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      if (mod?.supabaseBrowser && user) {
        setUser({ ...user, email: newEmail.trim() });
      }
    } catch (err: any) {
      setEmailError(err?.message || "Erreur de vÃ©rification");
    } finally {
      setEmailSaving(false);
    }
  };
  const handleCancelEmailChange = () => {
    setNewEmail(emailOriginal);
    setVerificationCode("");
    setAwaitingVerification(false);
    setEmailError(null);
    setEmailSuccess(null);
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
            <h1>ParamÃ¨tres</h1>
            <p>GÃ©rez votre profil, vos prÃ©fÃ©rences et vos informations de contact.</p>
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
                <span>{(fullName || user?.email || "U").slice(0, 1).toUpperCase()}</span>
              </div>
              <div className="profile-meta">
                <strong>{fullName || "Compte"}</strong>
                <span>{user?.email || "Non connectÃ©"}</span>
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
                <p className="muted">Connectez-vous pour acceder a vos ParamÃ¨tres.</p>
                <a className="btn-ghost" href="/login">Se connecter</a>
              </div>
            )}

            {!loading && user && (
              <div className="account-stack">
                <div className="account-card">
                  <div className="card-head">
                    <div>
                      <h3>Informations personnelles</h3>
                      <p className="muted">Mettez Ã  jour vos informations de profil.</p>
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
                    {error && <div className="update-error">{error}</div>}
                    {success && <div className="update-success">{success}</div>}
                    <div className="form-actions">
                      <button type="submit" disabled={saving}>
                        {saving ? "Mise Ã  jour..." : "Enregistrer"}
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
                  <form className="account-form" onSubmit={awaitingVerification ? handleVerifyCode : handleEmailUpdate}>
                    <div className="field">
                      <label>Email actuel</label>
                      <input value={user.email ?? ""} disabled />
                    </div>
                    <div className="field">
                      <label>Nouvel email</label>
                      <input 
                        value={newEmail} 
                        onChange={(e) => setNewEmail(e.target.value)} 
                        placeholder="nouveau@email.com" 
                        disabled={awaitingVerification}
                      />
                    </div>
                    
                    {awaitingVerification && (
                      <div className="field">
                        <label>Code de vÃ©rification</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Entrez le code reÃ§u"
                          required
                        />
                      </div>
                    )}

                    {emailError && <div className="update-error">{emailError}</div>}
                    {emailSuccess && <div className="update-success">{emailSuccess}</div>}
                    
                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={
                          emailSaving ||
                          (!awaitingVerification && !newEmail.trim()) ||
                          (!awaitingVerification && newEmail.trim().toLowerCase() === (emailOriginal || "").toLowerCase()) ||
                          (awaitingVerification && !verificationCode.trim())
                        }
                      >
                        {emailSaving ? "En cours..." : (awaitingVerification ? "Confirmer le code" : "Envoyer code vÃ©rif")}
                      </button>
                      {awaitingVerification && (
                        <button type="button" className="ghost-btn" onClick={handleCancelEmailChange}>
                          Annuler
                        </button>
                      )}
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






