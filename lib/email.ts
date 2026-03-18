import nodemailer from "nodemailer";

type OrderItemEmail = {
  product_id: string;
  product_name: string;   // ← ajouté
  product_image?: string; // ← ajouté (URL de l'image produit)
  quantity: number;
  price: number;
};

type EmailResult = { success: boolean; error?: string };

type SendOrderEmailArgs = {
  order: any;
  items: OrderItemEmail[];
  totalPrice: number;
};

type AccountDeliveryArgs = {
  order: any;
  service: string;
  accountEmail: string;
  accountPassword: string;
  profile?: string | null;
};

const buildItemsHtml = (items: OrderItemEmail[]) =>
  items
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #F0F0F0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;vertical-align:middle;">
                  ${
                    item.product_image
                      ? `<img src="${item.product_image}" alt="${item.product_name}" width="52" height="52"
                           style="border-radius:10px;object-fit:cover;display:block;border:1px solid #F0F0F0;" />`
                      : `<div style="width:52px;height:52px;border-radius:10px;background:#F5F5F5;text-align:center;line-height:52px;font-size:22px;">📦</div>`
                  }
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:600;">${item.product_name}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#9CA3AF;">Réf: ${item.product_id}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #F0F0F0;text-align:center;font-size:14px;color:#555;">
            <span style="display:inline-block;background:#F5F5F5;border-radius:20px;padding:2px 12px;font-weight:600;color:#1a1a1a;">${item.quantity}</span>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #F0F0F0;text-align:right;font-size:14px;color:#555;">${item.price} HTG</td>
          <td style="padding:14px 16px;border-bottom:1px solid #F0F0F0;text-align:right;font-size:14px;font-weight:700;color:#1a1a1a;">${lineTotal} HTG</td>
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
  const logoUrl = logoEnv || (siteUrl ? `${siteUrl}/assets/images/brands/logo-flexipass.png` : "");

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
  const statusLabel = order.order_status || order.status || "pending";
  const paymentMethod = order.payment_method || "virement";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation de commande</title>
</head>
<body style="margin:0;padding:0;background-color:#F2F4F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="FlexiPass" style="height:42px;margin-bottom:16px;display:inline-block;" />` : `<div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">✓</div>`}
              <h1 style="margin:0 0 6px;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Commande confirmée</h1>
              <p style="margin:0;color:rgba(255,255,255,0.65);font-size:15px;">Merci pour votre confiance !</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#FFFFFF;padding:36px 40px;">

              <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
                Bonjour, votre commande a bien été enregistrée et est en cours de traitement. Voici le récapitulatif complet.
              </p>

              <!-- Order meta grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:14px;border:1px solid #E8ECF0;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #E8ECF0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 2px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Numéro de commande</p>
                          <p style="margin:0;font-size:16px;font-weight:700;color:#0F172A;">#${order.id}</p>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background:#DCFCE7;color:#16A34A;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">Enregistrée</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:16px 24px;border-right:1px solid #E8ECF0;">
                          <p style="margin:0 0 2px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Date</p>
                          <p style="margin:0;font-size:13px;color:#374151;font-weight:500;">${dateLabel}</p>
                        </td>
                        <td width="50%" style="padding:16px 24px;">
                          <p style="margin:0 0 2px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Statut</p>
                          <p style="margin:0;font-size:13px;color:#374151;font-weight:500;">${statusLabel}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:16px 24px;border-top:1px solid #E8ECF0;border-right:1px solid #E8ECF0;">
                          <p style="margin:0 0 2px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Paiement</p>
                          <p style="margin:0;font-size:13px;color:#374151;font-weight:500;">${paymentMethod}</p>
                        </td>
                        <td width="50%" style="padding:16px 24px;border-top:1px solid #E8ECF0;">
                          <p style="margin:0 0 2px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Email</p>
                          <p style="margin:0;font-size:13px;color:#374151;font-weight:500;">${order.customer_email}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Items table -->
              <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F172A;letter-spacing:-0.2px;">Articles commandés</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8ECF0;border-radius:14px;overflow:hidden;">
                <thead>
                  <tr style="background:#F8FAFC;">
                    <th style="text-align:left;padding:12px 16px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;border-bottom:1px solid #E8ECF0;">Produit</th>
                    <th style="text-align:center;padding:12px 16px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;border-bottom:1px solid #E8ECF0;">Qté</th>
                    <th style="text-align:right;padding:12px 16px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;border-bottom:1px solid #E8ECF0;">Prix unit.</th>
                    <th style="text-align:right;padding:12px 16px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;border-bottom:1px solid #E8ECF0;">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsHtml(items)}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0F172A,#1E3A5F);border-radius:14px;padding:20px 28px;">
                      <tr>
                        <td style="text-align:right;">
                          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Total à payer</p>
                          <p style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-1px;">${totalPrice} <span style="font-size:16px;font-weight:500;opacity:0.7;">HTG</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Info note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#FFF7ED;border-radius:12px;border-left:4px solid #F97316;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                      <strong style="display:block;margin-bottom:4px;">⏳ En attente de vérification</strong>
                      Votre commande sera confirmée dès validation de votre paiement par notre équipe. Vous recevrez une notification par email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F8FAFC;border-radius:0 0 20px 20px;border-top:1px solid #E8ECF0;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Des questions ? Contactez-nous sur WhatsApp ou par email.</p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2025 FlexiPass — Tous droits réservés</p>
            </td>
          </tr>

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
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Email send failed" };
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
  } catch (error: any) {
    return { success: false, error: error?.message || "Email send failed" };
  }
}
