"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { getPasswordUpdateUrl } from "@/lib/site-url";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!supabaseBrowser) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordUpdateUrl(),
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Si un compte existe, un email de réinitialisation a été envoyé.");
  };

  return (
    <main className="update-wrapper">
      <div className="update-card">
        <h1>Mot de passe oublié</h1>
        <form onSubmit={handleSubmit} className="update-form">
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
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
        {error && <p className="update-error">{error}</p>}
        {message && <p className="update-success">{message}</p>}
        <div className="update-links">
          <Link className="update-link" href="/auth/signup">
            Créer un compte
          </Link>
          <Link className="update-link" href="/">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}


