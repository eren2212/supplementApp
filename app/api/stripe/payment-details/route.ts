import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

// Stripe nesnesini oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız" },
        { status: 401 }
      );
    }

    // URL'den payment_intent parametresini al
    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get("payment_intent");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Ödeme ID'si belirtilmedi" },
        { status: 400 }
      );
    }

    // Stripe'dan ödeme detaylarını al
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Sadece gerekli bilgileri döndür
    const paymentDetails = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      description: paymentIntent.description,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    };

    return NextResponse.json(paymentDetails);
  } catch (error: any) {
    console.error("Ödeme detayları getirme hatası:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme detayları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
