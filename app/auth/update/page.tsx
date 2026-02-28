"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Mot de passe mis à jour. Vous pouvez revenir à l'accueil.");
  };

  return (
    <main className="update-wrapper">
      <div className="update-card">
        <h1>Mettre à jour le mot de passe</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
        {error && <p className="update-error">{error}</p>}
        {message && <p className="update-success">{message}</p>}
        <Link className="update-link" href="/">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}


