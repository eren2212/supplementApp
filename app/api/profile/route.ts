import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

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

    // Veri doğrulama (basit bir örnek)
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Ad geçersiz formatta." },
        { status: 400 }
      );
    }
    if (address && typeof address !== "string" && address !== null) {
      return NextResponse.json(
        { success: false, message: "Adres geçersiz formatta." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }), // address null olabilir
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    let message = "Sunucu hatası oluştu.";
    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      message = error.message as string;
    }
    return NextResponse.json(
      {
        success: false,
        message: message,
      },
      { status: 500 }
    );
  }
}
