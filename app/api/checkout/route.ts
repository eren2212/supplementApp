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

    // Sipariş kaydını oluştur
    // @ts-ignore - Prisma şeması Order modelini içeriyor, ancak TypeScript hatası veriyor
    const order = await prismadb.order.create({
      data: {
        isPaid: false,
        orderItems: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity,
          })),
        },
        ...(userId && { userId }),
        ...(couponId && { couponId }),
        total: items.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        ),
      },
    });

    // Checkout session oluştur
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/cancel`,
      metadata: {
        orderId: order.id,
        userId: userId || "guest",
      },
    });

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Checkout işlemi başarısız oldu" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: "Geçersiz session veya order ID" },
        { status: 400 }
      );
    }

    // Stripe'dan ödeme durumunu kontrol et
    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string
    );

    // Ödeme başarılı ise
    if (session.payment_status === "paid") {
      // Siparişi güncelle
      // @ts-ignore - Prisma şeması Order modelini içeriyor, ancak TypeScript hatası veriyor
      const order = await prismadb.order.update({
        where: { id: orderId as string },
        data: {
          isPaid: true,
          paymentIntentId: session.payment_intent as string,
          stripeSessionId: sessionId as string,
        },
      });

      // Sepet çerezini temizle - document.cookie kullanarak istemci tarafında bu işlemi yapalım
      return NextResponse.json({
        success: true,
        order,
        paymentStatus: session.payment_status,
      });
    }

    // Ödeme başarısız veya beklemede ise
    return NextResponse.json({
      success: false,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("[PAYMENT_VERIFICATION_ERROR]", error);
    return NextResponse.json(
      { error: "Ödeme doğrulama işlemi başarısız oldu" },
      { status: 500 }
    );
  }
}
