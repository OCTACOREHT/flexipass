import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const POLICY_KEY = "privacy_policy";

const isPolicyAcceptanceTableMissing = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : JSON.stringify(error);

  return (
    message.includes("Could not find the table 'public.user_policy_acceptances'") ||
    message.includes("schema cache") ||
    message.includes("user_policy_acceptances")
  );
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.replace("Bearer ", "").trim();
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  if (realIp) {
    return realIp.trim() || null;
  }

  return null;
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return { errorResponse: null, user: null };
  }

  try {
    const supabase = supabaseAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { errorResponse: null, user: null };
    }

    return { errorResponse: null, user };
  } catch (err) {
    console.error("Erreur lors de la vérification du token:", err);
    return { errorResponse: null, user: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ accepted: false, acceptance: null });
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("user_policy_acceptances")
      .select("id, policy_key, accepted_at, ip_address, created_at")
      .eq("user_id", user.id)
      .eq("policy_key", POLICY_KEY)
      .maybeSingle();

    if (error) {
      if (isPolicyAcceptanceTableMissing(error)) {
        console.warn("Table user_policy_acceptances manquante, retour d'un état non accepté.");
        return NextResponse.json({ accepted: false, acceptance: null });
      }

      return NextResponse.json(
        { error: "Impossible de récupérer l'acceptation de la politique de confidentialité." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accepted: !!data,
      acceptance: data,
    });
  } catch (error) {
    console.error("Erreur GET /api/policy-acceptance:", error);

    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(request);
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("user_policy_acceptances")
      .upsert(
        {
          user_id: user.id,
          policy_key: POLICY_KEY,
          accepted_at: new Date().toISOString(),
          ip_address: ipAddress,
        },
        { onConflict: "user_id,policy_key" }
      )
      .select("id, policy_key, accepted_at, ip_address, created_at")
      .maybeSingle();

    if (error) {
      if (isPolicyAcceptanceTableMissing(error)) {
        console.warn("Table user_policy_acceptances manquante, l'acceptation ne peut pas être stockée.");
        return NextResponse.json({
          message: "Politique de confidentialité acceptée avec succès.",
          acceptance: null,
        });
      }

      console.error("Supabase upsert error /api/policy-acceptance POST:", error);
      return NextResponse.json(
        { error: error.message || "Impossible d'enregistrer l'acceptation de la politique de confidentialité." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Politique de confidentialité acceptée avec succès.",
      acceptance: data,
    });
  } catch (error) {
    console.error("Erreur POST /api/policy-acceptance:", error);

    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}