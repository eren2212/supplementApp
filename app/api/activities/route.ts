import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";
import { ActivityType } from "@/types/activitie";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, details, referenceId, productName } = await req.json();

  try {
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id || null, // EMAIL YERINE ID KULLAN
        type: type as ActivityType,
        description: details || "",
        referenceId: referenceId || null,
        productName: productName || null,
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    // ID KULLAN
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Son 5 günün tarihini hesapla
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        // 5 günden yeni aktiviteleri getir
        date: {
          gte: fiveDaysAgo,
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
