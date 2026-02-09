import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const products = [
  { title: "PlayStation Store", type: "giftcard", price: 1350, plan: "Standard", short_description: "Crédits et jeux PSN", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/PlayStation_logo.svg" },
  { title: "Xbox Gift Card", type: "giftcard", price: 1350, plan: "Standard", short_description: "Jeux et contenus Xbox", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_one_logo.svg" },
  { title: "Steam Wallet", type: "giftcard", price: 675, plan: "Standard", short_description: "Crédits Steam PC", image_url: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
  { title: "Nintendo eShop", type: "giftcard", price: 1350, plan: "Standard", short_description: "Crédits Nintendo Switch", image_url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" },
  { title: "Canva Pro", type: "account", price: 1500, plan: "1 mois", duration_days: 30, short_description: "Création visuelle premium", image_url: "https://logo-marque.com/wp-content/uploads/2021/11/Canva-Logo.jpg" },
  { title: "Netflix", type: "account", price: 950, plan: "1 écran", duration_days: 30, short_description: "Streaming illimité", image_url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { title: "Spotify", type: "account", price: 900, plan: "1 mois", duration_days: 30, short_description: "Musique premium", image_url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { title: "Apple Gift Card", type: "giftcard", price: 1500, plan: "15 USD", short_description: "App Store & iTunes", image_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { title: "ChatGPT Plus", type: "account", price: 1200, plan: "Plus", duration_days: 30, short_description: "GPT-4, DALL·E, navigateur", image_url: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
  { title: "Claude Pro", type: "account", price: 1200, plan: "Pro", duration_days: 30, short_description: "Long contexte & raisonnement", image_url: "https://seeklogo.com/images/C/claude-ai-logo-A859C5C3E6-seeklogo.com.png" },
];

const variantsSeed = [
  { title: "Canva Pro", variants: [{ label: "1 mois", days: 30, price: 1500 }, { label: "3 mois", days: 90, price: 4200 }] },
  { title: "ChatGPT Plus", variants: [{ label: "Mensuel", days: 30, price: 1200 }, { label: "Trimestriel", days: 90, price: 3200 }] },
  { title: "Netflix", variants: [{ label: "1 écran", days: 30, price: 950 }, { label: "4 écrans", days: 30, price: 1500 }] },
];

export async function POST() {
  const supabase = supabaseAdmin();

  for (const p of products) {
    await supabase
      .from("products")
      .upsert(
        {
          title: p.title,
          type: p.type,
          price: p.price,
          currency: "HTG",
          plan: p.plan,
          duration_days: p.duration_days ?? null,
          service_name: p.title,
          short_description: p.short_description,
          image_url: p.image_url,
          active: true,
        },
        { onConflict: "title" }
      );
  }

  const { data: prodRows } = await supabase.from("products").select("id,title");
  const map = new Map<string, string>();
  prodRows?.forEach((r) => map.set(r.title, r.id));

  for (const v of variantsSeed) {
    const pid = map.get(v.title);
    if (!pid) continue;
    for (let i = 0; i < v.variants.length; i++) {
      const item = v.variants[i];
      await supabase.from("product_variants").upsert(
        {
          product_id: pid,
          label: item.label,
          duration_days: item.days,
          price: item.price,
          currency: "HTG",
          active: true,
          display_order: i,
        },
        { onConflict: "product_id,label" }
      );
    }
  }

  return NextResponse.json({ inserted: true, products: products.length });
}
