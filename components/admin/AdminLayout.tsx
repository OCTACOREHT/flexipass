"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const ADMIN_EMAIL = "adminflexipass@gmail.com";
const ADMIN_PASSWORD = "Fl$xip@ss@2k2^";
const AUTH_KEY = "admin_authed";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authed, setAuthed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(AUTH_KEY) === "yes"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem(AUTH_KEY, "yes");
      setError(null);
    } else {
      setError("Identifiants invalides");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setEmail("");
    setPassword("");
  };

  if (!authed) {
    return (
      <main className="update-wrapper">
        <div className="update-card" style={{ maxWidth: 420 }}>
          <h1>Accès admin</h1>
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Mot de passe
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-text"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </label>
            <button type="submit">Se connecter</button>
          </form>
          {error && <p className="update-error">{error}</p>}
          <p className="update-success">Email par défaut : {ADMIN_EMAIL}</p>
        </div>
      </main>
    );
  }

  return <AdminShell onLogout={handleLogout}>{children}</AdminShell>;
}


