import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";
import { Category } from "@prisma/client";

// GET all supplements for admin
export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu sayfaya erişim yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Fetch all supplements with additional admin-specific data
    const supplements = await prisma.supplement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Format data with additional metrics for admin panel
    const formattedSupplements = supplements.map((supplement) => {
      // Format image URL
      const imageName = supplement.imageUrl.split("/").pop();

      return {
        ...supplement,
        imageUrl: imageName || supplement.imageUrl,
        commentCount: supplement._count.comments,
        status: supplement.stock > 0 ? "active" : "inactive",
      };
    });

    return NextResponse.json(formattedSupplements);
  } catch (error) {
    console.error("Error fetching supplements for admin:", error);
    return NextResponse.json(
      { error: "Takviye ürünleri yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST - Create a new supplement
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category, imageUrl, featured } =
      body;

    // Validate required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !category ||
      !imageUrl
    ) {
      return NextResponse.json(
        { error: "Tüm alanlar doldurulmalıdır." },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(Category).includes(category as Category)) {
      return NextResponse.json(
        { error: "Geçersiz kategori." },
        { status: 400 }
      );
    }

    // Create the supplement
    const newSupplement = await prisma.supplement.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        category: category as Category,
        // Add any additional fields needed for admin features
      },
    });

    // Create an activity record for this action
    await prisma.activity.create({
      data: {
        userId: session.user.id!,
        type: "PRODUCT_VIEW",
        referenceId: newSupplement.id,
        productName: newSupplement.name,
        description: `"${newSupplement.name}" isimli yeni takviye eklendi.`,
      },
    });

    return NextResponse.json(newSupplement);
  } catch (error) {
    console.error("Error creating supplement:", error);
    return NextResponse.json(
      { error: "Takviye ürünü oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// For bulk operations if needed
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { supplements } = body;

    if (!supplements || !Array.isArray(supplements)) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı." },
        { status: 400 }
      );
    }

    // Process bulk update (implement based on your specific requirements)
    // This is a placeholder for bulk operations

    return NextResponse.json({ message: "Toplu güncelleme başarılı." });
  } catch (error) {
    console.error("Error processing bulk update:", error);
    return NextResponse.json(
      { error: "Toplu güncelleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
