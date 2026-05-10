import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

const initClient = (): SupabaseClient | null => {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    // Keep client nullable so UI can fail gracefully when env vars are not set.
    console.warn(
      "Supabase browser client not initialized: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null;
  }

  client = createBrowserClient(url, anonKey);
  return client;
};

export const supabaseBrowser = initClient();
