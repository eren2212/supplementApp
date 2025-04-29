import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prismadb from "@/libs/prismadb";
import { auth } from "@/auth";

// Stripe instance oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

// Ödeme için intent oluştur
export async function POST(req: NextRequest) {
  try {
    console.log("Stripe API isteği alındı");

    const body = await req.json();
    const { amount, paymentMethodId, description, saveCard } = body;

    console.log("Stripe API parametre kontrolü:", {
      amount,
      saveCard,
      hasPaymentMethod: !!paymentMethodId,
    });

    // Miktar kontrolü
    if (!amount || amount <= 0) {
      console.log("Geçersiz ödeme miktarı hatası:", amount);
      return NextResponse.json(
        { error: "Geçersiz ödeme miktarı" },
        { status: 400 }
      );
    }

    // Kullanıcı bilgisi
    const session = await auth();
    const userId = session?.user?.id;

    console.log("Kullanıcı kontrolü:", { isAuthenticated: !!userId });

    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Kayıtlı bir ödeme yöntemi kullanılıyorsa
    if (paymentMethodId) {
      console.log(
        "Kayıtlı ödeme yöntemi ile işlem başlatılıyor:",
        paymentMethodId
      );

      // Kullanıcının Stripe müşteri ID'si var mı kontrol et
      const user = await prismadb.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });

      let stripeCustomerId = user?.stripeCustomerId;
      console.log("Mevcut Stripe müşteri ID'si:", stripeCustomerId);

      // Eğer müşteri ID yoksa yeni müşteri oluştur
      if (!stripeCustomerId && saveCard) {
        console.log("Yeni Stripe müşteri oluşturuluyor");

        try {
          const customer = await stripe.customers.create({
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            metadata: {
              userId: userId,
            },
          });

          stripeCustomerId = customer.id;
          console.log("Yeni Stripe müşteri oluşturuldu:", customer.id);

          // Kullanıcıyı güncelle
          await prismadb.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
          });
        } catch (customerError: any) {
          console.error(
            "Stripe müşteri oluşturma hatası:",
            customerError.message
          );
          // Müşteri oluşturma başarısız olsa bile devam et
        }
      }

      // Ödeme yöntemini müşteriye ekleyebiliriz
      if (stripeCustomerId && saveCard) {
        try {
          console.log("Ödeme yöntemi müşteriye ekleniyor:", paymentMethodId);

          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
          });

          console.log("Ödeme yöntemi müşteriye eklendi");
        } catch (error: any) {
          console.error("Ödeme yöntemi ekleme hatası:", error.message);
          // Hata olsa bile devam et, kritik değil
        }
      }

      try {
        console.log("PaymentIntent oluşturuluyor");

        // Kayıtlı ödeme yöntemi ile ödeme
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Cent cinsinden
          currency: "try",
          payment_method: paymentMethodId,
          confirm: true,
          description: description || "Ödeme işlemi",
          metadata: {
            userId: userId,
          },
          customer: stripeCustomerId || undefined,
        });

        console.log("PaymentIntent oluşturuldu:", {
          id: paymentIntent.id,
          status: paymentIntent.status,
        });

        // Ödeme kaydını oluştur
        await prismadb.payment.create({
          data: {
            amount: amount,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            userId: userId,
          },
        });

        return NextResponse.json({
          paymentIntent,
          success: paymentIntent.status === "succeeded",
        });
      } catch (paymentError: any) {
        console.error("PaymentIntent oluşturma hatası:", paymentError.message);
        return NextResponse.json(
          { error: paymentError.message || "Ödeme işlemi başarısız oldu" },
          { status: 500 }
        );
      }
    } else {
      // Yeni ödeme oluştur
      const paymentIntentData: any = {
        amount: Math.round(amount * 100),
        currency: "try",
        description: description || "Ödeme işlemi",
        metadata: {
          userId: userId,
        },
      };

      // Kullanıcının Stripe müşteri ID'si varsa ekle
      if (saveCard) {
        const user = await prismadb.user.findUnique({
          where: { id: userId },
          select: { stripeCustomerId: true },
        });

        if (user?.stripeCustomerId) {
          console.log("Stripe müşteri ID'si bulundu:", user.stripeCustomerId);
          paymentIntentData.customer = user.stripeCustomerId;
          // Sadece Stripe müşteri ID'si varsa setup_future_usage kullan
          paymentIntentData.setup_future_usage = "off_session";
        } else {
          console.log("Stripe müşteri ID'si bulunamadı");
        }
      }

      console.log("Stripe PaymentIntent oluşturuluyor:", {
        amount: paymentIntentData.amount,
        currency: paymentIntentData.currency,
      });

      try {
        const paymentIntent = await stripe.paymentIntents.create(
          paymentIntentData
        );
        console.log("Stripe PaymentIntent oluşturuldu:", paymentIntent.id);

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (stripeError: any) {
        console.error(
          "Stripe PaymentIntent oluşturma hatası:",
          stripeError.message
        );
        return NextResponse.json(
          {
            error:
              stripeError.message || "Ödeme işlemi sırasında bir hata oluştu",
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("[STRIPE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Ödeme işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Ödeme yöntemlerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Kullanıcının Stripe müşteri ID'sini bulma
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    // Eğer stripeCustomerId yoksa boş liste döndür
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // Stripe müşterisinin ödeme yöntemlerini getir
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    return NextResponse.json({ paymentMethods: paymentMethods.data });
  } catch (error: any) {
    console.error("[STRIPE_GET_PAYMENT_METHODS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Ödeme yöntemleri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
