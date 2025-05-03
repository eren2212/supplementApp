import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

export async function GET(request: NextRequest) {
  try {
    // Session kontrolü
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Tüm doktorları çek - ilk önce bunu yapalım ki her tavsiye için tekrar tekrar sorgu yapmayalım
    const allDoctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // Tüm doktorların ID'lerini bir map olarak saklayalım
    const doctorsMap = new Map();
    allDoctors.forEach((doctor) => {
      doctorsMap.set(doctor.id, doctor);
    });

    // Veritabanından tüm tavsiyeleri çek
    const advices = await prisma.doctorAdvice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sonuçları manuel olarak doldur
    const results = [];

    for (const advice of advices) {
      // MongoDB ObjectId'leri string'e çevirip sonra karşılaştırma yapalım
      const doctorId = advice.doctorId.toString();

      // Doktoru bulmak için tüm doktorları kontrol et
      let foundDoctor = null;
      for (const doctor of allDoctors) {
        if (doctor.id.toString() === doctorId) {
          foundDoctor = doctor;
          break;
        }
      }

      // Her durumda bir doktor nesnesi olmasını sağla
      const doctorData = foundDoctor || {
        id: doctorId,
        name: "Dr. " + doctorId.substring(0, 5), // ID'nin ilk 5 karakterini kullan
        email: null,
        image: null,
      };

      // Tavsiyeyi doktor bilgileriyle birleştir
      results.push({
        ...advice,
        doctor: doctorData,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Tavsiye listeleme hatası:", error);
    return NextResponse.json(
      { error: "Tavsiyeler listelenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
