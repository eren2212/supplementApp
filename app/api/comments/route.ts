import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET all comments
export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        supplement: {
          select: {
            name: true,
          },
        },
        reports: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
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
