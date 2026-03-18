import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://qdzcurdestvftimwwzpj.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkemN1cmRlc3R2ZnRpbXd3enBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ4MjM1NywiZXhwIjoyMDg2MDU4MzU3fQ.SNTp4feC37cqn_U3ZWvyxuFM_pGHYRrJ6SM6jbeSTd4",
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );