import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { logActivity } from "@/utils/activityService";

interface Params {
  params: {
    id: string;
  };
}

// Adres detayını getir
export async function GET(request: Request, { params }: Params) {
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

    const address = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id, // Sadece kullanıcıya ait adreslere erişim sağla
      },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Adres bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Adres detayı alma hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// Adresi güncelle
export async function PUT(request: Request, { params }: Params) {
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
    } = await request.json();

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

    // Adresin varlığını ve kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: "Adres bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer bu adres varsayılan olarak işaretlenmişse, diğer varsayılan adresleri kaldır
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: params.id }, // Güncellenen adres hariç
        },
        data: { isDefault: false },
      });
    }

    // Adresi güncelle
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        title,
        isDefault: isDefault || false,
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
    await logActivity(user.id, "ADDRESS_UPDATE", `Adres güncellendi: ${title}`);

    return NextResponse.json({
      success: true,
      data: updatedAddress,
      message: "Adres başarıyla güncellendi.",
    });
  } catch (error) {
    console.error("Adres güncelleme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// Adresi sil
export async function DELETE(request: Request, { params }: Params) {
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

    // Adresin varlığını ve kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, message: "Adres bulunamadı" },
        { status: 404 }
      );
    }

    // Adresi sil
    await prisma.address.delete({
      where: { id: params.id },
    });

    // Adres silindikten sonra başka bir adresi varsayılan olarak işaretle (eğer varsa)
    if (existingAddress.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { userId: user.id },
      });

      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    // Aktivite kaydı ekle
    await logActivity(
      user.id,
      "ADDRESS_UPDATE",
      `Adres silindi: ${existingAddress.title}`
    );

    return NextResponse.json({
      success: true,
      message: "Adres başarıyla silindi.",
    });
  } catch (error) {
    console.error("Adres silme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
