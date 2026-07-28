import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminAuthToken } from "@/lib/admin-auth";

export async function GET() {
  try {
    const ck = await cookies();
    const token = ck.get(ADMIN_COOKIE_NAME)?.value;
    const admin = verifyAdminAuthToken(token);

    if (!admin) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    return NextResponse.json({ admin });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}
