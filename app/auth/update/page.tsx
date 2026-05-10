"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

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
    if (!supabaseBrowser) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }
    const { error } = await supabaseBrowser.auth.updateUser({ password });
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


