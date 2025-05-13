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
      const parsedData = JSON.parse(paymentIntent.metadata.cartItems);

      // Farklı formatlarda gelebilecek cartItems yapılarını kontrol edelim
      if (Array.isArray(parsedData)) {
        // Normal dizi formatı
        cartItems = parsedData.map((item) => {
          // Kısaltılmış formatta geldiyse (qty, p) onu genişletelim
          if (item.qty !== undefined && item.p !== undefined) {
            return {
              id: item.id,
              name: item.name || `Ürün ID: ${item.id}`,
              quantity: item.qty,
              price: item.p,
              imageUrl: item.imageUrl || undefined,
            };
          }

          // Sadece id dizisi geldiyse (en kısaltılmış format)
          if (typeof item === "string") {
            return {
              id: item,
              name: `Ürün ID: ${item}`,
              quantity: 1,
              price: 0, // Fiyat bilgisi yok, veritabanından alınabilir
              imageUrl: undefined,
            };
          }

          // Normal format
          return item;
        });
      }
      // Sadece count ve totalAmount bilgisi varsa (en son çare formatı)
      else if (parsedData.count !== undefined) {
        console.warn(
          "Sepet öğeleri basitleştirilmiş formatta (count only), veritabanından alınacak."
        );

        // Burada Prisma ile sipariş oluşturulamayacak kadar data kaybolmuş olabilir
        // Bu durumda veritabanından güncel sepet bilgisini çekmek gerekebilir
        // veya alternatif bir işlem uygulamak gerekebilir

        // Şimdilik basit bir placeholder oluşturalım
        cartItems = [
          {
            id: "placeholder",
            name: `${parsedData.count} ürün içeren sipariş`,
            quantity: 1,
            price: paymentIntent.amount / 100, // Toplam tutarı tek bir ürün olarak göster
            imageUrl: undefined,
          },
        ];
      }
    } else if (paymentIntent.metadata?.orderItems) {
      cartItems = JSON.parse(paymentIntent.metadata.orderItems);
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Geçerli sepet öğeleri bulunamadı");
    }

    // Sepet öğelerini doğrula
    for (const item of cartItems) {
      // Tüm gerekli alanlar yoksa, hata verme ama log'la
      if (
        !item.id ||
        !item.name ||
        typeof item.quantity !== "number" ||
        typeof item.price !== "number"
      ) {
        console.warn("Eksik bilgi içeren sepet öğesi:", item);

        // Eksik alanları tamamlayalım
        item.name = item.name || `Ürün ID: ${item.id}`;
        item.quantity = item.quantity || 1;
        item.price = item.price || 0;
      }
    }
  } catch (error) {
    console.error("Sepet öğeleri ayrıştırılamadı:", error);

    // Hata durumunda basit bir geçici çözüm
    // Ödeme başarılı olduğu için en azından bir kayıt oluşturalım
    cartItems = [
      {
        id: "error-parsing",
        name: "Sepet bilgisi alınamadı",
        quantity: 1,
        price: paymentIntent.amount / 100,
        imageUrl: undefined,
      },
    ];
  }

  // Teslimat adresi parse et
  let shippingAddress: ShippingAddressType = {};
  try {
    if (paymentIntent.metadata?.shippingAddress) {
      const parsedAddress = JSON.parse(paymentIntent.metadata.shippingAddress);

      // Kısaltılmış teslimat adresi formatını kontrol et
      if (
        parsedAddress.name &&
        !parsedAddress.firstName &&
        !parsedAddress.lastName
      ) {
        // Ad ve soyadı ayır
        const nameParts = parsedAddress.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        shippingAddress = {
          firstName,
          lastName,
          email: parsedAddress.email || "",
          phone: parsedAddress.phone || "",
          address: "",
          city: "",
          postcode: "",
          country: "Türkiye",
        };
      }
      // En minimal teslimat adresi formatı
      else if (parsedAddress.addressExists) {
        shippingAddress = {
          firstName: "Bilinmiyor",
          lastName: "Bilinmiyor",
          email: "",
          phone: "",
          address: "Adres bilgisi veritabanında güncellenmelidir",
          city: "",
          postcode: "",
          country: "Türkiye",
        };
      } else {
        // Normal format
        shippingAddress = parsedAddress as ShippingAddressType;
      }
    }
  } catch (error) {
    console.error("Teslimat adresi ayrıştırılamadı:", error);

    // Hata durumunda basit bir teslimat adresi oluştur
    shippingAddress = {
      firstName: "Ayrıştırma",
      lastName: "Hatası",
      email: "",
      phone: "",
      address: "Teslimat adresi ayrıştırılamadı",
      city: "",
      postcode: "",
      country: "Türkiye",
    };
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
