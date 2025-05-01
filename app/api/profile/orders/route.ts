import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

    // Kullanıcının siparişlerini tarihe göre sıralayarak getir (en yeni siparişler önce)
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true, // Sipariş ürünlerini dahil et
        payment: true, // Ödeme bilgilerini dahil et
      },
      orderBy: {
        createdAt: "desc", // En yeni siparişler önce
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Siparişler alınırken hata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Siparişler alınırken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
