import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET a specific comment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        supplement: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH to update (hide/unhide) a comment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role or is the comment owner
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { isHidden } = body;

    // Only admins can hide/unhide comments
    if (isHidden !== undefined && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      );
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        supplement: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Update comment
    const updateData: any = {};

    if (isHidden !== undefined) {
      updateData.isHidden = isHidden;
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateData,
    });

    // Create activity record for hiding/unhiding a comment
    if (isHidden !== undefined && session.user.role === "ADMIN") {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          type: isHidden ? "COMMENT_DELETE" : "COMMENT_EDIT",
          referenceId: id,
          productName: existingComment.supplement.name,
          description: isHidden
            ? `"${existingComment.supplement.name}" ürününe yapılan bir yorum gizlendi.`
            : `"${existingComment.supplement.name}" ürününe yapılan bir yorum görünür yapıldı.`,
        },
      });
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        supplement: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Only the comment owner or an admin can delete the comment
    if (
      existingComment.user.id !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmuyor." },
        { status: 403 }
      );
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    // Create activity record for comment deletion
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "COMMENT_DELETE",
        referenceId: id,
        productName: existingComment.supplement.name,
        description: `"${existingComment.supplement.name}" ürününe yapılan bir yorum silindi.`,
      },
    });

    return NextResponse.json({ message: "Yorum başarıyla silindi." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
