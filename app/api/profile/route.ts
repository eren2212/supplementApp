import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

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
        name: true,
        email: true,
        address: true,
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
    const { name, address } = await req.json();

    // Veri doğrulama
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Ad geçersiz formatta." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
      },
      select: {
        name: true,
        email: true,
        address: true,
        image: true,
        role: true,
      },
    });

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
