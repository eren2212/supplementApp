import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

// Site ayarları için arayüz
interface SiteSettings {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  shippingFee: number;
  taxRate: number;
  maintenanceMode: boolean;
}

// Veritabanına kayıtlı değilse varsayılan ayarlar
const defaultSettings: SiteSettings = {
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
};

// GET handler - Ayarları getir
export async function GET(request: NextRequest) {
  try {
    // Yetki kontrolü
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 403 });
    }

    // Ayarları veritabanından al (ilk ayar kaydını)
    let settings = await prisma.siteSettings.findFirst();

    // Eğer ayarlar yoksa varsayılan ayarları döndür
    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    // Ayarları döndür
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Ayarlar alınırken hata oluştu:", error);
    return NextResponse.json(
      { message: "Ayarlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT handler - Ayarları güncelle
export async function PUT(request: NextRequest) {
  try {
    // Yetki kontrolü
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 403 });
    }

    // İstek gövdesini al
    const updatedSettings: SiteSettings = await request.json();

    // Mevcut ayarları kontrol et
    const existingSettings = await prisma.siteSettings.findFirst();

    // Ayarları güncelle veya oluştur
    let settings;

    if (existingSettings) {
      // Ayarları güncelle - MongoDB için ObjectId kullanıyoruz
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteName: updatedSettings.siteName,
          siteTitle: updatedSettings.siteTitle,
          siteDescription: updatedSettings.siteDescription,
          contactEmail: updatedSettings.contactEmail,
          contactPhone: updatedSettings.contactPhone,
          address: updatedSettings.address,
          logoUrl: updatedSettings.logoUrl,
          faviconUrl: updatedSettings.faviconUrl,
          facebookUrl: updatedSettings.facebookUrl,
          instagramUrl: updatedSettings.instagramUrl,
          twitterUrl: updatedSettings.twitterUrl,
          youtubeUrl: updatedSettings.youtubeUrl,
          linkedinUrl: updatedSettings.linkedinUrl,
          enableRegistration: updatedSettings.enableRegistration,
          enableGuestCheckout: updatedSettings.enableGuestCheckout,
          shippingFee: updatedSettings.shippingFee,
          taxRate: updatedSettings.taxRate,
          maintenanceMode: updatedSettings.maintenanceMode,
        },
      });
    } else {
      // Yeni ayarlar oluştur
      settings = await prisma.siteSettings.create({
        data: {
          siteName: updatedSettings.siteName,
          siteTitle: updatedSettings.siteTitle,
          siteDescription: updatedSettings.siteDescription,
          contactEmail: updatedSettings.contactEmail,
          contactPhone: updatedSettings.contactPhone,
          address: updatedSettings.address,
          logoUrl: updatedSettings.logoUrl,
          faviconUrl: updatedSettings.faviconUrl,
          facebookUrl: updatedSettings.facebookUrl,
          instagramUrl: updatedSettings.instagramUrl,
          twitterUrl: updatedSettings.twitterUrl,
          youtubeUrl: updatedSettings.youtubeUrl,
          linkedinUrl: updatedSettings.linkedinUrl,
          enableRegistration: updatedSettings.enableRegistration,
          enableGuestCheckout: updatedSettings.enableGuestCheckout,
          shippingFee: updatedSettings.shippingFee,
          taxRate: updatedSettings.taxRate,
          maintenanceMode: updatedSettings.maintenanceMode,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Ayarlar güncellenirken hata oluştu:", error);
    return NextResponse.json(
      { message: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
