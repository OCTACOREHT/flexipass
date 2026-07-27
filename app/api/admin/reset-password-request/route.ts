import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createEmailTransporter } from "@/lib/email";

function generateTempPassword() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specials = "!@#$%";
  const all = lowercase + uppercase + numbers + specials;
  
  let password = "";
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  for (let i = 0; i < 5; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  
  return "FLXP-" + password.split("").sort(() => 0.5 - Math.random()).join("");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Check if user exists and has admin role
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, role, email, permissions")
      .eq("email", email)
      .maybeSingle();

    if (userError || !user) {
      // For security, return success even if user not found to prevent user enumeration
      return NextResponse.json({ success: true, message: "Si un compte admin existe, un e-mail a été envoyé." });
    }

    if (user.role === "client") {
      return NextResponse.json({ error: "Action non autorisée pour ce compte." }, { status: 403 });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Reset password in Supabase Auth using admin client (bypasses Email login provider settings)
    const { error: authResetError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: tempPassword }
    );

    if (authResetError) {
      return NextResponse.json({ error: authResetError.message }, { status: 500 });
    }

    // Update custom_password in public.users permissions JSONB
    const updatedPermissions = {
      ...(user.permissions as any || {}),
      custom_password: tempPassword,
    };

    const { error: dbUpdateError } = await supabase
      .from("users")
      .update({ permissions: updatedPermissions })
      .eq("id", user.id);

    if (dbUpdateError) {
      return NextResponse.json({ error: dbUpdateError.message }, { status: 500 });
    }

    // Send email with nodemailer
    const transporter = createEmailTransporter();
    
    // Get sender config from SMTP settings
    const smtpHost = process.env.EMAIL_HOST?.trim() || "";
    const smtpUser = process.env.EMAIL_USER?.trim() || "";
    let smtpFrom = process.env.EMAIL_FROM?.trim() || smtpUser || "";
    if (smtpFrom && !smtpFrom.includes("<")) {
      smtpFrom = `FlexiPass <${smtpFrom}>`;
    }

    const mailOptions = {
      from: smtpFrom,
      to: email,
      subject: "Réinitialisation de votre mot de passe FlexiPass",
      text: `Bonjour ${user.name || email},\n\nVous avez demandé à réinitialiser votre mot de passe de collaborateur FlexiPass.\n\nVoici votre nouveau mot de passe temporaire : ${tempPassword}\n\nConnectez-vous à l'administration avec ce mot de passe, puis changez-le immédiatement depuis votre profil.\n\nL'équipe FlexiPass`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#2f2a33;max-width:600px;margin:0 auto;border:1px solid #efe5d9;border-radius:16px;padding:24px;background-color:#ffffff;">
          <h2 style="color:#ff6a1a;margin-top:0;">Réinitialisation de mot de passe</h2>
          <p>Bonjour <strong>${user.name || email}</strong>,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe de collaborateur pour accéder à l'administration de **FlexiPass**.</p>
          <div style="background-color:#fff9f4;border:1px solid #efe5d9;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#a08978;text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">Votre mot de passe temporaire</p>
            <p style="margin:0;font-size:24px;font-weight:800;color:#2f2a33;font-family:monospace;letter-spacing:1px;">${tempPassword}</p>
          </div>
          <p>Veuillez utiliser ce mot de passe temporaire pour vous connecter. Pour votre sécurité, changez-le immédiatement dans l'onglet **Paramètres** de votre tableau de bord après votre connexion.</p>
          <hr style="border:none;border-top:1px solid #efe5d9;margin:24px 0;" />
          <p style="font-size:11px;color:#a08978;margin:0;">Cet email est généré automatiquement. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Si un compte admin existe, un e-mail de réinitialisation a été envoyé." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}
