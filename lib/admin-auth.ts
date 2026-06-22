import crypto from "crypto";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
}

export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_auth";
export const ADMIN_TOKEN_MAX_AGE = Number(process.env.ADMIN_COOKIE_MAX_AGE || 60 * 60 * 24 * 7); // 1 week
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

const isSecretConfigured = Boolean(ADMIN_SECRET && ADMIN_SECRET.length > 16);

const getSignature = (payload: string) =>
  crypto.createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");

export const buildAdminAuthToken = (user: AdminUser) => {
  const payload = JSON.stringify({
    ...user,
    exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_MAX_AGE,
  });
  const payloadBase64 = Buffer.from(payload, "utf8").toString("base64url");

  if (!isSecretConfigured) {
    console.warn("ADMIN_SECRET not configured — using development admin token fallback.");
    return `${payloadBase64}.dev`;
  }

  const signature = getSignature(payloadBase64);
  return `${payloadBase64}.${signature}`;
};

export const verifyAdminAuthToken = (token?: string): AdminUser | false => {
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
    if (signature !== "dev") return false;
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as AdminUser & { exp: number };
    const isValid = typeof payload.exp === "number" && Math.floor(Date.now() / 1000) < payload.exp;
    if (!isValid) return false;
    
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions || {
        dashboard: true,
        orders: true,
        stock: true,
        users: true,
        settings: true,
      },
    };
  } catch {
    return false;
  }
};

