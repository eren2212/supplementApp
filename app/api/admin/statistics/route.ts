import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Yetkilendirme başarısız. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu sayfaya erişim yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Mock statistics data
    const statisticsData = {
      salesData: [
        { month: "Ocak", sales: 42500 },
        { month: "Şubat", sales: 38700 },
        { month: "Mart", sales: 54800 },
        { month: "Nisan", sales: 47300 },
        { month: "Mayıs", sales: 62100 },
        { month: "Haziran", sales: 59400 },
        { month: "Temmuz", sales: 68200 },
        { month: "Ağustos", sales: 72500 },
        { month: "Eylül", sales: 76800 },
        { month: "Ekim", sales: 82400 },
        { month: "Kasım", sales: 89700 },
        { month: "Aralık", sales: 94600 },
      ],
      categoryData: [
        { name: "Protein", value: 35 },
        { name: "Vitamin", value: 25 },
        { name: "Amino Asit", value: 20 },
        { name: "Kreatin", value: 15 },
        { name: "Diğer", value: 5 },
      ],
      weeklyVisitors: [
        { day: "Pzt", value: 842 },
        { day: "Sal", value: 756 },
        { day: "Çar", value: 912 },
        { day: "Per", value: 865 },
        { day: "Cum", value: 1042 },
        { day: "Cmt", value: 1253 },
        { day: "Paz", value: 1098 },
      ],
      conversionRate: {
        thisMonth: 3.8,
        lastMonth: 3.2,
        change: "+18.8%",
      },
      averageOrderValue: {
        thisMonth: 254.38,
        lastMonth: 238.92,
        change: "+6.5%",
      },
    };

    return NextResponse.json(statisticsData);
  } catch (error) {
    console.error("Statistics API Error:", error);
    return NextResponse.json(
      { error: "İstatistik verisi alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
