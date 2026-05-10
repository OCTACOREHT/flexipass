import { existsSync } from "fs";
import path from "path";
import nodemailer from "nodemailer";

type OrderItemEmail = {
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
};

type EmailResult = { success: boolean; error?: string };

type EmailOrder = {
  id?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
  order_status?: string | null;
  status?: string | null;
  payment_method?: string | null;
};

type SendOrderEmailArgs = {
  order: EmailOrder;
  items: OrderItemEmail[];
  totalPrice: number;
};

type AccountDeliveryArgs = {
  order: EmailOrder;
  service: string;
  accountEmail: string;
  accountPassword: string;
  profile?: string | null;
};

type OrderRejectedArgs = {
  order: EmailOrder;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value || 0));

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const toEmailAssetUrl = (raw: string | undefined, baseUrl: string) => {
  const value = raw?.trim();
  if (!value) return "";
  if (/^(https?:|data:)/i.test(value)) return value;
  if (!baseUrl) return value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`;
  return value.startsWith("/")
    ? `${baseUrl}${value}`
    : `${baseUrl}/${value.replace(/^\/+/, "")}`;
};

const toStatusCopy = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "paid" || normalized === "completed") {
    return {
      badgeLabel: "Paiement confirmé",
      statusText: "Paiement confirmé",
      badgeBackground: "#FFE7CC",
      badgeColor: "#AF5B00",
      noteEyebrow: "Confirmation",
      noteTitle: "Commande validée",
      noteBody:
        "Votre paiement a déjà été validé. Notre équipe finalise maintenant la livraison de votre commande.",
    };
  }

  if (normalized === "processing") {
    return {
      badgeLabel: "Traitement en cours",
      statusText: "Commande en cours de traitement",
      badgeBackground: "#FFF0D9",
      badgeColor: "#B86512",
      noteEyebrow: "Suivi de commande",
      noteTitle: "Commande en cours",
      noteBody:
        "Votre paiement est en cours de vérification. Vous recevrez une notification dès que la validation sera terminée.",
    };
  }

  return {
    badgeLabel: "Vérification en cours",
    statusText: "Paiement en attente de vérification",
    badgeBackground: "#FFF4DE",
    badgeColor: "#C26A13",
    noteEyebrow: "Suivi de commande",
    noteTitle: "Vérification du paiement en cours",
    noteBody:
      "Votre commande reste réservée pendant la vérification de votre paiement. Une confirmation vous sera envoyée par email dès validation effectuée par notre équipe.",
  };
};

const toPaymentLabel = (method: string) => {
  const normalized = method.toLowerCase();
  if (normalized === "moncash_test" || normalized === "moncash") return "MonCash";
  if (normalized === "virement") return "Virement bancaire";
  return method;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Email send failed";

const REMIX_ICON_PATHS = {
  tiktok:
    "M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z",
  instagram:
    "M13.0281 2.00073C14.1535 2.00259 14.7238 2.00855 15.2166 2.02322L15.4107 2.02956C15.6349 2.03753 15.8561 2.04753 16.1228 2.06003C17.1869 2.1092 17.9128 2.27753 18.5503 2.52503C19.2094 2.7792 19.7661 3.12253 20.3219 3.67837C20.8769 4.2342 21.2203 4.79253 21.4753 5.45003C21.7219 6.0867 21.8903 6.81337 21.9403 7.87753C21.9522 8.1442 21.9618 8.3654 21.9697 8.58964L21.976 8.78373C21.9906 9.27647 21.9973 9.84686 21.9994 10.9723L22.0002 11.7179C22.0003 11.809 22.0003 11.903 22.0003 12L22.0002 12.2821L21.9996 13.0278C21.9977 14.1532 21.9918 14.7236 21.9771 15.2163L21.9707 15.4104C21.9628 15.6347 21.9528 15.8559 21.9403 16.1225C21.8911 17.1867 21.7219 17.9125 21.4753 18.55C21.2211 19.2092 20.8769 19.7659 20.3219 20.3217C19.7661 20.8767 19.2069 21.22 18.5503 21.475C17.9128 21.7217 17.1869 21.89 16.1228 21.94C15.8561 21.9519 15.6349 21.9616 15.4107 21.9694L15.2166 21.9757C14.7238 21.9904 14.1535 21.997 13.0281 21.9992L12.2824 22C12.1913 22 12.0973 22 12.0003 22L11.7182 22L10.9725 21.9993C9.8471 21.9975 9.27672 21.9915 8.78397 21.9768L8.58989 21.9705C8.36564 21.9625 8.14444 21.9525 7.87778 21.94C6.81361 21.8909 6.08861 21.7217 5.45028 21.475C4.79194 21.2209 4.23444 20.8767 3.67861 20.3217C3.12278 19.7659 2.78028 19.2067 2.52528 18.55C2.27778 17.9125 2.11028 17.1867 2.06028 16.1225C2.0484 15.8559 2.03871 15.6347 2.03086 15.4104L2.02457 15.2163C2.00994 14.7236 2.00327 14.1532 2.00111 13.0278L2.00098 10.9723C2.00284 9.84686 2.00879 9.27647 2.02346 8.78373L2.02981 8.58964C2.03778 8.3654 2.04778 8.1442 2.06028 7.87753C2.10944 6.81253 2.27778 6.08753 2.52528 5.45003C2.77944 4.7917 3.12278 4.2342 3.67861 3.67837C4.23444 3.12253 4.79278 2.78003 5.45028 2.52503C6.08778 2.27753 6.81278 2.11003 7.87778 2.06003C8.14444 2.04816 8.36564 2.03847 8.58989 2.03062L8.78397 2.02433C9.27672 2.00969 9.8471 2.00302 10.9725 2.00086L13.0281 2.00073ZM12.0003 7.00003C9.23738 7.00003 7.00028 9.23956 7.00028 12C7.00028 14.7629 9.23981 17 12.0003 17C14.7632 17 17.0003 14.7605 17.0003 12C17.0003 9.23713 14.7607 7.00003 12.0003 7.00003ZM12.0003 9.00003C13.6572 9.00003 15.0003 10.3427 15.0003 12C15.0003 13.6569 13.6576 15 12.0003 15C10.3434 15 9.00028 13.6574 9.00028 12C9.00028 10.3431 10.3429 9.00003 12.0003 9.00003ZM17.2503 5.50003C16.561 5.50003 16.0003 6.05994 16.0003 6.74918C16.0003 7.43843 16.5602 7.9992 17.2503 7.9992C17.9395 7.9992 18.5003 7.4393 18.5003 6.74918C18.5003 6.05994 17.9386 5.49917 17.2503 5.50003Z",
  facebook:
    "M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z",
  linkedin:
    "M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245V18.339H18.3362ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6675C20.401 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.401 3 19.6675 3H19.6697Z",
} as const;

const renderRemixIcon = (icon: keyof typeof REMIX_ICON_PATHS) =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path d="${REMIX_ICON_PATHS[icon]}"/></svg>`;

const buildStatusNoteHtml = (statusCopy: ReturnType<typeof toStatusCopy>) => `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;background:linear-gradient(180deg,#FFF9F2,#FFF5EC);border-radius:18px;border:1px solid #F0DDC8;">
    <tr>
      <td style="padding:18px 20px;">
        <span style="display:inline-block;margin-bottom:10px;background:#FFFFFF;border:1px solid #F1DEC8;border-radius:999px;padding:6px 12px;color:#B46A1D;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${statusCopy.noteEyebrow}</span>
        <p style="margin:0 0 8px;font-size:18px;line-height:1.35;color:#8E4E15;font-weight:800;">${statusCopy.noteTitle}</p>
        <p style="margin:0;font-size:14px;line-height:1.75;color:#6E5646;">
          ${statusCopy.noteBody}
        </p>
      </td>
    </tr>
  </table>
`;

export const buildEmailFooterHtml = ({
  siteHome,
  instagramUrl,
  facebookUrl,
  linkedinUrl,
  tiktokUrl,
}: {
  siteHome: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
}) => {
  const socials = [
    { href: tiktokUrl || siteHome, icon: "tiktok" as const, ariaLabel: "TikTok" },
    { href: instagramUrl || siteHome, icon: "instagram" as const, ariaLabel: "Instagram" },
    { href: facebookUrl || siteHome, icon: "facebook" as const, ariaLabel: "Facebook" },
    { href: linkedinUrl || siteHome, icon: "linkedin" as const, ariaLabel: "LinkedIn" },
  ];

  const buildSocialCell = (social: (typeof socials)[number]) => `
    <td style="padding:0 7px;">
      <a href="${social.href}" aria-label="${social.ariaLabel}" style="display:inline-block;width:46px;height:46px;line-height:46px;text-align:center;background:#FFFFFF;border:1px solid #F0D8BE;border-radius:999px;color:#FF6A1A;text-decoration:none;">
        <span style="display:inline-block;vertical-align:middle;">${renderRemixIcon(social.icon)}</span>
      </a>
    </td>
  `;

  return `
    <tr>
      <td style="background:linear-gradient(180deg,#FFF4E7,#FFF1E2);border:1px solid #F2DCC7;border-top:1px solid #F3E1CF;border-radius:0 0 28px 28px;padding:22px 24px;text-align:center;">
        
        <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto 16px;">
          <tr>
            ${buildSocialCell(socials[0])}
            ${buildSocialCell(socials[1])}
            ${buildSocialCell(socials[2])}
            ${buildSocialCell(socials[3])}
          </tr>
        </table>
        <p style="margin:0;font-size:12px;color:#A08978;">© 2026 FlexiPass - Tous droits réservés</p>
      </td>
    </tr>
  `;
};

const buildItemsHtml = (items: OrderItemEmail[], baseUrl: string) =>
  items
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      const productImage = toEmailAssetUrl(item.product_image, baseUrl);
      const productName = escapeHtml(item.product_name || "Produit");
      const productRef = escapeHtml(item.product_id || "N/A");

      return `
        <tr>
          <td style="padding:16px 18px;border-bottom:1px solid #F3E4D4;background:#FFFDF9;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="padding-right:14px;vertical-align:middle;">
                  ${
                    productImage
                      ? `<div style="width:58px;height:58px;border-radius:16px;background:#FFF4E7;border:1px solid #F1DEC9;text-align:center;line-height:58px;">
                           <img src="${productImage}" alt="${productName}" width="52" height="52" style="border-radius:12px;object-fit:contain;display:inline-block;vertical-align:middle;" />
                         </div>`
                      : `<div style="width:58px;height:58px;border-radius:16px;background:#FFF4E7;border:1px solid #F1DEC9;text-align:center;line-height:58px;font-size:16px;font-weight:700;color:#D2691E;">FP</div>`
                  }
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:14px;color:#2F2A33;font-weight:700;line-height:1.35;">${productName}</p>
                  <p style="margin:3px 0 0;font-size:12px;color:#9F7B63;">Ref: ${productRef}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:16px 14px;border-bottom:1px solid #F3E4D4;background:#FFFDF9;text-align:center;font-size:14px;color:#5E554D;">
            <span style="display:inline-block;min-width:24px;background:#FFF1DE;border:1px solid #F3D4B0;border-radius:999px;padding:5px 12px;font-weight:700;color:#AD6517;">${item.quantity}</span>
          </td>
          <td style="padding:16px 18px;border-bottom:1px solid #F3E4D4;background:#FFFDF9;text-align:right;font-size:14px;color:#6B5C50;">${formatPrice(
            item.price
          )} HTG</td>
          <td style="padding:16px 18px;border-bottom:1px solid #F3E4D4;background:#FFFDF9;text-align:right;font-size:14px;font-weight:800;color:#2F2A33;">${formatPrice(
            lineTotal
          )} HTG</td>
        </tr>
      `;
    })
    .join("");

export async function sendOrderConfirmationEmail({
  order,
  items,
  totalPrice,
}: SendOrderEmailArgs): Promise<EmailResult | null> {
  const host = process.env.EMAIL_HOST || "";
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASSWORD || "";
  const port = Number(process.env.EMAIL_PORT || 587);
  const from = process.env.EMAIL_FROM || "pitonrodjy@gmail.com";
  const logoEnv = process.env.EMAIL_LOGO_URL || "";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    "";
  const baseUrl = siteUrl ? normalizeBaseUrl(siteUrl) : "";
  const siteHome = baseUrl || "https://flexipass.com";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || process.env.INSTAGRAM_URL || siteHome;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || process.env.FACEBOOK_URL || siteHome;
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || process.env.LINKEDIN_URL || siteHome;
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || process.env.TIKTOK_URL || siteHome;
  const primaryLogoPath = path.join(process.cwd(), "public", "Flexipass-email.png");
  const fallbackLogoPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "brands",
    "logo-flexipass.png"
  );
  const logoPath = existsSync(primaryLogoPath) ? primaryLogoPath : fallbackLogoPath;
  const logoUrl =
    logoEnv ||
    (baseUrl
      ? existsSync(primaryLogoPath)
        ? `${baseUrl}/Flexipass-email.png`
        : `${baseUrl}/assets/images/brands/logo-flexipass.png`
      : "");
  const logoCid = "flexipass-logo";
  const hasLocalLogo = existsSync(logoPath);

  if (!host || !user || !pass) {
    return { success: false, error: "EMAIL_* variables manquantes" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `Confirmation de commande #${order.id}`;
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(createdAt);
  const statusCopy = toStatusCopy(order.order_status || order.status || "pending");
  const paymentLabel = escapeHtml(toPaymentLabel(order.payment_method || "virement"));
  const emailAddress = escapeHtml(String(order.customer_email || "client@flexipass.ht"));
  const orderId = escapeHtml(String(order.id || ""));
  const logoMarkup = hasLocalLogo
    ? `<img src="cid:${logoCid}" alt="FlexiPass" style="height:48px;display:inline-block;" />`
    : logoUrl
      ? `<img src="${logoUrl}" alt="FlexiPass" style="height:48px;display:inline-block;" />`
      : `<div style="display:inline-block;background:#FFF4DE;color:#C26A13;border-radius:16px;padding:12px 16px;font-size:18px;font-weight:800;">FlexiPass</div>`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation de commande</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF7F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF7F0;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;">

          <tr>
            <td style="background:linear-gradient(135deg,#FFF2DB 0%,#FFD8A7 52%,#FFA15C 100%);border:1px solid #F2D1AC;border-bottom:none;border-radius:28px 28px 0 0;padding:34px 36px 28px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.78);border:1px solid rgba(255,255,255,0.95);border-radius:20px;padding:12px 18px;box-shadow:0 14px 26px -22px rgba(89,49,14,0.38);margin-bottom:18px;">
                ${logoMarkup}
              </div>
              <p style="margin:0 0 8px;color:#9A5A1B;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Confirmation de commande</p>
              <h1 style="margin:0 0 8px;color:#2F2A33;font-size:28px;font-weight:800;letter-spacing:-0.6px;">Votre reçu FlexiPass est prêt</h1>
              <p style="margin:0;color:#6F5745;font-size:15px;line-height:1.6;">Merci pour votre confiance. Retrouvez ci-dessous le détail complet de votre commande.</p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;padding:34px 36px;border-left:1px solid #F2DCC7;border-right:1px solid #F2DCC7;">

              <p style="margin:0 0 8px;color:#2F2A33;font-size:18px;font-weight:700;">Bonjour,</p>
              <p style="margin:0 0 26px;color:#6A5B50;font-size:15px;line-height:1.7;">
                Votre commande a bien été enregistrée. Voici un récapitulatif élégant de votre achat aux couleurs de FlexiPass.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF9F2;border-radius:20px;border:1px solid #F3E0CD;margin-bottom:30px;">
                <tr>
                  <td style="padding:18px 22px;border-bottom:1px solid #F3E0CD;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Numero de commande</p>
                          <p style="margin:0;font-size:16px;font-weight:800;color:#2F2A33;">#${orderId}</p>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background:${statusCopy.badgeBackground};color:${statusCopy.badgeColor};font-size:12px;font-weight:700;padding:7px 14px;border-radius:999px;border:1px solid rgba(194,106,19,0.15);white-space:nowrap;">${statusCopy.badgeLabel}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="padding:16px 22px;border-right:1px solid #F3E0CD;">
                          <p style="margin:0 0 4px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Date</p>
                          <p style="margin:0;font-size:13px;color:#5A4B40;font-weight:600;line-height:1.6;">${dateLabel}</p>
                        </td>
                        <td width="50%" style="padding:16px 22px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Statut</p>
                          <p style="margin:0;font-size:13px;color:#5A4B40;font-weight:600;">${statusCopy.statusText}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:16px 22px;border-top:1px solid #F3E0CD;border-right:1px solid #F3E0CD;">
                          <p style="margin:0 0 4px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Paiement</p>
                          <p style="margin:0;font-size:13px;color:#5A4B40;font-weight:600;">${paymentLabel}</p>
                        </td>
                        <td width="50%" style="padding:16px 22px;border-top:1px solid #F3E0CD;">
                          <p style="margin:0 0 4px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Email</p>
                          <p style="margin:0;font-size:13px;color:#5A4B40;font-weight:600;word-break:break-word;">${emailAddress}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h3 style="margin:0 0 14px;font-size:16px;font-weight:800;color:#2F2A33;letter-spacing:-0.2px;">Articles commandes</h3>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #F3E1CF;border-radius:20px;overflow:hidden;background:#FFFDF9;">
                <thead>
                  <tr style="background:#FFF3E5;">
                    <th style="text-align:left;padding:14px 18px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;border-bottom:1px solid #F3E1CF;">Produit</th>
                    <th style="text-align:center;padding:14px 12px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;border-bottom:1px solid #F3E1CF;">Qte</th>
                    <th style="text-align:right;padding:14px 18px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;border-bottom:1px solid #F3E1CF;">Prix unit.</th>
                    <th style="text-align:right;padding:14px 18px;font-size:11px;color:#B18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;border-bottom:1px solid #F3E1CF;">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsHtml(items, baseUrl)}
                </tbody>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;">
                <tr>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(135deg,#FFB15F,#FF6A1A);border-radius:20px;padding:20px 28px;box-shadow:0 18px 34px -24px rgba(255,106,26,0.65);">
                      <tr>
                        <td style="text-align:right;">
                          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.82);text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Total a payer</p>
                          <p style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-1px;">${formatPrice(totalPrice)} <span style="font-size:16px;font-weight:600;opacity:0.92;">HTG</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${buildStatusNoteHtml(statusCopy)}

            </td>
          </tr>

          ${buildEmailFooterHtml({
            siteHome,
            instagramUrl,
            facebookUrl,
            linkedinUrl,
            tiktokUrl,
          })}

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from,
      to: order.customer_email,
      subject,
      html,
      attachments: hasLocalLogo
        ? [{ filename: path.basename(logoPath), path: logoPath, cid: logoCid }]
        : undefined,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendAccountDeliveryEmail({
  order,
  service,
  accountEmail,
  accountPassword,
  profile,
}: AccountDeliveryArgs): Promise<EmailResult | null> {
  const host = process.env.EMAIL_HOST || "";
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASSWORD || "";
  const port = Number(process.env.EMAIL_PORT || 587);
  const from = process.env.EMAIL_FROM || "pitonrodjy@gmail.com";

  if (!host || !user || !pass) {
    return { success: false, error: "EMAIL_* variables manquantes" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `Vos accès ${service} sont prêts`;
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(createdAt);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;">Livraison de votre compte</h2>
      <p style="margin:0 0 16px;color:#555;">Commande #${order.id} • ${dateLabel}</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
        <p style="margin:0 0 8px;"><strong>Service :</strong> ${service}</p>
        <p style="margin:0 0 8px;"><strong>Email :</strong> ${accountEmail}</p>
        <p style="margin:0 0 8px;"><strong>Mot de passe :</strong> ${accountPassword}</p>
        ${profile ? `<p style="margin:0;"><strong>Profil :</strong> ${profile}</p>` : ""}
      </div>
      <p style="margin:16px 0 0;color:#666;font-size:12px;">Si vous avez un souci, contactez notre support.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: order.customer_email,
      subject,
      html,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sendOrderRejectedEmail({ order }: OrderRejectedArgs): Promise<EmailResult | null> {
  const host = process.env.EMAIL_HOST || "";
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASSWORD || "";
  const port = Number(process.env.EMAIL_PORT || 587);
  const from = process.env.EMAIL_FROM || "pitonrodjy@gmail.com";

  if (!host || !user || !pass) {
    return { success: false, error: "EMAIL_* variables manquantes" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `Commande #${order.id} refusée`;
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(createdAt);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;">Commande refusée</h2>
      <p style="margin:0 0 16px;color:#555;">Commande #${order.id} • ${dateLabel}</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;">
        <p style="margin:0;font-size:14px;color:#9a3412;">
          Votre paiement n'a pas pu être validé. Merci de revérifier la preuve et de relancer votre commande ou de contacter le support.
        </p>
      </div>
      <p style="margin:16px 0 0;color:#666;font-size:12px;">Besoin d'aide ? Contactez notre support.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: order.customer_email,
      subject,
      html,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
