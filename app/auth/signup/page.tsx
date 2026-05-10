"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    if (!supabaseBrowser) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: name ? { full_name: name } : undefined,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Vérifiez votre email pour confirmer votre compte.");
  };

  return (
    <main className="update-wrapper">
      <div className="update-card">
        <h1>Créer un compte</h1>
        <form onSubmit={handleSubmit} className="update-form">
          <label>
            Nom complet (optionnel)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Votre mot de passe"
            />
          </label>
          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Confirmez le mot de passe"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>
        {error && <p className="update-error">{error}</p>}
        {message && <p className="update-success">{message}</p>}
        <div className="update-links">
          <Link className="update-link" href="/auth/reset">
            Mot de passe oublié ?
          </Link>
          <Link className="update-link" href="/">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}


