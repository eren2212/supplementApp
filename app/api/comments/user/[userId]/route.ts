import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Get the count of comments for the user
    const count = await prisma.comment.count({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching user comment count:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
