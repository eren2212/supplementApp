import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// GET handler for fetching users with pagination
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 403 });
    }

    // Parse query parameters (page, limit)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          phone: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Kullanıcılar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new user
export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, email, password, role, phone, address } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "İsim, e-posta ve şifre zorunludur" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: (role as Role) || "CUSTOMER",
        phone,
        address,
      },
    });

    // Remove password from response
    const { hashedPassword: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Kullanıcı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
