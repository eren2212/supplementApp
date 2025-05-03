import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orderId = await params.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Sipariş ID'si belirtilmedi" },
        { status: 400 }
      );
    }

    // Sipariş detaylarını getir
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId, // Güvenlik için kullanıcının kendi siparişi olduğundan emin olun
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Sipariş detayları alınırken hata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sipariş detayları alınırken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
