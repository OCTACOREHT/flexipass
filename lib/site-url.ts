const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const defaultSiteUrl = "https://flexipass.shop";

const normalize = (value: string) => value.replace(/\/+$/, "");

const isLocalhostUrl = (value: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);

const getEnvSiteUrl = () => {
  if (configuredSiteUrl && !isLocalhostUrl(configuredSiteUrl)) {
    return normalize(configuredSiteUrl);
  }
  return defaultSiteUrl;
};

export const getSiteUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return normalize(window.location.origin);
  }
  return getEnvSiteUrl();
};

export const SITE_URL = getEnvSiteUrl();

export const getAuthCallbackUrl = () => `${getSiteUrl()}/auth/callback`;

export const getPasswordUpdateUrl = () => `${getSiteUrl()}/auth/update`;
