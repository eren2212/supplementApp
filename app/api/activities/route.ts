// app/api/activities/route.ts
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, details, referenceId, productName } = await req.json();

  try {
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.email,
        type,
        description: details || "",
        referenceId: referenceId || "",
        productName: productName || "",
        date: new Date(),
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
