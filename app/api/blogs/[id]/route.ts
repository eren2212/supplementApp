import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID parametresi gereklidir" },
        { status: 400 }
      );
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: id,
      },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog yazısı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("Blog post fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
