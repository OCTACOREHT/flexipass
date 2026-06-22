"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ArrowRight
} from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setError("Le service d'authentification n'est pas disponible.");
        setIsCheckingSession(false);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
        setIsCheckingSession(false);
      } else {
        // Wait up to 3 seconds in case hash parameters are being processed
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          if (activeSession) {
            setHasSession(true);
            setIsCheckingSession(false);
            clearInterval(interval);
          } else if (attempts >= 6) { // 3 seconds total
            setIsCheckingSession(false);
            setError("Lien d'invitation manquant, invalide ou expiré. Veuillez demander une nouvelle invitation.");
            clearInterval(interval);
          }
        }, 500);

        return () => clearInterval(interval);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabase) throw new Error("Client d'authentification introuvable");

      // 1. Update the password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Fetch active session token to notify our API to set status to 'active'
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session introuvable après la mise à jour");
      }

      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Échec d'activation finale du compte");
      }

      // Log out user so they can sign in cleanly
      await supabase.auth.signOut();

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a14] flex items-center justify-center overflow-hidden font-sans antialiased text-white">
      {/* Cyber/Grid digital background */}
      <div className="absolute inset-0 bg-[#0c0d19]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/5 bg-[#141526] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-600/10 via-red-500/80 to-red-600/10" />

        {isCheckingSession ? (
          <div className="flex flex-col items-center text-center py-10 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Vérification de l'invitation...</h2>
            <p className="text-zinc-500 text-xs max-w-xs">Nous analysons votre jeton de sécurité sécurisé.</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black italic uppercase tracking-tight text-white leading-none">
                Compte <span className="text-emerald-500">Activé !</span>
              </h1>
              <p className="text-zinc-400 text-xs max-w-sm mt-3 leading-relaxed">
                Votre mot de passe a été configuré avec succès et votre profil administrateur est maintenant opérationnel.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin-login")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/10 active:translate-y-0.5 transition-all duration-200"
            >
              <span>Se Connecter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : error && !hasSession ? (
          <div className="flex flex-col items-center text-center py-6 space-y-5">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-500">Erreur de Sécurité</h2>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">{error}</p>
            </div>
            <button
              onClick={() => router.push("/admin-login")}
              className="w-full rounded-xl border border-white/10 bg-transparent hover:bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1d1e38] border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)] p-4.5">
                <img
                  src="/flexipass-icon.png"
                  alt="FlexiPass Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.35)]"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 mb-1">CONFIGURATION ACCÈS</p>
              <h1 className="text-3xl font-black italic uppercase tracking-tight text-white leading-none">
                Initialisation <span className="text-red-500">Admin</span>
              </h1>
              <p className="text-zinc-400 text-xs mt-3.5 leading-relaxed">
                Configurez votre mot de passe pour finaliser l'ouverture de votre compte de sécurité d'administration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] pl-10 pr-10 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-red-500/35 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirmer le mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer votre mot de passe"
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-red-500/35 transition"
                  />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg active:translate-y-0.5 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <span>Valider & Activer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
