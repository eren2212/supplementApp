import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// GET all comment reports
export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated and has admin role
    if (!session || !session.user.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu sayfaya erişim izniniz bulunmuyor." },
        { status: 403 }
      );
    }

    // Fetch all comment reports with comment and user details
    const reports = await prisma.commentReport.findMany({
      include: {
        comment: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching comment reports:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
