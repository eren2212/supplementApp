import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

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
};

// GET handler - Ayarları getir (herkese açık)
export async function GET(request: NextRequest) {
  try {
    // Ayarları veritabanından al
    const settings = await prisma.siteSettings.findFirst();

    // Eğer ayarlar yoksa veya bakım modunda ve hassas bilgiler
    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    // Hassas ayarları filtrele (bakım modu gibi)
    const { maintenanceMode, ...publicSettings } = settings;

    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("Ayarlar alınırken hata oluştu:", error);
    return NextResponse.json(
      defaultSettings,
      { status: 200 } // Hata durumunda varsayılan ayarları dön ama hata olarak değil
    );
  }
}
