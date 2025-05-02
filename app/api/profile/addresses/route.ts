import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { logActivity } from "@/utils/activityService";

// Adres listesini getir
export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Adres listesi alma hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// Yeni adres ekle
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  try {
    const {
      title,
      isDefault,
      firstName,
      lastName,
      phone,
      address,
      city,
      district,
      postcode,
      country,
    } = await req.json();

    // Veri doğrulama
    if (
      !title ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !city ||
      !postcode
    ) {
      return NextResponse.json(
        { success: false, message: "Gerekli alanları doldurun." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer bu adres varsayılan olarak işaretlenmişse, diğer varsayılan adresleri kaldır
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Hiç adres yoksa, bu adresi varsayılan olarak işaretle
    const addressCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        title,
        isDefault: isDefault || addressCount === 0, // Hiç adres yoksa, varsayılan olarak işaretle
        firstName,
        lastName,
        phone,
        address,
        city,
        district: district || null,
        postcode,
        country: country || "Türkiye",
      },
    });

    // Aktivite kaydı ekle
    await logActivity(
      user.id,
      "ADDRESS_UPDATE",
      `Yeni adres eklendi: ${title}`
    );

    return NextResponse.json({
      success: true,
      data: newAddress,
      message: "Adres başarıyla eklendi.",
    });
  } catch (error) {
    console.error("Adres ekleme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
