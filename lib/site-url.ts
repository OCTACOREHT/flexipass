const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const productionSiteUrl = "https://flexipass.shop";

const normalize = (value: string) => value.replace(/\/+$/, "");

const isLocalhostUrl = (value: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);

const getEnvSiteUrl = () => {
  if (configuredSiteUrl && !isLocalhostUrl(configuredSiteUrl)) {
    return normalize(configuredSiteUrl);
  }
  return productionSiteUrl;
};

export const getSiteUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return productionSiteUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return normalize(window.location.origin);
    }
    return productionSiteUrl;
  }

  return getEnvSiteUrl();
};

export const SITE_URL = productionSiteUrl;

export const getAuthCallbackUrl = () => getSiteUrl();

export const getPasswordUpdateUrl = () => `${getSiteUrl()}/auth/update`;
