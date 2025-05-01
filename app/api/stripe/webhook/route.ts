import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient, OrderStatus } from "@prisma/client";

// Stripe nesnesini oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

// Teslimat adresi için tip tanımı
interface ShippingAddressType {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

// Sepet öğesi için tip tanımı
interface CartItemType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

/**
 * Başarılı ödeme durumunda sipariş oluşturan fonksiyon
 */
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Ödeme başarılı: ${paymentIntent.id}`);
  console.log("Payment metadata:", paymentIntent.metadata);

  // Daha detaylı debug bilgisi
  const detailedInfo = {
    userId: paymentIntent.metadata?.userId,
    amount: paymentIntent.amount,
    status: paymentIntent.status,
    hasCartItems: !!paymentIntent.metadata?.cartItems,
    hasShippingAddress: !!paymentIntent.metadata?.shippingAddress,
    paymentIntentId: paymentIntent.id,
  };
  console.log("Detaylı ödeme bilgisi:", detailedInfo);

  // Temel kontroller
  if (!paymentIntent.metadata?.userId) {
    console.error("Kullanıcı kimliği (userId) bulunamadı", paymentIntent);
    throw new Error("Kullanıcı kimliği (userId) bulunamadı");
  }

  // Önceden aynı paymentIntentId ile oluşturulmuş bir ödeme var mı kontrol et
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentIntentId: paymentIntent.id },
    include: { order: true },
  });

  if (existingPayment) {
    console.log(`Bu ödeme için zaten bir kayıt mevcut: ${existingPayment.id}`);

    if (existingPayment.order) {
      console.log(
        `Bu ödeme için zaten bir sipariş mevcut: ${existingPayment.order.orderNumber}`
      );
      return existingPayment.order;
    }
  }

  // Sepet öğelerini parse et
  let cartItems: CartItemType[] = [];
  try {
    if (paymentIntent.metadata?.cartItems) {
      cartItems = JSON.parse(paymentIntent.metadata.cartItems);
    } else if (paymentIntent.metadata?.orderItems) {
      cartItems = JSON.parse(paymentIntent.metadata.orderItems);
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Geçerli sepet öğeleri bulunamadı");
    }

    // Sepet öğelerini doğrula
    for (const item of cartItems) {
      if (
        !item.id ||
        !item.name ||
        typeof item.quantity !== "number" ||
        typeof item.price !== "number"
      ) {
        console.warn("Geçersiz sepet öğesi:", item);
        throw new Error("Sepet öğelerinde eksik veya geçersiz bilgiler var");
      }
    }
  } catch (error) {
    console.error("Sepet öğeleri ayrıştırılamadı:", error);
    throw new Error("Sepet öğeleri ayrıştırılamadı");
  }

  // Teslimat adresi parse et
  let shippingAddress: ShippingAddressType = {};
  try {
    if (paymentIntent.metadata?.shippingAddress) {
      shippingAddress = JSON.parse(
        paymentIntent.metadata.shippingAddress
      ) as ShippingAddressType;
    }
  } catch (error) {
    console.error("Teslimat adresi ayrıştırılamadı:", error);
    throw new Error("Teslimat adresi ayrıştırılamadı");
  }

  // Veritabanı işlemleri için transaction kullan
  return await prisma.$transaction(async (tx) => {
    try {
      // 1. Önce ödeme kaydını oluştur
      const payment = await tx.payment.create({
        data: {
          userId: paymentIntent.metadata.userId,
          amount: paymentIntent.amount / 100, // Kuruş -> TL dönüşümü
          paymentIntentId: paymentIntent.id,
          status: "completed",
          description: paymentIntent.description || "Sipariş ödemesi",
          metadata: paymentIntent.metadata as any,
        },
      });

      console.log("Webhook: Ödeme kaydı oluşturuldu:", payment.id);

      // 2. Benzersiz sipariş numarası oluştur
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(
        Math.random() * 1000
      )}`;

      // 3. Siparişi oluştur
      const orderData = {
        userId: paymentIntent.metadata.userId,
        orderNumber: orderNumber,
        status: "processing" as OrderStatus,
        totalAmount: paymentIntent.amount / 100,
        paymentId: payment.id,
        shippingAddress: {
          firstName: shippingAddress.firstName || "",
          lastName: shippingAddress.lastName || "",
          email: shippingAddress.email || "",
          phone: shippingAddress.phone || "",
          address: shippingAddress.address || "",
          city: shippingAddress.city || "",
          postcode: shippingAddress.postcode || "",
          country: shippingAddress.country || "Türkiye",
        },
        items: {
          create: cartItems.map((item) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.imageUrl || null,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
      };

      console.log(
        "Oluşturulacak sipariş verisi:",
        JSON.stringify(orderData, null, 2)
      );

      const order = await tx.order.create({
        data: orderData,
        include: {
          items: true,
        },
      });

      console.log("Sipariş başarıyla oluşturuldu:", order.id);

      // 4. Kullanıcı aktivitesini kaydet
      await tx.activity.create({
        data: {
          userId: paymentIntent.metadata.userId,
          type: "ORDER_CREATE",
          description: `${orderNumber} numaralı sipariş oluşturuldu.`,
          metadata: { orderId: order.id },
        },
      });

      console.log("Aktivite kaydı oluşturuldu");

      return order;
    } catch (err: any) {
      console.error("Webhook transaction hatası:", err.message);
      if (
        err.code === "P2002" &&
        err.meta?.target?.includes("paymentIntentId")
      ) {
        console.log(
          "Bu ödeme için zaten bir kayıt mevcut. Duplicate payment ID hatası."
        );
      }
      throw err;
    }
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Headers'ı direkt request nesnesinden al
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("Webhook alındı. İmza var mı:", !!signature);
  console.log("Webhook Secret var mı:", !!webhookSecret);

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
    console.log("Webhook olayı doğrulandı:", event.type);
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
        await handleSuccessfulPayment(
          event.data.object as Stripe.PaymentIntent
        );
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
