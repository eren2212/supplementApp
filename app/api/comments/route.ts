import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET all comments
export async function GET(request: Request) {
  try {
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.comment.count();

    // Fetch comments with pagination
    const comments = await prisma.comment.findMany({
      // skip,
      // take: limit,
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
        reports: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the comments to ensure reportCount is accurate
    const transformedComments = comments.map((comment) => {
      // For admin panel, explicitly calculate reportCount as the number of reports
      // This ensures it's always accurate and up-to-date
      const calculatedReportCount = comment.reports?.length || 0;

      // Use the calculated report count or the stored count, whichever is higher
      // This ensures we don't miss any reports
      const finalReportCount = Math.max(
        calculatedReportCount,
        comment.reportCount || 0
      );

      return {
        ...comment,
        reportCount: finalReportCount,
        // Don't send the full reports array to the client to reduce payload size
        reports: undefined,
      };
    });

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Yorum yapmak için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { supplementId, content, rating } = body;

    if (!supplementId || !content || rating === undefined) {
      return NextResponse.json(
        { error: "Tüm alanlar doldurulmalıdır." },
        { status: 400 }
      );
    }

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

    // Check if supplement exists
    const supplement = await prisma.supplement.findUnique({
      where: {
        id: supplementId,
      },
    });

    if (!supplement) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    // Create the comment
    const newComment = await prisma.comment.create({
      data: {
        content,
        rating,
        userId: user.id,
        supplementId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Create an activity record for this comment
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "COMMENT_ADD",
        referenceId: newComment.id,
        productName: supplement.name,
        description: `${user.name} tarafından "${supplement.name}" ürününe yorum yapıldı.`,
      },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
