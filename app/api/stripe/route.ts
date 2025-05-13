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
      // Stripe metadata değerlerinin 500 karakterle sınırlı olduğunu kontrol edelim
      const isValueTooLong = (value: string) => value.length > 490; // 500'den biraz az bırakalım güvenlik için

      // Sepet öğelerini gerekirse kısalt
      let processedCartItems = cartItemsString;

      // Eğer cartItems 490 karakterden uzunsa, optimize edilmiş bir versiyonunu oluştur
      if (isValueTooLong(processedCartItems)) {
        console.log("CartItems çok uzun, kısaltılıyor...");

        // Önce minimuma indirgenmiş veriyi deneyelim
        let simplifiedCartItems = JSON.stringify(
          cartItems.map((item) => ({
            id: item.id,
            qty: item.quantity,
            p: item.price,
          }))
        );

        // Hala çok uzunsa, sadece ID'leri gönderelim
        if (isValueTooLong(simplifiedCartItems)) {
          simplifiedCartItems = JSON.stringify(
            cartItems.map((item) => item.id)
          );

          // Son çare olarak sepet öğesi sayısını ve toplam tutarı gönderelim
          if (isValueTooLong(simplifiedCartItems)) {
            simplifiedCartItems = JSON.stringify({
              count: cartItems.length,
              totalAmount: amount,
            });
          }
        }

        processedCartItems = simplifiedCartItems;
      }

      const metadataObj = {
        userId: session.user.id,
        cartItems: processedCartItems,
        itemCount: cartItems.length.toString(),
        ...metadata,
      };

      // Teslimat adresini gerekirse kısalt
      let processedShippingAddress = shippingAddressString;
      if (isValueTooLong(processedShippingAddress)) {
        console.log("ShippingAddress çok uzun, kısaltılıyor...");
        // Sadece temel bilgileri içeren adres
        processedShippingAddress = JSON.stringify({
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        });
      }

      metadataObj.shippingAddress = processedShippingAddress;

      // Son bir kontrol daha yapalım
      for (const [key, value] of Object.entries(metadataObj)) {
        if (typeof value === "string" && isValueTooLong(value)) {
          console.log(
            `Metadata değeri '${key}' hala çok uzun, daha fazla kısaltılıyor...`
          );
          if (key === "cartItems") {
            metadataObj[key] = JSON.stringify({ count: cartItems.length });
          } else if (key === "shippingAddress") {
            metadataObj[key] = JSON.stringify({ addressExists: true });
          } else {
            // Diğer potansiyel uzun değerleri elleçle
            metadataObj[key] = value.substring(0, 480) + "...";
          }
        }
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
