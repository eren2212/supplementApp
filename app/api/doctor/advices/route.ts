import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET - Doktora ait tüm tavsiyeleri getir
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    // Eğer doctorId belirtilmişse, sadece o doktora ait tavsiyeleri getir
    if (doctorId) {
      const advices = await prisma.doctorAdvice.findMany({
        where: {
          doctorId: doctorId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(advices);
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

    // Giriş yapan doktora ait tüm tavsiyeleri getir
    const advices = await prisma.doctorAdvice.findMany({
      where: {
        doctorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(advices);
  } catch (error) {
    console.error("Tavsiyeler getirilirken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// POST - Yeni tavsiye oluştur
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
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

    const body = await request.json();
    const { title, content, category, status, imageUrl } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Başlık, içerik ve kategori alanları zorunludur." },
        { status: 400 }
      );
    }

    // Yeni tavsiye oluştur
    const newAdvice = await prisma.doctorAdvice.create({
      data: {
        doctorId: user.id,
        title,
        content,
        category,
        status: status || "draft", // Varsayılan olarak taslak
        imageUrl,
      },
    });

    return NextResponse.json(newAdvice);
  } catch (error) {
    console.error("Tavsiye oluşturulurken hata oluştu:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
