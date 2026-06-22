import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminAuthToken } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: NextRequest) {
  try {
    const ck = await cookies();
    const token = ck.get(ADMIN_COOKIE_NAME)?.value;
    const currentAdmin = verifyAdminAuthToken(token);

    if (!currentAdmin) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();
    const targetUserId = String(body?.targetUserId || currentAdmin.id);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caracteres." },
        { status: 400 }
      );
    }

    const isOwnAccount = targetUserId === currentAdmin.id;
    const isSuperAdmin = currentAdmin.role === "superadmin";

    if (!isOwnAccount && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Seul le superadmin peut modifier le mot de passe d'un autre compte." },
        { status: 403 }
      );
    }

    const supabase = supabaseAdmin();
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 500 });
    }

    if (!targetUser || targetUser.role === "client") {
      return NextResponse.json({ error: "Compte administrateur introuvable" }, { status: 404 });
    }

    if (isOwnAccount) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Ancien mot de passe requis." },
          { status: 400 }
        );
      }

      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email: currentAdmin.email,
        password: currentPassword,
      });

      if (passwordError) {
        return NextResponse.json(
          { error: "Ancien mot de passe incorrect." },
          { status: 401 }
        );
      }
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      target: {
        id: targetUser.id,
        email: targetUser.email,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
