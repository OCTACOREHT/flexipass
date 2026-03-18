import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const isValidImage = (type: string) =>
  ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"].includes(type);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (!isValidImage(file.type)) {
      return NextResponse.json({ error: "Type de fichier non supporte" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = supabaseAdmin();
    const folder = (process.env.UPLOAD_STORAGE_PATH || "product-images").replace(/^\/+|\/+$/g, "");
    const fileName = `${Date.now()}-${file.name}`.replace(/\s+/g, "-");
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from("products")
      .upload(filePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("products").getPublicUrl(filePath);

    return NextResponse.json({ image_url: data.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur upload" }, { status: 500 });
  }
}
