import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import prismadb from "@/libs/prismadb";
import { redirect } from "next/navigation";

// Stripe API anahtar
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    // Verilen body parametrelerinden gerekli bilgileri al
    const body = await req.json();
    const { items, userId, couponId } = body;

    // Güvenlik kontrolü
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Geçersiz ürünler" }, { status: 400 });
    }

    // Ürünleri hazırla
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "try",
        product_data: {
          name: item.title,
          images: [item.imageUrl],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Toplam tutarı hesapla
    const total = items.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );

    try {
      // Sipariş kaydını oluştur
      // @ts-ignore - Prisma şeması Order modelini içeriyor, ancak TypeScript hatası veriyor
      const order = await prismadb.order.create({
        data: {
          status: "pending",
          items: {
            create: items.map((item) => ({
              productId: item.id,
              productName: item.title,
              productImage: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
            })),
          },
          userId: userId ? userId : "guest",
          ...(couponId && { couponId }),
          totalAmount: total,
          shippingAddress: {}, // Boş teslimat adresi, success sayfasında doldurulacak
          orderNumber: `ORD-${Date.now().toString().slice(-10)}`,
        },
      });

      // Checkout session oluştur
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        billing_address_collection: "auto",
        phone_number_collection: { enabled: true },
        success_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}&payment_intent={PAYMENT_INTENT}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/cancel`,
        metadata: {
          orderId: order.id,
          userId: userId || "guest",
        },
      });

      return NextResponse.json({ url: session.url, orderId: order.id });
    } catch (dbError: any) {
      console.error("[DATABASE_ERROR]", dbError);
      return NextResponse.json(
        {
          error: "Sipariş kaydedilirken bir hata oluştu",
          details: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      {
        error: "Checkout işlemi başarısız oldu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");
    const paymentIntent = searchParams.get("payment_intent");

    // Session ID veya Order ID boşsa hata döndür
    if (!sessionId) {
      return NextResponse.json(
        { error: "Geçersiz session ID" },
        { status: 400 }
      );
    }

    try {
      // Session ID bir payment_intent ID'si ise (pi_ ile başlıyorsa)
      if (sessionId.startsWith("pi_")) {
        console.log(
          "Payment Intent ID algılandı, doğrudan ödeme durumu kontrol ediliyor:",
          sessionId
        );

        try {
          // Payment Intent'i kontrol et
          const paymentIntentData = await stripe.paymentIntents.retrieve(
            sessionId
          );

          // Ödeme başarılı ise
          if (paymentIntentData.status === "succeeded") {
            // Eğer OrderID varsa siparişi güncelle
            if (orderId) {
              try {
                const order = await prismadb.order.update({
                  where: { id: orderId as string },
                  data: {
                    status: "processing",
                  },
                  include: {
                    items: true,
                  },
                });

                // Ödeme kaydını güncelle
                await prismadb.payment.upsert({
                  where: {
                    paymentIntentId: sessionId,
                  },
                  update: {
                    status: "completed",
                  },
                  create: {
                    userId: order.userId,
                    paymentIntentId: sessionId,
                    status: "completed",
                    amount: order.totalAmount || 0,
                    description: `Sipariş ödemesi: ${
                      order.orderNumber || orderId
                    }`,
                  },
                });

                return NextResponse.json({
                  success: true,
                  order,
                  paymentStatus: "paid",
                });
              } catch (orderError) {
                console.error("Sipariş güncellenemedi:", orderError);
                // Ödeme başarılı olsa bile sipariş güncellenemedi
                return NextResponse.json({
                  success: true,
                  message: "Ödeme başarılı, ancak sipariş güncellenemedi.",
                  paymentStatus: "paid",
                });
              }
            }

            // OrderID yoksa (Premium üyelik gibi özel durumlar için)
            return NextResponse.json({
              success: true,
              paymentStatus: "paid",
            });
          }

          // Ödeme başarısız ise
          return NextResponse.json({
            success: false,
            paymentStatus: paymentIntentData.status,
          });
        } catch (paymentIntentError) {
          console.error("Payment Intent kontrolü hatası:", paymentIntentError);
          return NextResponse.json(
            {
              error: "Ödeme doğrulanamadı",
              details: paymentIntentError.message,
            },
            { status: 500 }
          );
        }
      }

      // Normal Checkout Session ID ise
      console.log("Checkout Session kontrolü yapılıyor:", sessionId);

      // Stripe'dan checkout session'ı kontrol et
      const session = await stripe.checkout.sessions.retrieve(
        sessionId as string
      );

      // Ödeme başarılı ise
      if (session.payment_status === "paid") {
        // Eğer OrderID varsa siparişi güncelle
        if (orderId) {
          try {
            // Siparişi güncelle
            const order = await prismadb.order.update({
              where: { id: orderId as string },
              data: {
                status: "processing",
                trackingNumber: null,
              },
              include: {
                items: true,
              },
            });

            // Ödeme kaydını güncelle veya oluştur
            if (paymentIntent || session.payment_intent) {
              const paymentIdToUse =
                paymentIntent || (session.payment_intent as string);

              try {
                // Önce order'ın total amount'ını hesapla (null olabileceği durumlar için)
                const orderAmount =
                  order.totalAmount ||
                  order.items.reduce(
                    (total, item) => total + Number(item.totalPrice),
                    0
                  );

                // Ödeme kaydını güncelle
                await prismadb.payment.upsert({
                  where: {
                    paymentIntentId: paymentIdToUse,
                  },
                  update: {
                    status: "completed",
                  },
                  create: {
                    userId: order.userId,
                    paymentIntentId: paymentIdToUse,
                    status: "completed",
                    amount: orderAmount,
                    description: `Sipariş ödemesi: ${
                      order.orderNumber || orderId
                    }`,
                  },
                });

                console.log(
                  `Payment record updated/created for intent: ${paymentIdToUse}`
                );
              } catch (paymentError) {
                console.error("Payment record update failed:", paymentError);
                // Hata durumunda işlemi durdurmayalım
              }
            }

            return NextResponse.json({
              success: true,
              order,
              paymentStatus: session.payment_status,
            });
          } catch (orderUpdateError: any) {
            console.error("[ORDER_UPDATE_ERROR]", orderUpdateError);

            // Siparişi bulamadıysak veya güncelleyemediyse bile başarılı dönelim
            // Çünkü ödeme başarılı
            return NextResponse.json({
              success: true,
              message:
                "Ödeme başarılı, ancak sipariş güncellenemedi. Lütfen müşteri hizmetleriyle iletişime geçin.",
              paymentStatus: session.payment_status,
            });
          }
        }

        // OrderID yoksa (Premium üyelik gibi özel durumlar için)
        return NextResponse.json({
          success: true,
          paymentStatus: session.payment_status,
        });
      }

      // Ödeme başarısız veya beklemede ise
      return NextResponse.json({
        success: false,
        paymentStatus: session.payment_status,
      });
    } catch (stripeError: any) {
      console.error("[STRIPE_ERROR]", stripeError);

      // Eğer bu hata "No such checkout.session" ise ve session ID "pi_" ile başlıyorsa,
      // payment_intent olarak tekrar denemeyi öner
      if (
        stripeError.code === "resource_missing" &&
        sessionId.startsWith("pi_")
      ) {
        console.log(
          "Bu bir checkout.session değil, payment_intent olabilir. PaymentIntent kontrolü öneriliyor."
        );
      }

      return NextResponse.json(
        {
          error: "Ödeme doğrulama işlemi sırasında Stripe hatası",
          details: stripeError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[PAYMENT_VERIFICATION_ERROR]", error);
    return NextResponse.json(
      {
        error: "Ödeme doğrulama işlemi başarısız oldu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
