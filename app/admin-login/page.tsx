"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setShouldShake(false);

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || "Échec de la connexion");
        setShouldShake(true);
        return;
      }

      router.push("/admiflexipass");
    } catch (err) {
      setError("Impossible de se connecter, réessayez.");
      setShouldShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear shake state after animation ends
  useEffect(() => {
    if (shouldShake) {
      const timer = setTimeout(() => setShouldShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  return (
    <main className="relative min-h-screen bg-[#0a0a14] flex items-center justify-center overflow-hidden font-sans antialiased text-white">
      {/* Custom styles for autocomplete inputs override and micro-animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        /* Elegant spiral mount animation for the logo */
        @keyframes spiral-in {
          0% {
            opacity: 0;
            transform: scale(0.1) rotate(-540deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-spiral-in {
          animation: spiral-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Auto-fill styling override to keep inputs dark and match dark theme */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0a0b12 inset !important;
          -webkit-text-fill-color: #e4e4e7 !important;
          caret-color: #ef4444 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Cyber/Grid digital background matching dashboard */}
      <div className="absolute inset-0 bg-[#0c0d19]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      
      {/* Subtle deep red ambient spotlight behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />

      {/* Centered Login Card */}
      <div 
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/5 bg-[#141526] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
          shouldShake ? "animate-shake border-red-500/40 shadow-[0_20px_50px_rgba(239,68,68,0.15)]" : ""
        }`}
      >
        {/* Neon glowing line at the top border of the card */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-600/10 via-red-500/80 to-red-600/10" />

        {/* Centered Logo & Header for better visual weight */}
        <div className="flex flex-col items-center text-center mb-8 mt-2">
          {/* Enlarged, Glowing Logo Emblem with elegant spiral mount */}
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1d1e38] border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)] p-4.5 hover:border-red-500/60 transition-all duration-300 group animate-spiral-in">
            {/* Pulsing light behind the logo */}
            <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-md group-hover:bg-red-500/20 transition-all duration-300" />
            <img
              src="/flexipass-icon.png"
              alt="FlexiPass Logo"
              className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.35)]"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 mb-1">
            CONSOLE DE SÉCURITÉ
          </p>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white leading-none">
            Connexion <span className="text-red-500">Admin</span>
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mt-3.5">
            Authentifiez-vous pour accéder au hub d'intelligence d'affaires et superviser les flux de transactions.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Nom d’utilisateur
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                className="w-full rounded-xl border border-white/5 bg-[#0a0b12] pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition duration-200 focus:border-red-500/35 focus:ring-4 focus:ring-red-500/5"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Identifiant"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Mot de passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                className="w-full rounded-xl border border-white/5 bg-[#0a0b12] pl-10 pr-10 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition duration-200 focus:border-red-500/35 focus:ring-4 focus:ring-red-500/5"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
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

          {/* Action Button styled like sidebar sync pill/dashboard buttons */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? "Validation..." : "Se connecter"}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Error Box */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <p>{error}</p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
            Réseau sécurisé SSL • Tentatives enregistrées
          </p>
        </div>
      </div>
    </main>
  );
}


