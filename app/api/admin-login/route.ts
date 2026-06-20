import { NextRequest, NextResponse } from "next/server";
import { buildAdminAuthToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const expectedUser = process.env.ADMIN_USER?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "adminflexip@$$";

  if (!process.env.ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD non configuré, fallback sur le mot de passe par défaut adminflexip@$$.");
  }

  if (username !== expectedUser || password !== expectedPassword) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const token = buildAdminAuthToken(username);
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admiflexipass",
    maxAge: Number(process.env.ADMIN_COOKIE_MAX_AGE || 60 * 60 * 2),
  });

  return response;
}
