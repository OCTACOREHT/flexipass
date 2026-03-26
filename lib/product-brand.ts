export type ProductBrandInput = {
  title?: string | null;
  service_name?: string | null;
  subtitle?: string | null;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  plan?: string | null;
};

const brandAssetMap: Record<string, string> = {
  canva: "/assets/images/brands/canva.jpg",
  chatgpt: "/assets/images/brands/chatgpt.svg",
  copilot: "/assets/images/brands/microsoft.svg",
  microsoft: "/assets/images/brands/microsoft.svg",
  "prime video": "/assets/images/brands/prime-video.png",
  netflix: "/assets/images/brands/netflix.svg",
  coursera: "/assets/images/brands/coursera.svg",
  claude: "/assets/images/brands/claude.svg",
  spotify: "/assets/images/brands/spotify.svg",
  apple: "/assets/images/brands/apple.svg",
  xbox: "/assets/images/brands/xbox.svg",
  youtube: "/assets/images/brands/youtube.svg",
  perplexity: "/assets/images/brands/perplexity.svg",
  slack: "/assets/images/brands/slack.png",
  playstation: "/assets/images/brands/playstation.svg",
  steam: "/assets/images/brands/steam.svg",
  nintendo: "/assets/images/brands/nintendo.svg",
  crunchyroll: "https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png",
  hbo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
  midjourney: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  adobe: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_Express_logo.svg",
  zoom: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg",
  notion: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  roblox: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Roblox_Logo_2022.svg",
  fortnite: "https://upload.wikimedia.org/wikipedia/commons/1/1a/FortniteLogo.svg",
};

const DEFAULT_PRODUCT_IMAGE = "/assets/images/brands/chatgpt.svg";

const normalizeSource = (raw?: string | null) => {
  const value = raw?.trim();
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(data:|blob:)/i.test(value)) return value;
  return `/${value.replace(/^\/+/, "")}`;
};

const getBrandHaystack = (product: ProductBrandInput) =>
  [
    product.title,
    product.service_name,
    product.subtitle,
    product.short_description,
    product.description,
    product.plan,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getBrandLabel = (product: ProductBrandInput) =>
  (
    product.service_name ||
    product.title ||
    product.plan ||
    product.subtitle ||
    product.short_description ||
    "FlexiPass"
  )
    .replace(/\s*haiti\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getShortBrandLabel = (label: string) => {
  const cleaned = label.replace(/[^a-z0-9 ]/gi, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "FP";

  if (words.length >= 2 && /\d/.test(words[1])) {
    return `${words[0][0]}${words[1]}`.slice(0, 5).toUpperCase();
  }

  if (words[0].length <= 6) {
    return words[0].toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
};

const escapeSvgText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const getMappedBrandAsset = (product: ProductBrandInput) => {
  const haystack = getBrandHaystack(product);
  const key = Object.keys(brandAssetMap).find((candidate) => haystack.includes(candidate));
  return key ? brandAssetMap[key] : "";
};

export const getGeneratedBrandAsset = (product: ProductBrandInput) => {
  const label = getShortBrandLabel(getBrandLabel(product));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
      <rect width="96" height="96" rx="24" fill="#FFF4E9"/>
      <rect x="6" y="6" width="84" height="84" rx="20" fill="#FFF9F3" stroke="#F2DEC8" stroke-width="2"/>
      <text x="48" y="54" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#B8681B">${escapeSvgText(
        label
      )}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getProductImageSrc = (product: ProductBrandInput) =>
  normalizeSource(product.image_url) ||
  getMappedBrandAsset(product) ||
  getGeneratedBrandAsset(product) ||
  DEFAULT_PRODUCT_IMAGE;

export const getProductImageFallbackSrc = (product: ProductBrandInput) =>
  getMappedBrandAsset(product) || getGeneratedBrandAsset(product) || DEFAULT_PRODUCT_IMAGE;

export const handleProductImageError = (
  image: HTMLImageElement,
  product: ProductBrandInput
) => {
  const mappedSrc = getMappedBrandAsset(product);
  const generatedSrc = getGeneratedBrandAsset(product);
  const step = image.dataset.fallbackStep || "primary";
  const currentSrc = image.getAttribute("src") || "";

  if (step === "primary" && mappedSrc && currentSrc !== mappedSrc) {
    image.dataset.fallbackStep = "mapped";
    image.src = mappedSrc;
    return;
  }

  if (step !== "generated") {
    image.dataset.fallbackStep = "generated";
    image.src = generatedSrc;
    return;
  }

  image.onerror = null;
  image.src = DEFAULT_PRODUCT_IMAGE;
};
