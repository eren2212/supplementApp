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

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: "Geçersiz session veya order ID" },
        { status: 400 }
      );
    }

    try {
      // Stripe'dan ödeme durumunu kontrol et
      const session = await stripe.checkout.sessions.retrieve(
        sessionId as string
      );

      // Ödeme başarılı ise
      if (session.payment_status === "paid") {
        try {
          // Siparişi güncelle
          // @ts-ignore - Prisma şeması Order modelini içeriyor, ancak TypeScript hatası veriyor
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

              // Sadece payment intent ID güncellemesi yapalım, order ilişkisi kurma işlemini atlayalım
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

              // Loglama yapalım
              console.log(
                `Payment record updated/created for intent: ${paymentIdToUse}`
              );
            } catch (paymentError) {
              console.error("Payment record update failed:", paymentError);
              // Hata durumunda işlemi durdurmayalım
            }
          }

          // Sepet çerezini temizle - document.cookie kullanarak istemci tarafında bu işlemi yapalım
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

      // Ödeme başarısız veya beklemede ise
      return NextResponse.json({
        success: false,
        paymentStatus: session.payment_status,
      });
    } catch (stripeError: any) {
      console.error("[STRIPE_ERROR]", stripeError);
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
