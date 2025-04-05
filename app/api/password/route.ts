import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic"; // Önemli!

// app/api/password/route.ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.hashedPassword) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  // Şifreyi tekrar kontrol et (güvenlik için)
  const isCorrect = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isCorrect) {
    return NextResponse.json(
      { success: false, message: "Mevcut şifre yanlış" },
      { status: 400 }
    );
  }

  // Yeni şifreyi hashle ve kaydet
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { hashedPassword },
  });

  return NextResponse.json({ success: true });
}
