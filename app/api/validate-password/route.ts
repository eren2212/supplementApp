import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }

  const { currentPassword } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { hashedPassword: true },
  });

  if (!user?.hashedPassword) {
    return NextResponse.json({ isValid: false }, { status: 404 });
  }

  const isCorrect = await bcrypt.compare(currentPassword, user.hashedPassword);
  return NextResponse.json({ isValid: isCorrect });
}
