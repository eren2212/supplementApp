import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

// GET - Belirli bir tavsiyeyi ID'ye göre getir
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

    // Tavsiyeyi bul
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

    // Sadece yayınlanmış tavsiyeleri göster (draft olanları değil)
    if (advice.status !== "published") {
      return NextResponse.json(
        { error: "Bu tavsiye henüz yayınlanmamıştır." },
        { status: 403 }
      );
    }

    // Doktor bilgilerini getir
    const doctor = await prisma.user.findUnique({
      where: {
        id: advice.doctorId,
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doktor bilgisi bulunamadı." },
        { status: 404 }
      );
    }

    // Tarih formatını düzenle
    const formattedDate = new Date(advice.createdAt).toLocaleDateString(
      "tr-TR",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    // Tavsiye ve doktor bilgilerini birleştir
    const adviceWithDoctor = {
      id: advice.id,
      doctorId: advice.doctorId,
      title: advice.title,
      content: advice.content,
      category: advice.category,
      likes: advice.likes,
      imageUrl: advice.imageUrl,
      date: formattedDate,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        image: doctor.image || "https://randomuser.me/api/portraits/men/32.jpg",
        title: "Uzman Doktor", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
        specialty: "Sağlık Danışmanı", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
        email: doctor.email,
      },
    };

    return NextResponse.json(adviceWithDoctor);
  } catch (error) {
    console.error("Tavsiye getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PATCH - Tavsiye beğeni sayısını artır
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Tavsiye ID'si belirtilmelidir." },
        { status: 400 }
      );
    }

    // Tavsiyeyi kontrol et
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

    // Sadece yayınlanmış tavsiyeleri beğenebilirsiniz
    if (advice.status !== "published") {
      return NextResponse.json(
        { error: "Bu tavsiye henüz yayınlanmamıştır." },
        { status: 403 }
      );
    }

    // Beğeni sayısını artır
    const updatedAdvice = await prisma.doctorAdvice.update({
      where: {
        id: id,
      },
      data: {
        likes: advice.likes + 1,
      },
    });

    return NextResponse.json({
      success: true,
      likes: updatedAdvice.likes,
    });
  } catch (error) {
    console.error("Tavsiye beğenilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
