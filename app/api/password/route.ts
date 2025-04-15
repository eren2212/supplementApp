import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcryptjs";
import { logProfileUpdateActivity } from "@/utils/activityService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  // Kullanıcıyı ID ile birlikte alalım
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, hashedPassword: true },
  });

  if (!user?.hashedPassword) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  // Şifreyi tekrar kontrol et
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

  // Şifre değişikliği aktivitesi kaydet
  // Şifre değişikliği aktivitesi kaydet
  await logProfileUpdateActivity(user.id, ["password"]); // Array olarak gönderin

  return NextResponse.json({ success: true });
}
