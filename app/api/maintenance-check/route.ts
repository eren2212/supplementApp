import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request: NextRequest) {
  try {
    // Get settings from the database
    const settings = await prisma.siteSettings.findFirst();
    const isMaintenanceMode = settings?.maintenanceMode || false;

    // Create the response
    const response = NextResponse.json(
      { maintenanceMode: isMaintenanceMode },
      { status: 200 }
    );

    // Set a cookie for middleware to use
    response.cookies.set({
      name: "maintenance_mode",
      value: isMaintenanceMode.toString(),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
    return NextResponse.json(
      {
        error: "Error checking maintenance mode status",
        maintenanceMode: false,
      },
      { status: 500 }
    );
  }
}
