import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

// GET - Tüm yayınlanmış (published) tavsiyeleri getir
export async function GET(request: Request) {
  try {
    // URL parametrelerini al (kategori filtresi için)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Filtreleme koşullarını oluştur
    const whereCondition: any = {
      status: "published", // Sadece yayınlanmış tavsiyeleri getir
    };

    // Eğer kategori belirtilmişse ve "all" değilse, filtreye ekle
    if (category && category !== "all") {
      whereCondition.category = category;
    }

    // Tavsiyeleri getir
    const advices = await prisma.doctorAdvice.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc", // Yeniden eskiye sırala
      },
    });

    // Doktor bilgilerini getir (her benzersiz doctorId için)
    const doctorIds = [...new Set(advices.map((advice) => advice.doctorId))];

    const doctors = await prisma.user.findMany({
      where: {
        id: { in: doctorIds },
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
    });

    // Tavsiye ve doktor bilgilerini birleştir
    const advicesWithDoctors = advices.map((advice) => {
      const doctor = doctors.find((d) => d.id === advice.doctorId) || null;

      // Tarih formatını düzenle
      const formattedDate = new Date(advice.createdAt).toLocaleDateString(
        "tr-TR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

      return {
        id: advice.id,
        doctorId: advice.doctorId,
        title: advice.title,
        content: advice.content,
        category: advice.category,
        likes: advice.likes,
        imageUrl: advice.imageUrl,
        date: formattedDate,
        doctor: doctor
          ? {
              id: doctor.id,
              name: doctor.name,
              image:
                doctor.image ||
                "https://randomuser.me/api/portraits/men/32.jpg",
              title: "Uzman Doktor", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
              specialty: "Sağlık Danışmanı", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
            }
          : null,
      };
    });

    return NextResponse.json(advicesWithDoctors);
  } catch (error) {
    console.error("Tavsiyeler getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
