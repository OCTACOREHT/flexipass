import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminAuthToken } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminPromotionEmail, sendAdminWelcomeEmail } from "@/lib/email";

// Helper to check if current user is authorized (SuperAdmin only)
async function checkSuperAdmin() {
  const ck = await cookies();
  const token = ck.get("admin_auth")?.value;
  const admin = verifyAdminAuthToken(token);
  if (!admin || admin.role !== "superadmin") {
    return null;
  }
  return admin;
}

// Helper to generate a robust temporary password
function generateTempPassword() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+~";
  const all = lowercase + uppercase + numbers + specials;
  
  let password = "";
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));
  
  for (let i = 0; i < 8; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  
  return password.split("").sort(() => 0.5 - Math.random()).join("");
}

// 1. GET: List all administrative users
export async function GET() {
  const currentAdmin = await checkSuperAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const supabase = supabaseAdmin();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, role, permissions, status, created_at")
    .neq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

// 2. POST: Invite a new administrator
export async function POST(request: NextRequest) {
  const currentAdmin = await checkSuperAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();
    const role = String(body?.role || "admin");
    const permissions = body?.permissions || {
      dashboard: true,
      orders: true,
      stock: true,
      users: true,
      settings: true,
    };

    if (!email || !name) {
      return NextResponse.json({ error: "Email et Nom requis" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Check if the user already exists in the public.users database
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role, status")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.role !== "client") {
        return NextResponse.json(
          { error: "Cet utilisateur fait déjà partie de l'équipe administrative." },
          { status: 400 }
        );
      }

      const tempPassword = generateTempPassword();

      // Reset the password in Supabase Auth
      const { error: authResetError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: tempPassword }
      );

      if (authResetError) {
        return NextResponse.json({ error: authResetError.message }, { status: 500 });
      }

      // Promote existing user to the requested administrative role
      const { error: promoError } = await supabase
        .from("users")
        .update({
          role,
          permissions,
          status: "active", // Direct activation since their account exists
        })
        .eq("id", existingUser.id);

      if (promoError) {
        return NextResponse.json({ error: promoError.message }, { status: 500 });
      }

      // Send promotion email
      const emailResult = await sendAdminPromotionEmail({
        email,
        name,
        roleName: role,
        tempPassword,
      });

      if (!emailResult?.success) {
        console.warn("Utilisateur promu mais échec d'envoi de l'e-mail de notification:", emailResult?.error);
        return NextResponse.json({
          success: true,
          warning: `Utilisateur promu avec succès, mais échec d'envoi de l'e-mail de notification. Mot de passe temporaire : ${tempPassword}`,
          tempPassword,
          user: { id: existingUser.id, email, name, role, permissions },
        });
      }

      return NextResponse.json({
        success: true,
        tempPassword,
        user: { id: existingUser.id, email, name, role, permissions },
      });
    }

    const tempPassword = generateTempPassword();

    // Create Supabase Auth user directly with temporary password
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (createError) {
      // If user exists in Auth but not in public.users database table (edge case)
      if (createError.message.includes("already been registered") || (createError as any).code === "email_exists") {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const found = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          const { error: authResetError } = await supabase.auth.admin.updateUserById(
            found.id,
            { password: tempPassword }
          );
          if (authResetError) {
            return NextResponse.json({ error: authResetError.message }, { status: 500 });
          }

          const { error: upsertError } = await supabase.from("users").upsert({
            id: found.id,
            email,
            name,
            role,
            permissions,
            status: "active",
          });
          if (upsertError) {
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
          }
          await sendAdminPromotionEmail({ email, name, roleName: role, tempPassword });
          return NextResponse.json({
            success: true,
            tempPassword,
            user: { id: found.id, email, name, role, permissions },
          });
        }
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    const userId = userData.user.id;

    // Update public.users database table
    const { error: updateError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email,
        name,
        role,
        permissions,
        status: "active",
      });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Send the welcome email with credentials
    const emailResult = await sendAdminWelcomeEmail({
      email,
      name,
      tempPassword,
    });

    if (!emailResult?.success) {
      console.warn("Utilisateur créé avec succès, mais échec de l'envoi de l'e-mail de bienvenue:", emailResult?.error);
      return NextResponse.json({
        success: true,
        warning: `Le compte a été créé avec succès, mais l'e-mail de bienvenue n'a pas pu être envoyé. Mot de passe temporaire: ${tempPassword}`,
        tempPassword,
        user: { id: userId, email, name, role, permissions },
      });
    }

    return NextResponse.json({
      success: true,
      tempPassword,
      user: { id: userId, email, name, role, permissions },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. PUT: Update admin role, permissions, or status
export async function PUT(request: NextRequest) {
  const currentAdmin = await checkSuperAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body?.id || "");
    const role = String(body?.role || "");
    const permissions = body?.permissions;
    const status = String(body?.status || "");

    if (!id) {
      return NextResponse.json({ error: "ID de l'utilisateur requis" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Prevent modifying oneself
    if (id === currentAdmin.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier vos propres permissions." }, { status: 400 });
    }

    const updateFields: any = {};
    if (role) updateFields.role = role;
    if (permissions) updateFields.permissions = permissions;
    if (status) updateFields.status = status;

    const { error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE: Delete an administrative user profile so the invitation can be restarted
export async function DELETE(request: NextRequest) {
  const currentAdmin = await checkSuperAdmin();
  if (!currentAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de l'utilisateur requis" }, { status: 400 });
    }

    if (id === currentAdmin.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous supprimer vous-même." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", id)
      .maybeSingle();

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 500 });
    }

    if (!targetUser) {
      const { error: authOnlyError } = await supabase.auth.admin.deleteUser(id);
      if (authOnlyError) {
        console.warn("Admin profile was already missing and Auth user could not be hard-deleted:", authOnlyError.message);
      }

      return NextResponse.json({ success: true, authDeleted: !authOnlyError });
    }

    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (dbError) {
      const releasedEmail = targetUser.email.includes(".deleted.")
        ? targetUser.email
        : `${targetUser.email}.deleted.${Date.now()}`;
      const { error: releaseError } = await supabase
        .from("users")
        .update({
          email: releasedEmail,
          role: "client",
          permissions: {},
          status: "suspended",
        })
        .eq("id", id);

      if (releaseError) {
        return NextResponse.json({ error: releaseError.message }, { status: 500 });
      }
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.warn("Admin Auth user could not be hard-deleted; invite flow will reuse it if needed:", authError.message);
    }

    return NextResponse.json({ success: true, authDeleted: !authError });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
