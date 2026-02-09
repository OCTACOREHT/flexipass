"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update`,
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
