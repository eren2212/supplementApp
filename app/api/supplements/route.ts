import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET() {
  try {
    const supplements = await prisma.supplement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const validSupplements = supplements.filter(
      (supplement) => supplement.category !== null
    );

    const supplementsWithFixedImages = validSupplements.map((supplement) => {
      const imageName = supplement.imageUrl.split("/").pop();

      return {
        ...supplement,
        imageUrl: imageName || supplement.imageUrl,
      };
    });

    return NextResponse.json(supplementsWithFixedImages);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
