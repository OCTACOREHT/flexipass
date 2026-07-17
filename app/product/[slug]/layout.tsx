import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
  params: Promise<{ slug: string }>;
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");

async function getProductBySlug(slug: string) {
  const supabase = supabaseAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id,title,type,price,currency,active,plan,duration_days,short_description,description,image_url,service_name,created_at")
    .eq("active", true);

  if (!products) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,product_id,label,duration_days,price,currency,active,display_order")
    .eq("active", true)
    .order("display_order", { ascending: true });

  const variantMap = new Map<string, any[]>();
  (variants || []).forEach((v) => {
    const arr = variantMap.get(v.product_id) || [];
    arr.push(v);
    variantMap.set(v.product_id, arr);
  });

  const merged = products.map((p) => ({
    ...p,
    variants: variantMap.get(p.id) || [],
  }));

  const product = merged.find((p) => {
    const pSlug = p.id ? p.id : normalizeSlug(p.service_name || p.title);
    return encodeURIComponent(pSlug) === slug || pSlug === slug;
  });

  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return {};

  const planName = product.plan || (product.variants && product.variants[0]?.label) || "";
  const duration = product.duration_days || (product.variants && product.variants[0]?.duration_days) || "";
  const durationStr = duration ? `${duration} jours` : "";
  const title = `${product.title} ${planName} ${durationStr} - Achat Instantané | FlexiPass`.replace(/\s+/g, " ").trim();
  const price = product.variants && product.variants[0] ? product.variants[0].price : product.price;
  
  const desc = `Achetez ${product.title} Plan ${planName} pour ${durationStr}. Livraison numérique instantanée, activation garantie, assistance premium 7j/7. ${price} ${product.currency}.`;

  const imageUrl = product.image_url || "https://www.flexipass.shop/og-image.jpg";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://www.flexipass.shop/product/${resolvedParams.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    alternates: {
      canonical: `/product/${resolvedParams.slug}`,
    }
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  let jsonLdProduct = null;
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.flexipass.shop/" },
      { "@type": "ListItem", "position": 2, "name": "Catalogue", "item": "https://www.flexipass.shop/catalogue" },
      { "@type": "ListItem", "position": 3, "name": product?.title || "Produit", "item": `https://www.flexipass.shop/product/${resolvedParams.slug}` }
    ]
  };

  if (product) {
    const planName = product.plan || (product.variants && product.variants[0]?.label) || "";
    const duration = product.duration_days || (product.variants && product.variants[0]?.duration_days) || "";
    const durationStr = duration ? `${duration} jours` : "";
    const price = product.variants && product.variants[0] ? product.variants[0].price : product.price;

    jsonLdProduct = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${product.title} ${planName} ${durationStr}`.trim(),
      "description": `Abonnement ${product.title}, livraison numérique instantanée via FlexiPass.`,
      "image": product.image_url || "https://www.flexipass.shop/logo.png",
      "brand": { "@type": "Brand", "name": product.title },
      "offers": {
        "@type": "Offer",
        "price": price.toString(),
        "priceCurrency": product.currency || "USD",
        "availability": "https://schema.org/InStock",
        "url": `https://www.flexipass.shop/product/${resolvedParams.slug}`,
        "seller": { "@type": "Organization", "name": "FlexiPass" }
      }
    };
  }

  return (
    <>
      {product && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />
          <meta property="product:price:amount" content={(product.variants && product.variants[0] ? product.variants[0].price : product.price).toString()} />
          <meta property="product:price:currency" content={product.currency || "USD"} />
          <meta property="og:type" content="product" />
        </>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {children}
    </>
  );
}
