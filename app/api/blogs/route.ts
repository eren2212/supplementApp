import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET() {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error("Blog posts fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
