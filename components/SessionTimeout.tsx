"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SessionTimeout() {
  useEffect(() => {
    // Le site ne déconnecte plus automatiquement l'utilisateur.
    // On conserve seulement l'écoute de session pour rester cohérent avec Supabase.
    if (!supabaseBrowser) return;

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(() => {
      // Rien à faire ici: la session reste gérée par Supabase et ne doit pas être coupée automatiquement.
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return null;
}
