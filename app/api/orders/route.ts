import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";
import { ActivityType, OrderStatus } from "@prisma/client";

// NOT: Bu API, prisma.schema güncellendikten ve 'npx prisma generate' komutunun çalıştırılması sonrasında düzgün çalışacaktır.

// Tüm sipariş kayıtlarını dönme (sadece admin için)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // URL'den userId parametresini al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Admin tüm siparişleri görebilir, kullanıcı sadece kendi siparişlerini görebilir
    if (session.user.role === "ADMIN") {
      // Admin ise ve belirli bir kullanıcı filtresi varsa
      if (userId) {
        const orders = await prisma.order.findMany({
          where: { userId },
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return NextResponse.json(orders);
      }

      // Admin ise ve filtre yoksa tüm siparişler
      const orders = await prisma.order.findMany({
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(orders);
    } else {
      // Normal kullanıcı sadece kendi siparişlerini görebilir
      const orders = await prisma.order.findMany({
        where: { userId: session.user.id as string },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error("Siparişler alınırken hata oluştu:", error);
    return NextResponse.json(
      { error: "Siparişler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni sipariş oluşturma
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const body = await request.json();
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentIntentId,
      paymentStatus,
    } = body;

    // Giriş doğrulaması
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz sipariş öğeleri" },
        { status: 400 }
      );
    }

    if (
      !totalAmount ||
      isNaN(Number(totalAmount)) ||
      Number(totalAmount) <= 0
    ) {
      return NextResponse.json(
        { error: "Geçersiz sipariş tutarı" },
        { status: 400 }
      );
    }

    if (
      !shippingAddress ||
      !shippingAddress.firstName ||
      !shippingAddress.address
    ) {
      return NextResponse.json(
        { error: "Geçersiz teslimat adresi" },
        { status: 400 }
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Ödeme bilgisi eksik" },
        { status: 400 }
      );
    }

    // Sipariş numarası oluştur (örn: ORD-2023XXXXXX)
    const orderNumber = `ORD-${Date.now().toString().slice(-10)}`;

    try {
      // Önce ödeme kaydı oluştur
      const payment = await prisma.payment.create({
        data: {
          userId: userId,
          amount: totalAmount,
          paymentIntentId,
          status: paymentStatus,
          description: "Sipariş ödemesi",
          metadata: {},
        },
      });

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          userId: userId,
          orderNumber,
          totalAmount,
          status: OrderStatus.processing, // Ödeme başarılı olduğu için işleniyor durumuna geçiyor
          shippingAddress,
          paymentId: payment.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              productName: item.name,
              productImage: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Kullanıcı aktivitesini kaydet
      await prisma.activity.create({
        data: {
          userId: userId,
          type: ActivityType.ORDER_CREATE,
          description: `${orderNumber} numaralı sipariş oluşturuldu`,
          metadata: { orderId: order.id },
        },
      });

      return NextResponse.json(order);
    } catch (dbError: any) {
      console.error("Veritabanı işlemi sırasında hata:", dbError);
      return NextResponse.json(
        {
          error:
            "Sipariş veritabanına kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          details: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Sipariş oluşturulurken hata:", error);
    return NextResponse.json(
      {
        error: "Sipariş oluşturulurken bir hata oluştu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
