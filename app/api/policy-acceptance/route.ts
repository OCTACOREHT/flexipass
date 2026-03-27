import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const POLICY_KEY = "privacy_policy";

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
    return {
      errorResponse: NextResponse.json(
        { error: "Token d'authentification manquant." },
        { status: 401 }
      ),
      user: null,
    };
  }

  const supabase = supabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { errorResponse: null, user };
}

export async function GET(request: NextRequest) {
  try {
    const { errorResponse, user } = await getAuthenticatedUser(request);

    if (errorResponse || !user) {
      return errorResponse;
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("user_policy_acceptances")
      .select("id, policy_key, accepted_at, ip_address, created_at")
      .eq("user_id", user.id)
      .eq("policy_key", POLICY_KEY)
      .maybeSingle();

    if (error) {
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
    const { errorResponse, user } = await getAuthenticatedUser(request);

    if (errorResponse || !user) {
      return errorResponse;
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
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Impossible d'enregistrer l'acceptation de la politique de confidentialité." },
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