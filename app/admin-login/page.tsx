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
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result?.error || "Échec de la connexion");
        setShouldShake(true);
        return;
      }

      router.push("/admiflexipass");
    } catch {
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
    <main className="relative min-h-screen bg-[#faf9f6] flex items-center justify-center overflow-hidden font-sans antialiased text-[#2f2a33]">
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
          -webkit-text-fill-color: #2f2a33 !important;
          caret-color: #ff6a1a !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* Soft warm spotlight behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#ffecd9]/40 blur-[100px] pointer-events-none" />

      {/* Centered Login Card */}
      <div 
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#efe5d9] bg-white p-8 md:p-10 shadow-[0_12px_40px_rgba(47,42,51,0.06)] overflow-hidden transition-all duration-300 ${
          shouldShake ? "animate-shake border-red-300 shadow-[0_12px_40px_rgba(239,68,68,0.08)]" : ""
        }`}
      >
        {/* Logo emblem without background */}
        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <img
            src="/flexipass-icon.png"
            alt="FlexiPass Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Adresse e-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#ff8a00] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                className="w-full rounded-xl border border-[#e7e1d8] bg-white pl-10 pr-4 py-3 text-sm text-[#2f2a33] placeholder-zinc-400 outline-none transition duration-200 focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@flexipass.ht"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Mot de passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#ff8a00] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                className="w-full rounded-xl border border-[#e7e1d8] bg-white pl-10 pr-10 py-3 text-sm text-[#2f2a33] placeholder-zinc-400 outline-none transition duration-200 focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5"
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
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ background: "linear-gradient(120deg, #ff8a00, #ff4d00)" }}
            className="w-full flex items-center justify-center gap-2 rounded-xl hover:opacity-95 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md active:translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? "Validation..." : "Se connecter"}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Error Box */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p>{error}</p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-[#f5ece2] text-center">
          <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">
            Réseau sécurisé SSL • Tentatives enregistrées
          </p>
        </div>
      </div>
    </main>
  );
}
