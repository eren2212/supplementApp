import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Session kontrolü
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    const adviceId = params.id;

    // Tavsiyenin var olup olmadığını kontrol et
    const existingAdvice = await prisma.doctorAdvice.findUnique({
      where: {
        id: adviceId,
      },
    });

    if (!existingAdvice) {
      return NextResponse.json(
        { error: "Tavsiye bulunamadı." },
        { status: 404 }
      );
    }

    // Tavsiyeyi veritabanından sil
    await prisma.doctorAdvice.delete({
      where: {
        id: adviceId,
      },
    });

    // Başarılı yanıt
    return NextResponse.json({ success: true, id: adviceId });
  } catch (error) {
    console.error("Tavsiye silme hatası:", error);
    return NextResponse.json(
      { error: "Tavsiye silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
