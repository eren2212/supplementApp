import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, OrderStatus, ActivityType } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız" },
        { status: 401 }
      );
    }

    // userId'yi kesin olarak string tipinde olmasını sağla
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı kimliği bulunamadı" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      paymentIntentId,
      items,
      totalAmount,
      shippingAddress,
      paymentAmount,
    } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Ödeme bilgisi eksik" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sipariş öğeleri eksik" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Teslimat adresi eksik" },
        { status: 400 }
      );
    }

    console.log("Sipariş oluşturma isteği alındı:", {
      userId,
      paymentIntentId,
      itemCount: items.length,
      totalAmount,
    });

    // Veritabanı işlemlerini transaction içinde yap
    const result = await prisma.$transaction(async (tx) => {
      // 1. Önce ödeme kaydını oluştur
      const payment = await tx.payment.create({
        data: {
          userId: userId,
          amount: paymentAmount || totalAmount,
          paymentIntentId: paymentIntentId,
          status: "completed",
          description: "Sipariş ödemesi",
          metadata: { source: "manual_order_creation" } as any,
        },
      });

      console.log("Ödeme kaydı oluşturuldu:", payment.id);

      // 2. Benzersiz sipariş numarası oluştur
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const orderNumber = `ORD-${timestamp}${random}`;

      // 3. Siparişi oluştur
      const order = await tx.order.create({
        data: {
          userId: userId,
          orderNumber: orderNumber,
          status: "processing" as OrderStatus,
          totalAmount: totalAmount,
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
            create: items.map((item: any) => ({
              productId: item.id,
              productName: item.name,
              productImage: item.imageUrl || null,
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

      console.log("Sipariş başarıyla oluşturuldu:", order.id);

      // 4. Kullanıcı aktivitesini kaydet
      await tx.activity.create({
        data: {
          userId: userId,
          type: "ORDER_CREATE" as ActivityType,
          description: `${orderNumber} numaralı sipariş oluşturuldu.`,
          metadata: { orderId: order.id } as any,
        },
      });

      return {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          orderItems: order.items,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sipariş oluşturma hatası:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Sipariş oluşturulurken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
