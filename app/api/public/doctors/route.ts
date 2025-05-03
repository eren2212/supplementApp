import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

// GET - Tüm doktorları getir
export async function GET(request: Request) {
  try {
    // Doktor rolündeki kullanıcıları getir
    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
    });

    // Doktor bilgilerini formatla
    const formattedDoctors = doctors.map((doctor) => {
      return {
        id: doctor.id,
        name: doctor.name,
        title: "Uzman Doktor", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
        specialty: "Sağlık Danışmanı", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
        image: doctor.image || "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Sağlık ve takviyeler konusunda uzman doktor.", // Bu bilgi kullanıcı modelinde olmadığı için varsayılan değer
        email: doctor.email,
      };
    });

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error("Doktorlar getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
