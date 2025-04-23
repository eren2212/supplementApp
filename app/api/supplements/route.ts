import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";
import { Category } from "@prisma/client";

export async function GET() {
  try {
    const supplements = await prisma.supplement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const validSupplements = supplements.filter(
      (supplement) => supplement.category !== null
    );

    const supplementsWithFixedImages = validSupplements.map((supplement) => {
      const imageName = supplement.imageUrl.split("/").pop();

      return {
        ...supplement,
        imageUrl: imageName || supplement.imageUrl,
      };
    });

    return NextResponse.json(supplementsWithFixedImages);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST a new supplement
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session || !session.user.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category, imageUrl } = body;

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
    if (!Object.values(Category).includes(category)) {
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
        category,
      },
    });

    // Create an activity record for this action
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "PRODUCT_VIEW", // Using an existing activity type that's closest to product creation
        referenceId: newSupplement.id,
        productName: newSupplement.name,
        description: `"${newSupplement.name}" isimli yeni takviye eklendi.`,
      },
    });

    return NextResponse.json(newSupplement);
  } catch (error) {
    console.error("Error creating supplement:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
