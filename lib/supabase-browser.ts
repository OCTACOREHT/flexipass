import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

const initClient = (): SupabaseClient | null => {
  if (client) return client;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://qdzcurdestvftimwwzpj.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemN1cmRlc3R2ZnRpbXd3enBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ4MjM1NywiZXhwIjoyMDg2MDU4MzU3fQ.SNTp4feC37cqn_U3ZWvyxuFM_pGHYRrJ6SM6jbeSTd4";

  if (!url || !anonKey) return null;

  client = createBrowserClient(url, anonKey);
  return client;
};

export const supabaseBrowser = initClient();