import crypto from "crypto";

export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_auth";
export const ADMIN_TOKEN_MAX_AGE = Number(process.env.ADMIN_COOKIE_MAX_AGE || 60 * 60 * 2);
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

const isSecretConfigured = Boolean(ADMIN_SECRET && ADMIN_SECRET.length > 16);

const getSignature = (payload: string) =>
  crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");

export const buildAdminAuthToken = (username: string) => {
  const payload = JSON.stringify({
    user: username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_MAX_AGE,
  });
  const payloadBase64 = Buffer.from(payload, "utf8").toString("base64url");

  if (!isSecretConfigured) {
    // Development fallback token (not cryptographically secure).
    // Use signature marker 'dev' so verify can accept it when ADMIN_SECRET is not set.
    console.warn("ADMIN_SECRET not configured — using development admin token fallback.");
    return `${payloadBase64}.dev`;
  }

  const signature = getSignature(payloadBase64);
  return `${payloadBase64}.${signature}`;
};

export const verifyAdminAuthToken = (token?: string) => {
  if (!token) return false;

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return false;

  if (isSecretConfigured) {
    const expectedSignature = getSignature(payloadBase64);
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return false;
      }
    } catch {
      return false;
    }
  } else {
    // Accept development fallback signature marker 'dev'
    if (signature !== "dev") return false;
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as { exp: number };
    return typeof payload.exp === "number" && Math.floor(Date.now() / 1000) < payload.exp;
  } catch {
    return false;
  }
};
