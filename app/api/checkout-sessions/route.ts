import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "guest";

    // Request body'den price_id ve quantity al (isteğe bağlı)
    const body = await req.json();
    const { price_id, quantity = 1, redirectToPaymentSuccess = false } = body;

    let lineItems = [];

    // Eğer price_id varsa, o fiyatlandırmayı kullan
    if (price_id) {
      lineItems.push({
        price: price_id,
        quantity: quantity,
      });
    } else {
      // Sabit fiyatlı bir ürün
      lineItems.push({
        price_data: {
          currency: "try",
          product_data: {
            name: "Premium Üyelik",
            description: "Bir aylık premium üyelik",
          },
          unit_amount: 29900, // 299 TL
        },
        quantity: 1,
      });
    }

    // Başarılı ödeme yönlendirme URL'i seç
    const successUrl = redirectToPaymentSuccess
      ? `${process.env.NEXT_PUBLIC_API_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
      : `${process.env.NEXT_PUBLIC_API_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_intent={PAYMENT_INTENT}`;

    // Checkout session oluştur
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/cancel`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("[CHECKOUT_SESSION_ERROR]", error);
    return NextResponse.json(
      {
        error:
          error.message || "Checkout session oluşturulurken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
