import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

export async function GET(req: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Yetkilendirme başarısız" },
        { status: 401 }
      );
    }

    // Admin yetkisi kontrolü
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bu işlemi yapmak için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Tüm siparişleri tarihe göre sıralayarak getir (en yeni siparişler önce)
    const orders = await prisma.order.findMany({
      include: {
        items: true, // Sipariş ürünlerini dahil et
        user: {
          select: {
            name: true,
            email: true,
          },
        }, // Kullanıcı bilgilerini dahil et
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
