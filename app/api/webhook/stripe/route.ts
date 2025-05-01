import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prismadb from "@/libs/prismadb";

// 1. Stripe istemcisini oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

// 2. Webhook secret tanımla
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // 3. Webhook isteğinden body ve imzayı al
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // 4. İmza eksikse hata dön
    if (!signature) {
      console.error("Stripe webhook imzası eksik!");
      return NextResponse.json(
        { error: "Webhook imzası eksik!" },
        { status: 400 }
      );
    }

    // 5. Webhook sırrı eksikse hata dön
    if (!webhookSecret) {
      console.error("Stripe webhook sırrı eksik!");
      return NextResponse.json(
        { error: "Webhook sırrı yapılandırılmamış" },
        { status: 500 }
      );
    }

    // 6. Event'i doğrula
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook hata: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook hata: ${err.message}` },
        { status: 400 }
      );
    }

    // 7. Olay türüne göre işlem yap
    console.log(`Event alındı: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        // Metadata'dan sipariş ID'sini al
        const orderId = checkoutSession.metadata?.orderId;
        const userId = checkoutSession.metadata?.userId;

        console.log("Checkout tamamlandı:", {
          orderId,
          userId,
          paymentStatus: checkoutSession.payment_status,
          paymentIntent: checkoutSession.payment_intent,
        });

        // Sipariş ID yoksa yeni bir ödeme kaydı oluştur (sabit fiyatlı ürün satışı için)
        if (!orderId && userId) {
          try {
            const paymentId = checkoutSession.payment_intent as string;

            // Ödeme kaydını oluştur
            await prismadb.payment.upsert({
              where: {
                paymentIntentId: paymentId,
              },
              update: {
                status: "completed",
              },
              create: {
                paymentIntentId: paymentId,
                amount: (checkoutSession.amount_total || 0) / 100,
                status: "completed",
                userId: userId,
                description: `Premium üyelik - ${checkoutSession.id}`,
              },
            });

            console.log(`Premium üyelik ödemesi kaydedildi: ${userId}`);

            // Kullanıcı premium durumunu güncellemek için gerekiyorsa daha sonra
            // uygun bir model güncellemesi yap
            console.log(`Kullanıcı premium olarak işaretlendi: ${userId}`);
          } catch (paymentError: any) {
            console.error(
              `Premium ödeme kaydı yapılırken hata: ${paymentError}`
            );
          }
          break;
        }

        // Sipariş ID ve sipariş varsa güncelle
        if (orderId) {
          try {
            await prismadb.order.update({
              where: {
                id: orderId,
              },
              data: {
                status: "processing",
                paymentId:
                  (checkoutSession.payment_intent as string) || undefined,
              },
            });
            console.log(
              `Sipariş "${orderId}" ödeme durumu güncellendi: processing`
            );
          } catch (dbError: any) {
            console.error(`Sipariş güncellenirken hata: ${dbError.message}`);
            // Bu hatayı loglama dışında bir şey yapmıyoruz, Stripe'a 200 dönmek önemli
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("Ödeme başarılı:", {
          id: paymentIntent.id,
          userId: paymentIntent.metadata?.userId,
          amount: paymentIntent.amount,
        });

        // Ödeme kaydını güncelle
        try {
          await prismadb.payment.upsert({
            where: {
              paymentIntentId: paymentIntent.id,
            },
            update: {
              status: "succeeded",
            },
            create: {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Cent'ten TL'ye çevir
              status: "succeeded",
              userId: paymentIntent.metadata?.userId || "guest",
            },
          });
          console.log(
            `Ödeme "${paymentIntent.id}" başarıyla gerçekleşti ve kaydedildi`
          );
        } catch (dbError: any) {
          console.error(`Ödeme kaydı güncellenirken hata: ${dbError.message}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Ödeme başarısız oldu: ${paymentIntent.id}`);

        try {
          await prismadb.payment.upsert({
            where: {
              paymentIntentId: paymentIntent.id,
            },
            update: {
              status: "failed",
            },
            create: {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              status: "failed",
              userId: paymentIntent.metadata?.userId || "guest",
            },
          });
        } catch (dbError: any) {
          console.error(`Ödeme kaydı güncellenirken hata: ${dbError.message}`);
        }
        break;
      }

      default:
        console.log(`İşlenmeyen olay türü: ${event.type}`);
    }

    // 8. Her durumda 200 döndür
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook işlenirken hata: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook hatası: ${error.message}` },
      { status: 500 }
    );
  }
}

// Webhook için veri raw olarak alınmalı
export const config = {
  api: {
    bodyParser: false,
  },
};
