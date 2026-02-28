import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "URL manquante ou invalide" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    }

    const contentType = upstream.headers.get("content-type") || "image/*";
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Impossible de charger l’image" }, { status: 500 });
  }
}
