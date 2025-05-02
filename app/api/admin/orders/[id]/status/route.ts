import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { OrderStatus, ActivityType } from "@prisma/client";
import prisma from "@/libs/prismadb";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Admin kullanıcı ID'si
    const adminUserId = session.user.id;
    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı kimliği bulunamadı" },
        { status: 400 }
      );
    }

    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Sipariş ID'si belirtilmedi" },
        { status: 400 }
      );
    }

    // İstek gövdesinden yeni durumu al
    const body = await req.json();
    const { status } = body;

    // Geçerli bir sipariş durumu mu kontrol et
    const validStatuses: OrderStatus[] = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
      "returned",
    ];

    if (!status || !validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz sipariş durumu" },
        { status: 400 }
      );
    }

    // Önce siparişin var olduğunu kontrol et
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Transaction içinde sipariş durumunu güncelle ve aktivite kaydet
    const result = await prisma.$transaction(async (tx) => {
      // Sipariş durumunu güncelle
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
      });

      // Durum değişikliği aktivitesini kaydet
      await tx.activity.create({
        data: {
          userId: adminUserId,
          type: "ORDER_STATUS_CHANGE" as ActivityType,
          description: `${existingOrder.orderNumber} numaralı siparişin durumu "${status}" olarak değiştirildi.`,
          metadata: {
            orderId: orderId,
            oldStatus: existingOrder.status,
            newStatus: status,
          } as any,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Sipariş durumu başarıyla güncellendi",
    });
  } catch (error: any) {
    console.error("Sipariş durumu güncellenirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sipariş durumu güncellenirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}
