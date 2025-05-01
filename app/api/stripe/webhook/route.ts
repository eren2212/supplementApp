import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe nesnesini oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Headers'ı direkt request nesnesinden al
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET çevre değişkeni tanımlanmamış");
    }

    if (!signature) {
      throw new Error("Stripe-Signature header bulunamadı");
    }

    // Webhook imzasını doğrula
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook Hatası: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Hatası: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    // Olaya göre işlem yap
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Ödeme başarılı: ${paymentIntent.id}`);
        // Veritabanınızda ödemeyi işaretleyebilir veya kullanıcıya e-posta gönderebilirsiniz
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`Ödeme başarısız: ${failedPayment.id}`);
        // Başarısız ödeme için işlem yapabilirsiniz
        break;
      default:
        console.log(`Bilinmeyen olay türü: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook olayı işleme hatası: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook olayı işleme hatası: ${error.message}` },
      { status: 500 }
    );
  }
}
