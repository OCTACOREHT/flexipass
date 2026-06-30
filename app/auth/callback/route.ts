import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site-url";

// OAuth callback (Google, etc.)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Always redirect back to the production site root.
  const redirectUrl = new URL("/", SITE_URL);
  const response = NextResponse.redirect(redirectUrl);

  // Helper to read cookies from the incoming request header
  const cookieHeader = request.headers.get("cookie") ?? "";
  const getCookie = (name: string) => {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith(`${name}=`));
    if (!found) return null;
    const value = decodeURIComponent(found.split("=").slice(1).join("="));
    return value;
  };

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => getCookie(name),
          set: (name, value, options) => {
            response.cookies.set({ name, value, ...options });
          },
          remove: (name, options) => {
            response.cookies.set({ name, value: "", ...options, maxAge: 0 });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      response.headers.set(
        "Location",
        new URL(`/?auth_error=${encodeURIComponent(error.message)}`, SITE_URL).toString()
      );
    }
  }

  return response;
}
