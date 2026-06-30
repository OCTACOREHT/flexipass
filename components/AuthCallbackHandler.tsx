"use client";

import { useEffect } from "react";

export default function AuthCallbackHandler() {
  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const authError = params.get("auth_error");

      if (!code && !authError) return;

      if (authError) {
        params.delete("auth_error");
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", next);
        return;
      }

      const mod = await import("@/lib/supabase-browser").catch(() => null);
      const supabaseBrowser = mod?.supabaseBrowser;
      if (!supabaseBrowser) return;

      const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
      params.delete("code");
      params.delete("state");

      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);

      if (error) {
        window.location.replace(`/?auth_error=${encodeURIComponent(error.message)}`);
      }
    };

    run();
  }, []);

  return null;
}
