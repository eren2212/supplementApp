import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";
import { Category } from "@prisma/client";

// GET a single supplement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const id = params.id;

    // Fetch supplement with additional admin-specific data
    const supplement = await prisma.supplement.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Takviye bulunamadı." },
        { status: 404 }
      );
    }

    // Format image URL
    const imageName = supplement.imageUrl.split("/").pop();

    // Add additional admin metrics
    const formattedSupplement = {
      ...supplement,
      imageUrl: imageName || supplement.imageUrl,
      status: supplement.stock > 0 ? "active" : "inactive",
    };

    return NextResponse.json(formattedSupplement);
  } catch (error) {
    console.error("Error fetching supplement:", error);
    return NextResponse.json(
      { error: "Takviye yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// UPDATE a supplement
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const id = params.id;
    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
      status,
      featured,
    } = body;

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

    // Prepare update data, only including fields that are provided
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) {
      // Validate category if provided
      if (!Object.values(Category).includes(category as Category)) {
        return NextResponse.json(
          { error: "Geçersiz kategori." },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    // Update the supplement
    const updatedSupplement = await prisma.supplement.update({
      where: { id },
      data: updateData,
    });

    // Create an activity record for this action
    await prisma.activity.create({
      data: {
        userId: session.user.id!,
        type: "PRODUCT_VIEW",
        referenceId: id,
        productName: updatedSupplement.name,
        description: `"${updatedSupplement.name}" isimli takviye güncellendi.`,
      },
    });

    return NextResponse.json(updatedSupplement);
  } catch (error) {
    console.error("Error updating supplement:", error);
    return NextResponse.json(
      { error: "Takviye güncellenirken bir hata oluştu." },
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

    const id = params.id;

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
        userId: session.user.id!,
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
      { error: "Takviye silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
