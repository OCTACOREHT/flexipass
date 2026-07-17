import type { MetadataRoute } from 'next'
import { supabaseAdmin } from "@/lib/supabase-admin"

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.flexipass.shop'
  
  // Static routes
  const routes = [
    '',
    '/catalogue',
    '/cartes-cadeaux',
    '/streaming',
    '/aide',
    '/cgu',
    '/confidentialite',
    '/mentions-legales'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/catalogue' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic products
  const supabase = supabaseAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, service_name, created_at")
    .eq("active", true);

  const productRoutes = (products || []).map((product) => {
    const pSlug = product.id ? product.id : normalizeSlug(product.service_name || product.title);
    return {
      url: `${baseUrl}/product/${encodeURIComponent(pSlug)}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }
  });

  return [...routes, ...productRoutes]
}
