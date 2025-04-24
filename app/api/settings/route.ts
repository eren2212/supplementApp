import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { auth } from "@/auth";

// Varsayılan ayarlar
const defaultSettings = {
  siteName: "Takviye Yardımcısı",
  siteTitle: "Takviye Yardımcısı - Sağlıklı Yaşam İçin Doğru Seçim",
  siteDescription: "Takviye ve sağlıklı yaşam ürünlerini keşfedin",
  contactEmail: "info@takviyeyardimcisi.com",
  contactPhone: "+90 555 123 4567",
  address: "İstanbul, Türkiye",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  facebookUrl: "https://facebook.com/takviyeyardimcisi",
  instagramUrl: "https://instagram.com/takviyeyardimcisi",
  twitterUrl: "https://twitter.com/takviyeyardimcisi",
  youtubeUrl: "https://youtube.com/takviyeyardimcisi",
  linkedinUrl: "https://linkedin.com/company/takviyeyardimcisi",
  enableRegistration: true,
  enableGuestCheckout: true,
  shippingFee: 20,
  taxRate: 18,
  maintenanceMode: false,
  maintenanceMessage:
    "Sitemiz şu anda bakım modundadır. Lütfen daha sonra tekrar ziyaret edin.",
};

// GET /api/settings - Retrieve all site settings
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();

    return NextResponse.json(settings || defaultSettings, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Ayarlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update site settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const currentSettings = await prisma.siteSettings.findFirst();

    let settings;
    if (currentSettings) {
      settings = await prisma.siteSettings.update({
        where: { id: currentSettings.id },
        data: {
          ...body,
        },
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          ...defaultSettings,
          ...body,
        },
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings/maintenance - Toggle maintenance mode
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { maintenanceMode, maintenanceMessage } = body;

    if (typeof maintenanceMode !== "boolean") {
      return NextResponse.json(
        { error: "Geçersiz bakım modu değeri" },
        { status: 400 }
      );
    }

    const currentSettings = await prisma.siteSettings.findFirst();
    let settings;

    if (currentSettings) {
      settings = await prisma.siteSettings.update({
        where: { id: currentSettings.id },
        data: {
          maintenanceMode,
          ...(maintenanceMessage && { maintenanceMessage }),
        },
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          ...defaultSettings,
          maintenanceMode,
          ...(maintenanceMessage && { maintenanceMessage }),
        },
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Bakım modu güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
