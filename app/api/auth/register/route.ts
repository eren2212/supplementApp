import bcrypt from "bcryptjs";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name } = body;

  const hashedPassword = await bcrypt.hash(password, 12);
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) return new Response("Existing user", { status: 422 });
  console.log(name.toLowerCase());

  const user = await prisma.user.create({
    data: {
      email,
      name: name.toLowerCase(),
      hashedPassword, // Make sure field name matches Prisma schema
    },
  });

  return NextResponse.json(user);
}
