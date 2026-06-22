import { NextRequest, NextResponse } from "next/server";
import { buildAdminAuthToken, ADMIN_COOKIE_NAME, ADMIN_TOKEN_MAX_AGE, AdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || body?.username || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // 1. Get user profile from public.users table to verify role
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, role, permissions, status")
      .eq("email", email)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // 2. Prevent normal clients from logging in
    if (user.role === "client") {
      return NextResponse.json({ error: "Accès refusé. Réservé aux administrateurs." }, { status: 403 });
    }

    // 3. Prevent suspended admins from logging in
    if (user.status === "suspended") {
      return NextResponse.json({ error: "Ce compte administrateur a été suspendu." }, { status: 403 });
    }

    // 4. Authenticate password via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // 5. Build our secure custom admin JWT token containing the profile details
    const adminUser: AdminUser = {
      id: user.id,
      email: user.email,
      name: user.name || email,
      role: user.role || "admin",
      permissions: user.permissions || {
        dashboard: true,
        orders: true,
        stock: true,
        users: true,
        settings: true,
      },
    };

    const token = buildAdminAuthToken(adminUser);
    const response = NextResponse.json({ success: true, user: adminUser });

    // Set cookie for admiflexipass dashboard
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_TOKEN_MAX_AGE,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}

