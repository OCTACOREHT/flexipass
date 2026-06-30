"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const TIMEOUT_MS = 15 * 60 * 1000;

export default function SessionTimeout() {
  const lastActivityRef = useRef<number>(0);
  const isLoggedInRef = useRef(false);
  const logoutTimerRef = useRef<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const client = supabaseBrowser;
    if (!client) return;

    const markActivity = () => {
      if (!isLoggedInRef.current) return;
      lastActivityRef.current = Date.now();
    };

    const events: (keyof WindowEventMap)[] = ["click", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((event) => window.addEventListener(event, markActivity, { passive: true }));

    const resetLogoutTimer = () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = window.setTimeout(async () => {
        if (!isLoggedInRef.current) return;
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime < TIMEOUT_MS) {
          resetLogoutTimer();
          return;
        }

        isLoggedInRef.current = false;
        setShowToast(true);

        try {
          await client.auth.signOut();
        } catch {
          // On continue le nettoyage local même si la requête réseau échoue.
        }

        window.location.reload();
      }, TIMEOUT_MS);
    };

    client.auth.getSession().then(({ data: { session } }) => {
      isLoggedInRef.current = Boolean(session);
      lastActivityRef.current = Date.now();
      if (session) {
        resetLogoutTimer();
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      isLoggedInRef.current = Boolean(session);
      if (session) {
        lastActivityRef.current = Date.now();
        resetLogoutTimer();
      } else if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    });

    const onActivity = () => {
      markActivity();
      if (isLoggedInRef.current) {
        resetLogoutTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, markActivity);
        window.removeEventListener(event, onActivity);
      });
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (!showToast) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#2e2a32",
        color: "#ffffff",
        padding: "14px 18px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
        zIndex: 99999,
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      <i className="ri-timer-line" style={{ fontSize: "1.2rem", color: "#FF6A1A" }} />
      <span>Session expirée pour inactivité. Déconnexion automatique.</span>
    </div>
  );
}
