import { NextResponse } from "next/server";

/**
 * PLACEHOLDER POUR L'INTÉGRATION MONCASH
 * Ce fichier est destiné au développeur qui s'occupera de l'API MonCash.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customerEmail } = body;

    console.log("--- MONCASH TRANSACTION INITIATED ---");
    console.log("Order ID:", orderId);
    console.log("Amount:", amount);
    console.log("Customer:", customerEmail);

    // TODO: Implémenter ici l'appel vers MonCash API (Get Token -> Create Payment)
    // Exemple : 
    // 1. Authentification MonCash
    // 2. Création du paiement
    // 3. Retourner l'URL de redirection MonCash

    return NextResponse.json({ 
      success: true, 
      message: "Point d'entrée MonCash prêt.",
      redirect_url: "https://sandbox.moncash.com/..." // URL à générer dynamiquement
    }, { status: 200 });

  } catch (error: any) {
    console.error("MonCash API Placeholder Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initiation MonCash" }, { status: 500 });
  }
}
