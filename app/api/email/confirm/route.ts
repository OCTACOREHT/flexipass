import { Resend } from "resend";
import { NextResponse } from "next/server";
import { buildEmailFooterHtml } from "@/lib/email";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export async function POST(request: Request) {
  try {
    const { email, orderId, giftCode, userName, amount } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const rawBaseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.SITE_URL ||
      "https://flexipass.com";
    const baseUrl = normalizeBaseUrl(rawBaseUrl);
    const siteHome = baseUrl || "https://flexipass.com";
    const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || process.env.INSTAGRAM_URL || siteHome;
    const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || process.env.FACEBOOK_URL || siteHome;
    const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || process.env.LINKEDIN_URL || siteHome;
    const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || process.env.TIKTOK_URL || siteHome;
    const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/Flexipass-email.png`;
    const historyUrl = `${baseUrl}/history`;
    const safeName = escapeHtml(userName || "Cher client");
    const safeOrderId = escapeHtml(String(orderId || "").slice(0, 8));
    const safeGiftCode = escapeHtml(String(giftCode || ""));
    const safeAmount = escapeHtml(String(amount || ""));

    const resend = getResendClient();

    if (!resend) {
      return NextResponse.json({ error: "RESEND_API_KEY manquante" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: "FlexiPass <onboarding@resend.dev>",
      to: [email],
      subject: "Félicitations ! Votre commande FlexiPass est prête",
      html: `
        <div style="margin:0;padding:32px 16px;background:#fff7f0;font-family:Arial,sans-serif;color:#2f2a33;">
          <div style="max-width:640px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#fff2db 0%,#ffd8a7 52%,#ffa15c 100%);border:1px solid #f2d1ac;border-bottom:none;border-radius:28px 28px 0 0;padding:34px 28px 28px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.95);border-radius:20px;padding:12px 18px;margin-bottom:18px;">
                ${logoUrl ? `<img src="${logoUrl}" alt="FlexiPass" style="height:48px;display:block;" />` : `<strong style="font-size:22px;color:#c26a13;">FlexiPass</strong>`}
              </div>
              <p style="margin:0 0 8px;color:#9a5a1b;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Commande validée</p>
              <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;color:#2f2a33;">Votre accès est prêt</h1>
              <p style="margin:0;color:#6f5745;font-size:15px;line-height:1.6;">Votre paiement a été confirmé et votre commande est maintenant disponible.</p>
            </div>

            <div style="background:#ffffff;border-left:1px solid #f2dcc7;border-right:1px solid #f2dcc7;padding:30px 28px;">
              <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#2f2a33;">Bonjour ${safeName},</p>
              <p style="margin:0 0 24px;color:#6a5b50;font-size:15px;line-height:1.7;">
                Excellente nouvelle : votre commande <strong>#${safeOrderId}</strong> a été approuvée. Vous pouvez utiliser votre code ci-dessous dès maintenant.
              </p>

              <div style="background:#fff8ef;border:1px solid #f6dec0;border-radius:20px;padding:22px 18px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 10px;font-size:11px;color:#b18665;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Code cadeau</p>
                <div style="display:inline-block;background:linear-gradient(135deg,#ffb15f,#ff6a1a);border-radius:18px;padding:16px 22px;box-shadow:0 18px 34px -24px rgba(255,106,26,0.65);">
                  <span style="display:block;font-size:30px;line-height:1.1;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.18em;color:#ffffff;">${safeGiftCode}</span>
                </div>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff9f2;border:1px solid #f3e0cd;border-radius:20px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #f3e0cd;">
                    <p style="margin:0 0 4px;font-size:11px;color:#b18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Numéro de commande</p>
                    <p style="margin:0;font-size:16px;font-weight:800;color:#2f2a33;">#${safeOrderId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="padding:16px 20px;border-right:1px solid #f3e0cd;">
                          <p style="margin:0 0 4px;font-size:11px;color:#b18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Montant</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#2f2a33;">${safeAmount} HTG</p>
                        </td>
                        <td width="50%" style="padding:16px 20px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#b18665;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Statut</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#ad6517;">Confirmee</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;background:linear-gradient(180deg,#FFF9F2,#FFF5EC);border-radius:18px;border:1px solid #F0DDC8;">
                <tr>
                  <td style="padding:18px 20px;">
                    <span style="display:inline-block;margin-bottom:10px;background:#FFFFFF;border:1px solid #F1DEC8;border-radius:999px;padding:6px 12px;color:#B46A1D;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Livraison sécurisée</span>
                    <p style="margin:0 0 8px;font-size:18px;line-height:1.35;color:#8E4E15;font-weight:800;">Conservez ce code en toute sécurité</p>
                    <p style="margin:0;font-size:14px;line-height:1.75;color:#6E5646;">
                      Votre code cadeau est désormais actif. Nous vous recommandons de le conserver dans un emplacement sécurisé et de consulter votre historique pour retrouver toutes vos commandes.
                    </p>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;">
                <a href="${historyUrl}" style="display:inline-block;background:linear-gradient(135deg,#ffb15f,#ff6a1a);color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px;">Voir mon historique</a>
              </div>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${buildEmailFooterHtml({
                siteHome,
                instagramUrl,
                facebookUrl,
                linkedinUrl,
                tiktokUrl,
              })}
            </table>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Email API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown email error" },
      { status: 500 }
    );
  }
}
