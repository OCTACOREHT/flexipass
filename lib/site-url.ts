const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL =
  configuredSiteUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredSiteUrl)
    ? configuredSiteUrl
    : "https://flexipass.shop";

export const getAuthCallbackUrl = () => `${SITE_URL}/auth/callback`;

export const getPasswordUpdateUrl = () => `${SITE_URL}/auth/update`;
