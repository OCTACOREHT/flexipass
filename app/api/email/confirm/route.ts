import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, orderId, giftCode, userName, amount } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'FlexiPass <onboarding@resend.dev>',
      to: [email],
      subject: 'Félicitations ! Votre commande FlexiPass est prête ',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48; margin: 0; font-size: 32px; font-style: italic;">FLEXIPASS</h1>
            <p style="color: #666; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: bold;">Accès Digital Instantané</p>
          </div>
          
          <h2 style="color: #111; font-size: 24px;">Bonjour ${userName || 'Cher Client'},</h2>
          
          <p style="color: #444; line-height: 1.6;">Nous avons une excellente nouvelle ! Votre paiement a été vérifié et votre commande <strong>#${orderId.slice(0, 8)}</strong> a été approuvée.</p>
          
          <div style="background-color: #f9f9f9; padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center; border: 1px dashed #e11d48;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold;">Voici votre Code Cadeau :</p>
            <h3 style="margin: 0; color: #e11d48; font-size: 36px; font-family: monospace; letter-spacing: 3px;">${giftCode}</h3>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h4 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #111;">Récapitulatif de l'article</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666;">Montant total :</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111;">$${amount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Statut :</td>
                <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: bold;">Confirmé !</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #444; line-height: 1.6;">Vous pouvez retrouver tous vos codes et l'historique de vos achats sur votre <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://flexipass.com'}/history" style="color: #e11d48; text-decoration: none; font-weight: bold;">Espace Client</a>.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Merci de faire confiance à FlexiPass pour vos achats digitaux.</p>
            <p>&copy; 2026 FlexiPass Inc. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
