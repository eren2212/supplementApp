import { auth } from "@/auth";
import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";

// GET a specific comment report
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: reportId } = await params;

    const report = await prisma.commentReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE a specific comment report
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

    const { id: reportId } = await params;

    // First check if the report exists
    const report = await prisma.commentReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        comment: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Delete the report
    await prisma.commentReport.delete({
      where: {
        id: reportId,
      },
    });

    // Decrement the report count on the comment
    await prisma.comment.update({
      where: {
        id: report.commentId,
      },
      data: {
        reportCount: {
          decrement: 1,
        },
      },
    });

    // Log this activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "COMMENT_DELETE", // Using an existing ActivityType
        referenceId: report.commentId,
        productName: "Yorum Şikayeti",
        description: `Bir yorum şikayeti silindi. Şikayet ID: ${reportId}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
