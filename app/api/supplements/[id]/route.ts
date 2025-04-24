import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get supplement ID from params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    // Fetch supplement details
    const supplement = await prisma.supplement.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            reports: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    // Process supplement data to include reportCount for UI
    const processedSupplement = {
      ...supplement,
      comments: supplement.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        rating: comment.rating,
        createdAt: comment.createdAt,
        isHidden: comment.isHidden,
        reportCount: comment.reportCount,
        user: comment.user,
      })),
    };

    return NextResponse.json(processedSupplement);
  } catch (error) {
    console.error("Error fetching supplement details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE a supplement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session || !session.user.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    // Check if supplement exists
    const existingSupplement = await prisma.supplement.findUnique({
      where: { id },
    });

    if (!existingSupplement) {
      return NextResponse.json(
        { error: "Takviye bulunamadı." },
        { status: 404 }
      );
    }

    // Delete related comments first to avoid foreign key constraint errors
    await prisma.comment.deleteMany({
      where: { supplementId: id },
    });

    // Delete the supplement
    await prisma.supplement.delete({
      where: { id },
    });

    // Create an activity record for this action
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "COMMENT_DELETE",
        referenceId: id,
        productName: existingSupplement.name,
        description: `"${existingSupplement.name}" isimli takviye silindi.`,
      },
    });

    return NextResponse.json({ message: "Takviye başarıyla silindi." });
  } catch (error) {
    console.error("Error deleting supplement:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// UPDATE a supplement
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session || !session.user.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category, imageUrl } = body;

    // Check if supplement exists
    const existingSupplement = await prisma.supplement.findUnique({
      where: { id },
    });

    if (!existingSupplement) {
      return NextResponse.json(
        { error: "Takviye bulunamadı." },
        { status: 404 }
      );
    }

    // Update the supplement
    const updatedSupplement = await prisma.supplement.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        category: category !== undefined ? category : undefined,
      },
    });

    // Create an activity record for this action
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "PRODUCT_VIEW", // Using an existing activity type
        referenceId: id,
        productName: updatedSupplement.name,
        description: `"${updatedSupplement.name}" isimli takviye güncellendi.`,
      },
    });

    return NextResponse.json(updatedSupplement);
  } catch (error) {
    console.error("Error updating supplement:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
