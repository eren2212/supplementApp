import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// POST to report a comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user.email) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        supplement: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // User can't report their own comment
    if (existingComment.user.id === user.id) {
      return NextResponse.json(
        { error: "Kendi yorumunuzu şikayet edemezsiniz." },
        { status: 400 }
      );
    }

    // Check if user already reported this comment
    const existingReport = await prisma.comment.findFirst({
      where: {
        id: commentId,
        reports: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "Bu yorumu zaten şikayet ettiniz." },
        { status: 400 }
      );
    }

    // Create comment report
    const report = await prisma.$transaction(async (tx) => {
      // Create the report
      const newReport = await tx.commentReport.create({
        data: {
          commentId,
          userId: user.id,
          reason,
        },
      });

      // Increment the report count on the comment
      const updatedComment = await tx.comment.update({
        where: { id: commentId },
        data: {
          reportCount: {
            increment: 1,
          },
        },
      });

      // If report count reaches threshold, hide the comment
      if (updatedComment.reportCount >= 2) {
        await tx.comment.update({
          where: { id: commentId },
          data: { isHidden: true },
        });

        // Create activity for auto-hidden comment
        await tx.activity.create({
          data: {
            userId: user.id,
            type: "COMMENT_DELETE",
            referenceId: commentId,
            productName: existingComment.supplement.name,
            description: `"${existingComment.supplement.name}" ürününe yapılan bir yorum, şikayet eşiğini aştığı için otomatik olarak gizlendi.`,
          },
        });
      }

      return newReport;
    });

    return NextResponse.json({
      message: "Yorum başarıyla şikayet edildi.",
      report,
    });
  } catch (error) {
    console.error("Error reporting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
