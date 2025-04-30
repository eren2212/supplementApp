import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// Sipariş detaylarını getirme
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si belirtilmedi" },
        { status: 400 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        ...(isAdmin ? {} : { userId: session.user.id as string }), // Admin değilse sadece kullanıcının kendi siparişlerini görebilir
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Sipariş alınırken hata:", error);
    return NextResponse.json(
      { error: "Sipariş alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Sipariş bilgilerini güncelleme (özellikle teslimat bilgileri için)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si belirtilmedi" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { shippingAddress } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Teslimat bilgileri belirtilmedi" },
        { status: 400 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    // Önce siparişin varlığını ve kullanıcıya ait olup olmadığını kontrol et
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
        ...(isAdmin ? {} : { userId: session.user.id as string }), // Admin değilse sadece kullanıcının kendi siparişlerini güncelleyebilir
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı veya bu işlem için yetkiniz yok" },
        { status: 404 }
      );
    }

    // Siparişi güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingAddress,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Sipariş güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Sipariş güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
