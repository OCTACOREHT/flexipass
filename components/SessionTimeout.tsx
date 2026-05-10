"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// 15 minutes en millisecondes
const TIMEOUT_MS = 15 * 60 * 1000; 

export default function SessionTimeout() {
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggedInRef = useRef(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!supabaseBrowser) return;

    // Vérifier l'état initial de la session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      isLoggedInRef.current = !!session;
      lastActivityRef.current = Date.now();
    });

    // Mettre à jour l'horodatage de la dernière activité
    const updateActivity = () => {
      if (isLoggedInRef.current) {
        lastActivityRef.current = Date.now();
      }
    };

    // Écouter les événements d'interaction utilisateur (sans mousemove pour éviter les micro-mouvements)
    const events = ["keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => 
      window.addEventListener(event, updateActivity, { passive: true })
    );

    // Vérifier périodiquement si le temps d'inactivité dépasse le délai autorisé
    const interval = setInterval(async () => {
      if (isLoggedInRef.current) {
        const inactiveTime = Date.now() - lastActivityRef.current;
        
        if (inactiveTime >= TIMEOUT_MS) {
          // Bloquer les déclenchements multiples
          isLoggedInRef.current = false; 
          
          // Afficher la notification visuelle IMMÉDIATEMENT
          setShowToast(true);
          
          // Déconnecter l'utilisateur en arrière-plan
          supabaseBrowser?.auth.signOut().catch(console.error);
          
          // Attendre 3.5 secondes pour lire le message avant de recharger la page
          setTimeout(() => {
            window.location.reload();
          }, 3500);
        }
      }
    }, 1000); // Vérification toutes les secondes

    // Écouter les changements de connexion/déconnexion depuis d'autres sources
    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        isLoggedInRef.current = !!session;
        if (session) {
          lastActivityRef.current = Date.now();
        }
      }
    );

    // Nettoyage lors du démontage du composant
    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (!showToast) return null;

  return (
    <div style={{
      position: "fixed",
      top: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#2e2a32",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
      zIndex: 99999,
      fontWeight: 600,
      fontSize: "15px",
      animation: "slideDown 0.3s ease"
    }}>
      <i className="ri-timer-line" style={{ fontSize: "1.4rem", color: "#FF6A1A" }} />
      <span>Session expirée pour inactivité. Reconnexion requise...</span>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}} />
    </div>
  );
}
