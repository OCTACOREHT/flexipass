"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import HeaderMain from "@/components/HeaderMain";
import { getAuthCallbackUrl } from "@/lib/site-url";
import { LogOut, ExternalLink, ShieldCheck, Mail, Bell, User, History, Gift, CheckCircle2 } from "lucide-react";

type UserInfo = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  provider?: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  
  // Profil state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("fr");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [emailOriginal, setEmailOriginal] = useState("");
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [emailReauthOpen, setEmailReauthOpen] = useState(false);
  
  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const isGoogleAccount = oauthProvider === "google";

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
      const meta = u?.user_metadata || {};
      
      const nextUser = u
        ? {
            id: u.id,
            email: u.email,
            fullName: (meta.full_name as string | undefined) ?? null,
            provider: (u.app_metadata?.provider as string | undefined) ?? null,
          }
        : null;
        
      if (!mounted) return;
      setUser(nextUser);
      setFullName(nextUser?.fullName ?? "");
      setUsername((meta.username as string | undefined) ?? "");
      setLanguage((meta.language as string | undefined) ?? "fr");
      setEmailNotifications(meta.email_notifications ?? true);
      setPromoNotifications(meta.promo_notifications ?? false);
      
      const nextEmail = nextUser?.email ?? "";
      setNewEmail(nextEmail);
      setEmailOriginal(nextEmail);
      setOauthProvider(nextUser?.provider ?? null);
      setShowEmailChangeForm(false);
      setEmailReauthOpen(false);
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
    const shouldResumeEmailChange = params.get("email_reauth") === "1";
    const pendingEmail = window.sessionStorage.getItem("pending_email_change") || "";
    if (!shouldResume && !shouldResumeEmailChange) return;

    const resume = async () => {
      if (shouldResumeEmailChange) {
        setEmailReauthOpen(false);
        setShowEmailChangeForm(true);
        params.delete("email_reauth");
      }
      if (!pendingEmail) {
        params.delete("reauth");
      }
      if (shouldResume && pendingEmail) {
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
      }
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
      setEmailSaving(false);
    };

    resume();
  }, []);

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
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
        username: username.trim() || null,
        language: language,
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
    setSuccess("Profil mis à jour avec succès.");
    setSaving(false);
  };

  const handleGoogleEmailReauth = async () => {
    setEmailError(null);
    setEmailSuccess(null);
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) return;

    const callback = new URL(getAuthCallbackUrl());
    callback.searchParams.set("email_reauth", "1");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) setEmailError(error.message);
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
      if (isGoogleAccount) {
        const mod = await import("@/lib/supabase-browser").catch(() => null);
        const supabase = mod?.supabaseBrowser;
        if (!supabase) return;

        const { error: updateError, data } = await supabase.auth.updateUser({ email: newEmail.trim() });
        if (updateError) throw new Error(updateError.message);

        setEmailOriginal(newEmail.trim());
        setUser((current) => current ? { ...current, email: data.user?.email ?? newEmail.trim() } : current);
        setEmailSuccess("Adresse email mise à jour.");
        setShowEmailChangeForm(false);
        setEmailReauthOpen(false);
        return;
      }

      const res = await fetch("/api/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail.trim() }),
      });

      if (!res.ok) throw new Error(await res.text() || "Erreur lors de l'envoi du code.");

      setEmailSuccess(`Code envoyé à ${newEmail.trim()}`);
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
      setEmailError("Veuillez saisir le code de vérification.");
      setEmailSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/verify-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });

      if (!res.ok) throw new Error(await res.text() || "Code invalide ou expiré.");

      setEmailSuccess("Code valide, email mis à jour !");
      setEmailOriginal(newEmail.trim());
      setAwaitingVerification(false);
      setVerificationCode("");
      
      const mod = await import("@/lib/supabase-browser").catch(() => null);
      if (mod?.supabaseBrowser && user) {
        setUser({ ...user, email: newEmail.trim() });
      }
    } catch (err: any) {
      setEmailError(err?.message || "Erreur de vérification");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleCancelEmailChange = () => {
    setNewEmail(emailOriginal);
    setVerificationCode("");
    setAwaitingVerification(false);
    setShowEmailChangeForm(false);
    setEmailReauthOpen(false);
    setEmailError(null);
    setEmailSuccess(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("pending_email_change");
    }
  };

  const handleToggleNotification = async (type: "email" | "promo", value: boolean) => {
    if (type === "email") setEmailNotifications(value);
    else setPromoNotifications(value);
  
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    const supabase = mod?.supabaseBrowser;
    if (!supabase) return;
    
    await supabase.auth.updateUser({
      data: {
        ...(type === "email" ? { email_notifications: value } : {}),
        ...(type === "promo" ? { promo_notifications: value } : {}),
      }
    });
  };

  const handleLogout = async () => {
    const mod = await import("@/lib/supabase-browser").catch(() => null);
    if (mod?.supabaseBrowser) {
      await mod.supabaseBrowser.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <>
      <HeaderMain />
      <main className="account-shell p-4 md:p-8">
        
        {/* 1) HEADER DE PAGE */}
        <section className="settings-hero">
          <div className="settings-hero-content">
            <h1>Paramètres du compte</h1>
            <p>Gérez votre profil, votre sécurité et vos préférences de notification.</p>
          </div>
          <div className="settings-hero-actions">
            <a className="btn-ghost" href="/catalogue">Voir le catalogue</a>
            <a className="btn-primary" href="/history">Voir mes commandes</a>
          </div>
        </section>

        <section className="settings-grid">
          {loading && <div className="settings-card"><p className="muted">Chargement...</p></div>}

          {!loading && !user && (
            <div className="settings-card account-empty items-center text-center">
              <div className="account-empty-icon mb-4">
                <User size={32} />
              </div>
              <h3>Connexion requise</h3>
              <p className="muted mb-4">Connectez-vous pour accéder à vos paramètres.</p>
              <a className="btn-ghost" href="/login">Se connecter</a>
            </div>
          )}

          {!loading && user && (
            <>
              {/* 2) RÉCAPITULATIF DU COMPTE (CARD) */}
              <div className="settings-card">
                <div className="settings-recap">
                  <div className="settings-recap-left">
                    <div className="settings-recap-avatar">
                      {(fullName || user.email || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="settings-recap-info">
                      <h2>{fullName || "Compte FlexiPass"}</h2>
                      <p>{user.email}</p>
                      <span className="settings-recap-status">
                        <CheckCircle2 size={14} /> Compte vérifié
                      </span>
                    </div>
                  </div>
                  <div className="settings-recap-right">
                    <a href="#security" className="btn-ghost">Gérer la sécurité</a>
                    <div className="settings-shortcuts">
                      <a href="/history"><History size={14} /> Historique</a>
                      <a href="/catalogue"><ExternalLink size={14} /> Catalogue</a>
                      <a href="/cartes-cadeaux"><Gift size={14} /> Cartes cadeaux</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3) SECTION "Profil & informations personnelles" */}
              <div className="settings-card" id="profile">
                <div className="settings-card-header">
                  <h3>Profil & informations personnelles</h3>
                  <p>Ces informations apparaissent sur vos reçus et communications FlexiPass.</p>
                </div>
                <form className="settings-field-group" onSubmit={handleSaveProfile}>
                  <div>
                    <label>Nom complet</label>
                    <input 
                      className="mt-1"
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Ex: Jean Dupont" 
                    />
                  </div>
                  <div>
                    <label>Pseudonyme <span className="text-zinc-400 font-normal">(Facultatif)</span></label>
                    <input 
                      className="mt-1"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Ex: jdupont99" 
                    />
                  </div>
                  <div>
                    <label>Email principal</label>
                    <input 
                      className="mt-1"
                      value={user.email ?? ""} 
                      disabled 
                    />
                    <div className="help-text mt-1">Connecté via Google. L'email ne peut pas être modifié.</div>
                  </div>
                  <div>
                    <label>Langue préférée</label>
                    <select 
                      className="mt-1"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  
                  {error && <div className="update-error mt-2">{error}</div>}
                  {success && <div className="update-success mt-2">{success}</div>}
                  
                  <div className="mt-2">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              </div>

              {/* 4) SECTION "Sécurité & connexions" */}
              <div className="settings-card" id="security">
                <div className="settings-card-header">
                  <h3>Sécurité & connexions</h3>
                  <p>Gérez vos informations de connexion et sécurisez votre compte.</p>
                </div>
                
                {/* Bloc A : Email */}
                <div className="settings-action-block">
                  <div className="settings-action-block-info flex gap-3 items-start">
                    <div className="mt-1 text-zinc-400"><Mail size={20} /></div>
                    <div>
                      <h4>Email de connexion</h4>
                      <p>{user.email}</p>
                      <p className="text-[12px] mt-1 text-zinc-500">Compte lié à Google. L'email ne peut pas être modifié.</p>
                    </div>
                  </div>
                  <button type="button" className="btn-ghost" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    Lié à Google
                  </button>
                </div>

                {/* Formulaire de changement d'email (conditionnel) */}
                {(showEmailChangeForm || emailReauthOpen || awaitingVerification) && (
                  <form className="settings-field-group p-4 bg-[#fffdfa] border border-[#ff8a00]/30 rounded-xl mt-2" onSubmit={awaitingVerification ? handleVerifyCode : handleEmailUpdate}>
                    <h4 className="font-semibold text-[15px] mb-2 text-[#ff8a00]">Mise à jour de l'email</h4>
                    
                    {isGoogleAccount && !showEmailChangeForm && !emailReauthOpen && (
                      <button type="button" className="google-btn" onClick={() => setEmailReauthOpen(true)}>
                        <i className="ri-google-fill" /> Continuer avec Google
                      </button>
                    )}

                    {isGoogleAccount && emailReauthOpen && !showEmailChangeForm && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[13px] text-zinc-600">Reconnectez-vous avec Google avant de choisir un autre email.</p>
                        <div className="flex gap-2">
                          <button type="button" className="google-btn flex-1" onClick={handleGoogleEmailReauth}>
                            <i className="ri-google-fill" /> Continuer avec Google
                          </button>
                          <button type="button" className="btn-ghost" onClick={handleCancelEmailChange}>Annuler</button>
                        </div>
                      </div>
                    )}

                    {(!isGoogleAccount || showEmailChangeForm) && (
                      <div>
                        <label>Nouvel email</label>
                        <input 
                          className="mt-1"
                          value={newEmail} 
                          onChange={(e) => setNewEmail(e.target.value)} 
                          placeholder="nouveau@email.com" 
                          disabled={awaitingVerification}
                        />
                      </div>
                    )}

                    {!isGoogleAccount && awaitingVerification && (
                      <div className="mt-2">
                        <label>Code de vérification</label>
                        <input
                          className="mt-1"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Entrez le code reçu"
                          required
                        />
                      </div>
                    )}

                    {emailError && <div className="update-error mt-2">{emailError}</div>}
                    {emailSuccess && <div className="update-success mt-2">{emailSuccess}</div>}
                    
                    <div className="flex gap-2 mt-2">
                      {isGoogleAccount && !showEmailChangeForm ? (
                        <button type="button" className="btn-primary" onClick={() => setEmailReauthOpen(true)}>
                          Mettre à jour l'email
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={
                            emailSaving ||
                            (!awaitingVerification && !newEmail.trim()) ||
                            (!awaitingVerification && newEmail.trim().toLowerCase() === (emailOriginal || "").toLowerCase()) ||
                            (!isGoogleAccount && awaitingVerification && !verificationCode.trim())
                          }
                        >
                          {emailSaving
                            ? "En cours..."
                            : isGoogleAccount
                              ? "Enregistrer"
                              : awaitingVerification
                                ? "Confirmer le code"
                                : "Envoyer le code"}
                        </button>
                      )}
                      <button type="button" className="btn-ghost" onClick={handleCancelEmailChange}>Annuler</button>
                    </div>
                  </form>
                )}

                {/* Bloc B : Google */}
                <div className="settings-action-block">
                  <div className="settings-action-block-info flex gap-3 items-start">
                    <div className="mt-1 text-[#DB4437]"><i className="ri-google-fill text-[20px]" /></div>
                    <div>
                      <h4>Connexion Google</h4>
                      <p>{isGoogleAccount ? "Compte connecté via Google." : "Non connecté avec Google."}</p>
                    </div>
                  </div>
                  {isGoogleAccount ? (
                    <span className="text-[13px] font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Connecté</span>
                  ) : (
                    <button type="button" className="google-btn text-[13px] py-1.5 px-3">
                      <i className="ri-google-fill" /> Connecter
                    </button>
                  )}
                </div>

                {/* Bloc C : Placeholder sécurité avancée */}
                <div className="settings-action-block opacity-50 cursor-not-allowed">
                  <div className="settings-action-block-info flex gap-3 items-start">
                    <div className="mt-1 text-zinc-400"><ShieldCheck size={20} /></div>
                    <div>
                      <h4>Sécurité avancée (2FA)</h4>
                      <p>Protégez votre compte avec une double authentification.</p>
                    </div>
                  </div>
                  <button type="button" className="btn-ghost" disabled>Bientôt disponible</button>
                </div>
              </div>

              {/* 5) SECTION "Notifications" */}
              <div className="settings-card" id="notifications">
                <div className="settings-card-header">
                  <h3>Préférences de notifications</h3>
                  <p>Choisissez les emails que vous souhaitez recevoir.</p>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="account-toggle">
                    <div>
                      <strong>Emails de commande</strong>
                      <p>Confirmation, paiement et livraison.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-zinc-500">{emailNotifications ? "Activé" : "Désactivé"}</span>
                      <label className="switch">
                        <input type="checkbox" checked={emailNotifications} onChange={(e) => handleToggleNotification("email", e.target.checked)} />
                        <span />
                      </label>
                    </div>
                  </div>
                  <div className="account-toggle">
                    <div>
                      <strong>Offres et promotions</strong>
                      <p>Réductions et nouveautés FlexiPass.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-zinc-500">{promoNotifications ? "Activé" : "Désactivé"}</span>
                      <label className="switch">
                        <input type="checkbox" checked={promoNotifications} onChange={(e) => handleToggleNotification("promo", e.target.checked)} />
                        <span />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6) SECTION "Actions & compte" */}
              <div className="settings-card settings-danger-zone mt-8">
                <div className="settings-card-header">
                  <h3>Actions du compte</h3>
                  <p className="text-red-800">Certaines actions peuvent être définitives. Vérifiez vos informations avant de continuer.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-2 items-center justify-between">
                  <button type="button" onClick={handleLogout} className="btn-ghost w-full sm:w-auto">
                    <LogOut size={16} className="inline mr-2" /> Se déconnecter
                  </button>
                  <a href={`mailto:info@octacore.io?subject=Demande de suppression de compte&body=Bonjour, je souhaite supprimer mon compte FlexiPass associé à l'email : ${user.email}`} className="btn-danger-outline w-full sm:w-auto">
                    Demander la suppression du compte
                  </a>
                </div>
              </div>

            </>
          )}
        </section>
      </main>
    </>
  );
}
