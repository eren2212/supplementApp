import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

// Stripe nesnesini oluştur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      amount,
      currency = "try",
      description,
      cartItems,
      shippingAddress,
      metadata = {},
    } = body;

    console.log("Ödeme isteği:", {
      userId: session.user.id,
      amount,
      cartItemsCount: cartItems?.length,
      shippingAddress: !!shippingAddress,
    });

    if (!amount) {
      return NextResponse.json(
        { error: "Tutar belirtilmedi" },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Sepet öğeleri belirtilmedi" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Teslimat adresi belirtilmedi" },
        { status: 400 }
      );
    }

    // Sepet öğelerini JSON string'e dönüştür
    const cartItemsString = JSON.stringify(cartItems);
    const shippingAddressString = JSON.stringify(shippingAddress);

    // Stripe metadata'sı için maksimum boyut sınırlaması var, bu yüzden güvenli bir şekilde kısaltıyoruz
    // ve çok uzunsa özet bir bilgi saklıyoruz
    const prepareMetadata = () => {
      const metadataObj = {
        userId: session.user.id,
        cartItems: cartItemsString,
        shippingAddress: shippingAddressString,
        itemCount: cartItems.length.toString(),
        ...metadata,
      };

      // Stripe metadata değerlerinin 500 karakterle sınırlı olduğunu kontrol edelim
      const isValueTooLong = (value: string) => value.length > 500;

      // cartItems çok uzunsa, sadece kimlik bilgilerini saklayalım
      if (isValueTooLong(metadataObj.cartItems)) {
        console.log("CartItems çok uzun, kısaltılıyor...");
        metadataObj.cartItems = JSON.stringify(
          cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        );
      }

      return metadataObj;
    };

    // Ödeme niyeti oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe kuruş cinsinden çalışır
      currency,
      description,
      metadata: prepareMetadata(),
    });

    console.log("Ödeme niyeti oluşturuldu:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Stripe ödeme işlemi başarısız:", error);
    return NextResponse.json(
      { error: error.message || "Ödeme işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
