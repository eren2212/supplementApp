import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { logActivity, logProfileUpdateActivity } from "@/utils/activityService";

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
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Profil bilgisi alma hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  try {
    const { name, address, phone } = await req.json();

    // Veri doğrulama
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Ad geçersiz formatta." },
        { status: 400 }
      );
    }

    if (phone && !/^\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz telefon numarası formatı." },
        { status: 400 }
      );
    }

    // Hangi alanların güncelleneceğini tespit et
    const updatedFields = [];
    if (name !== undefined) updatedFields.push("isim");
    if (address !== undefined) updatedFields.push("adres");
    if (phone !== undefined) updatedFields.push("telefon");

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    // Aktivite kaydı (sadece gerçekten güncellenen alanlar için)
    if (updatedFields.length > 0) {
      await logProfileUpdateActivity(updatedUser.id, updatedFields);
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz erişim" },
      { status: 401 }
    );
  }

  try {
    // Önce kullanıcıyı bulalım (aktivite için ID'ye ihtiyacımız var)
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

    // Aktivite kaydı ekle
    await logActivity(user.id, "account_deletion", "Kullanıcı hesabını sildi");

    // Kullanıcıyı veritabanından sil
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Hesap başarıyla silindi.",
    });
  } catch (error) {
    console.error("Hesap silme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası, tekrar deneyin." },
      { status: 500 }
    );
  }
}
