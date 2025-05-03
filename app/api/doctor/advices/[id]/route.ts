import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET - Belirli bir tavsiyeyi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Tavsiye ID'si belirtilmelidir." },
        { status: 400 }
      );
    }

    const advice = await prisma.doctorAdvice.findUnique({
      where: {
        id: id,
      },
    });

    if (!advice) {
      return NextResponse.json(
        { error: "Tavsiye bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(advice);
  } catch (error) {
    console.error("Tavsiye getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PATCH - Tavsiyeyi güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = params;

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Tavsiye ID'si belirtilmelidir." },
        { status: 400 }
      );
    }

    // Kullanıcının doktor olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user || user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Bu işlem için doktor olmalısınız." },
        { status: 403 }
      );
    }

    // Tavsiyenin var olup olmadığını ve doktora ait olup olmadığını kontrol et
    const existingAdvice = await prisma.doctorAdvice.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdvice) {
      return NextResponse.json(
        { error: "Tavsiye bulunamadı." },
        { status: 404 }
      );
    }

    // Sadece kendi tavsiyelerini düzenleyebilir
    if (existingAdvice.doctorId !== user.id) {
      return NextResponse.json(
        { error: "Bu tavsiyeyi düzenleme yetkiniz yok." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, status, imageUrl } = body;

    // Güncelleme için geçerli alanları içeren bir nesne oluştur
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Tavsiyeyi güncelle
    const updatedAdvice = await prisma.doctorAdvice.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedAdvice);
  } catch (error) {
    console.error("Tavsiye güncellenirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// DELETE - Tavsiyeyi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = params;

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Tavsiye ID'si belirtilmelidir." },
        { status: 400 }
      );
    }

    // Kullanıcının doktor olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user || user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Bu işlem için doktor olmalısınız." },
        { status: 403 }
      );
    }

    // Tavsiyenin var olup olmadığını ve doktora ait olup olmadığını kontrol et
    const existingAdvice = await prisma.doctorAdvice.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdvice) {
      return NextResponse.json(
        { error: "Tavsiye bulunamadı." },
        { status: 404 }
      );
    }

    // Sadece kendi tavsiyelerini silebilir (Admin de silebilir)
    if (existingAdvice.doctorId !== user.id) {
      return NextResponse.json(
        { error: "Bu tavsiyeyi silme yetkiniz yok." },
        { status: 403 }
      );
    }

    // Tavsiyeyi sil
    await prisma.doctorAdvice.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tavsiye silinirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
