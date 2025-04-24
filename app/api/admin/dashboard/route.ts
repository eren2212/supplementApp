import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Demo veriler - gerçek uygulamada veritabanından gelir
// (Period parametresine göre değişen veri)
function getDemoData(period: string) {
  // Tarih formatı oluştur
  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  // Zaman aralığına göre çarpan - daha uzun aralıklar için daha yüksek değerler
  let multiplier = 1;
  let months = [];

  switch (period) {
    case "7days":
      multiplier = 0.2;
      // Son 7 gün için bir haftalık veri oluştur
      months = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
      });
      break;

    case "30days":
      multiplier = 1;
      // Son 30 gün için 30 günlük veri oluştur (haftalık gruplandırılmış)
      months = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 28 + i * 7);
        return `${date.getDate() - 6}-${date.getDate()} ${
          monthNames[date.getMonth()]
        }`;
      });
      break;

    case "90days":
      multiplier = 3;
      // Son 3 ay için aylık veri
      months = Array.from({ length: 3 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (2 - i));
        return monthNames[date.getMonth()];
      });
      break;

    case "12months":
      multiplier = 12;
      // Son 12 ay için aylık veri
      months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return monthNames[date.getMonth()];
      });
      break;

    case "all":
      multiplier = 24;
      // Tüm zamanlar için son 2 yıl
      months = Array.from({ length: 8 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 21 + i * 3);
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      });
      break;

    default:
      multiplier = 1;
      months = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 28 + i * 7);
        return `${date.getDate() - 6}-${date.getDate()} ${
          monthNames[date.getMonth()]
        }`;
      });
  }

  // Satış verileri oluştur
  const monthlySales = months.map((month, index) => {
    // Periyot tipine göre trend oluştur
    const trend = Math.sin((index / months.length) * Math.PI) * 0.3 + 0.85; // 0.55 ile 1.15 arasında dalgalanan trend
    const baseSales = 15000 * multiplier * trend;
    const randomVariation = Math.random() * 0.3 + 0.85; // ±%15 rastgele varyasyon

    return {
      month,
      totalSales: Math.round(baseSales * randomVariation),
      orders: Math.round((baseSales / 500) * randomVariation),
    };
  });

  // Popüler ürünler
  const topProducts = [
    {
      id: "prod1",
      name: "Multi Vitamin",
      category: "Vitamin",
      sales: Math.round(520 * multiplier * (Math.random() * 0.4 + 0.8)),
      stock: Math.round(150 * (Math.random() * 0.5 + 0.7)),
      revenue: Math.round(15600 * multiplier * (Math.random() * 0.3 + 0.85)),
    },
    {
      id: "prod2",
      name: "Omega 3 Balık Yağı",
      category: "Yağ Asitleri",
      sales: Math.round(480 * multiplier * (Math.random() * 0.4 + 0.8)),
      stock: Math.round(120 * (Math.random() * 0.5 + 0.7)),
      revenue: Math.round(14400 * multiplier * (Math.random() * 0.3 + 0.85)),
    },
    {
      id: "prod3",
      name: "Magnezyum Takviyesi",
      category: "Mineral",
      sales: Math.round(410 * multiplier * (Math.random() * 0.4 + 0.8)),
      stock: Math.round(80 * (Math.random() * 0.5 + 0.7)),
      revenue: Math.round(12300 * multiplier * (Math.random() * 0.3 + 0.85)),
    },
    {
      id: "prod4",
      name: "Kreatin Monohidrat",
      category: "Spor",
      sales: Math.round(380 * multiplier * (Math.random() * 0.4 + 0.8)),
      stock: Math.round(95 * (Math.random() * 0.5 + 0.7)),
      revenue: Math.round(11400 * multiplier * (Math.random() * 0.3 + 0.85)),
    },
    {
      id: "prod5",
      name: "Probiyotik Kompleks",
      category: "Sindirim",
      sales: Math.round(330 * multiplier * (Math.random() * 0.4 + 0.8)),
      stock: Math.round(110 * (Math.random() * 0.5 + 0.7)),
      revenue: Math.round(9900 * multiplier * (Math.random() * 0.3 + 0.85)),
    },
  ];

  // Toplam geliri hesapla
  const totalRevenue = monthlySales.reduce(
    (sum, item) => sum + item.totalSales,
    0
  );
  const totalOrders = monthlySales.reduce((sum, item) => sum + item.orders, 0);

  // Kullanıcı istatistikleri
  const totalUserBase = Math.round(2500 * Math.sqrt(multiplier));
  const userStats = {
    totalUsers: totalUserBase,
    newUsersToday: Math.round(15 * (Math.random() * 0.7 + 0.7)),
    activeUsers: Math.round(totalUserBase * 0.4 * (Math.random() * 0.3 + 0.8)),
    usersByRole: [
      {
        role: "CUSTOMER",
        count: Math.round(totalUserBase * 0.96),
      },
      {
        role: "DOCTOR",
        count: Math.round(totalUserBase * 0.03),
      },
      {
        role: "ADMIN",
        count: Math.round(totalUserBase * 0.01),
      },
    ],
  };

  // Sipariş istatistikleri
  const orderStats = {
    totalOrders: totalOrders,
    pendingOrders: Math.round(
      totalOrders * 0.05 * (Math.random() * 0.5 + 0.75)
    ),
    completedOrders: Math.round(
      totalOrders * 0.85 * (Math.random() * 0.1 + 0.95)
    ),
    cancelledOrders: Math.round(
      totalOrders * 0.1 * (Math.random() * 0.5 + 0.75)
    ),
    averageOrderValue: Math.round(totalRevenue / totalOrders),
  };

  // Ödeme yöntemleri dağılımı
  const paymentMethodDistribution = [
    {
      method: "Kredi Kartı",
      count: Math.round(totalOrders * 0.65 * (Math.random() * 0.1 + 0.95)),
      percentage: 65,
    },
    {
      method: "Havale/EFT",
      count: Math.round(totalOrders * 0.15 * (Math.random() * 0.2 + 0.9)),
      percentage: 15,
    },
    {
      method: "Kapıda Ödeme",
      count: Math.round(totalOrders * 0.15 * (Math.random() * 0.2 + 0.9)),
      percentage: 15,
    },
    {
      method: "Diğer",
      count: Math.round(totalOrders * 0.05 * (Math.random() * 0.3 + 0.85)),
      percentage: 5,
    },
  ];

  // Normalize percentages
  const totalPaymentCounts = paymentMethodDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );
  paymentMethodDistribution.forEach((item) => {
    item.percentage = Math.round((item.count / totalPaymentCounts) * 100);
  });

  // Trafik kaynakları
  const totalVisitors = Math.round(
    totalOrders * 20 * (Math.random() * 0.2 + 0.9)
  );
  const trafficSources = [
    {
      source: "Organik Arama",
      visitors: Math.round(totalVisitors * 0.4 * (Math.random() * 0.2 + 0.9)),
      percentage: 40,
    },
    {
      source: "Doğrudan Trafik",
      visitors: Math.round(totalVisitors * 0.25 * (Math.random() * 0.2 + 0.9)),
      percentage: 25,
    },
    {
      source: "Sosyal Medya",
      visitors: Math.round(totalVisitors * 0.2 * (Math.random() * 0.2 + 0.9)),
      percentage: 20,
    },
    {
      source: "Yönlendirmeler",
      visitors: Math.round(totalVisitors * 0.1 * (Math.random() * 0.2 + 0.9)),
      percentage: 10,
    },
    {
      source: "E-posta",
      visitors: Math.round(totalVisitors * 0.05 * (Math.random() * 0.2 + 0.9)),
      percentage: 5,
    },
  ];

  // Normalize percentages
  const totalTraffic = trafficSources.reduce(
    (sum, item) => sum + item.visitors,
    0
  );
  trafficSources.forEach((item) => {
    item.percentage = Math.round((item.visitors / totalTraffic) * 100);
  });

  // En son aktiviteler
  const activityTypes = [
    "Yeni sipariş",
    "Ürün inceleme",
    "Ürün iade",
    "Üye olma",
    "Stok güncelleme",
  ];
  const userNames = [
    "Mehmet Y.",
    "Ayşe K.",
    "Ahmet S.",
    "Zeynep D.",
    "Fatma T.",
    "Mustafa Ö.",
    "Ali R.",
  ];
  const products = [
    "Multi Vitamin",
    "Omega 3",
    "Magnezyum",
    "Kreatin",
    "Probiyotik",
    "D Vitamini",
    "Protein Tozu",
  ];

  const recentActivity = Array.from({ length: 10 }, (_, i) => {
    const activityType =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    // Son 24 saat içinde rastgele bir zaman
    const now = new Date();
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    now.setHours(now.getHours() - hours);
    now.setMinutes(now.getMinutes() - minutes);

    let description;
    switch (activityType) {
      case "Yeni sipariş":
        description = `${product} ürününü satın aldı`;
        break;
      case "Ürün inceleme":
        description = `${product} ürününe yorum yaptı`;
        break;
      case "Ürün iade":
        description = `${product} ürününü iade etti`;
        break;
      case "Üye olma":
        description = `Siteye yeni üye oldu`;
        break;
      case "Stok güncelleme":
        description = `${product} stok durumu güncellendi`;
        break;
      default:
        description = `${product} ile ilgili bir işlem yaptı`;
    }

    return {
      type: activityType,
      user: userName,
      description: description,
      timestamp: now.toISOString(),
    };
  });

  // Aktiviteleri tarihe göre sırala (en yeniden en eskiye)
  recentActivity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Tüm veriyi birleştir
  return {
    salesSummary: {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      conversionRate: Math.round((totalOrders / totalVisitors) * 100 * 10) / 10, // %x.x formatında
    },
    monthlySales,
    topProducts,
    userStats,
    orderStats,
    paymentMethodDistribution,
    trafficSources,
    recentActivity,
    // Yeni eklenen alanlar
    salesTrend: generateSalesTrend(period),
    categoryDistribution: generateCategoryDistribution(),
    recentOrders: generateRecentOrders(),
  };
}

// Satış trendi verisi oluştur
function generateSalesTrend(period: string) {
  const now = new Date();
  let days = 7;

  switch (period) {
    case "7days":
      days = 7;
      break;
    case "30days":
      days = 30;
      break;
    case "90days":
      days = 90;
      break;
    case "12months":
      days = 365;
      break;
    case "all":
      days = 365 * 2;
      break;
    default:
      days = 30;
  }

  // Günlük veri sayısı çok fazla olmasın
  const interval = Math.max(1, Math.floor(days / 15));
  const dataPoints = Math.min(15, days);

  return Array.from({ length: dataPoints }, (_, i) => {
    const date = new Date();
    date.setDate(now.getDate() - (days - i * interval));

    // Trend oluştur - yavaş yükselen bir trend
    const baseSales = 15000;
    const trendFactor = 1 + (i / dataPoints) * 0.3; // %30'a kadar artış
    const randomFactor = 0.85 + Math.random() * 0.3; // ±%15 rastgele değişim

    return {
      date: date.toISOString().split("T")[0],
      sales: Math.round(baseSales * trendFactor * randomFactor),
    };
  });
}

// Kategori dağılımı verisi oluştur
function generateCategoryDistribution() {
  return [
    { category: "Vitaminler", value: 35 },
    { category: "Mineraller", value: 25 },
    { category: "Protein", value: 20 },
    { category: "Spor", value: 12 },
    { category: "Diğer", value: 8 },
  ];
}

// Son siparişler verisi oluştur
function generateRecentOrders() {
  const statuses = ["completed", "processing", "pending", "cancelled"];
  const customers = [
    "Ahmet Yılmaz",
    "Ayşe Kaya",
    "Mehmet Demir",
    "Zeynep Aydın",
    "Can Özkan",
    "Selin Çelik",
    "Murat Yıldız",
    "Deniz Şahin",
  ];

  return Array.from({ length: 10 }, (_, i) => {
    // Son 7 gün içinde rastgele tarih
    const days = Math.floor(Math.random() * 7);
    const hours = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(date.getHours() - hours);

    // Rastgele miktar (500-5000 TL arası)
    const amount = Math.round((500 + Math.random() * 4500) * 100) / 100;

    // Rastgele ürün sayısı (1-5 arası)
    const products = 1 + Math.floor(Math.random() * 5);

    return {
      id: `ORD-${String(i + 1).padStart(3, "0")}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      date: date.toISOString(),
      amount,
      status: statuses[Math.floor(Math.random() * statuses.length)] as
        | "completed"
        | "processing"
        | "pending"
        | "cancelled",
      products,
    };
  });
}

// GET handler - Dashboard verilerini getir
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

    // Mock dashboard data
    const dashboardData = {
      totalUsers: 1246,
      totalOrders: 587,
      totalRevenue: 148924.5,
      pendingOrders: 23,
      recentOrders: [
        {
          id: "ORD-5142",
          customer: "Ali Yılmaz",
          amount: "₺1,245.00",
          status: "Tamamlandı",
          date: new Date(),
        },
        {
          id: "ORD-5141",
          customer: "Zeynep Demir",
          amount: "₺845.50",
          status: "İşlemde",
          date: new Date(),
        },
        {
          id: "ORD-5140",
          customer: "Ahmet Kaya",
          amount: "₺1,845.75",
          status: "Tamamlandı",
          date: new Date(),
        },
        {
          id: "ORD-5139",
          customer: "Ayşe Şahin",
          amount: "₺645.30",
          status: "Beklemede",
          date: new Date(),
        },
        {
          id: "ORD-5138",
          customer: "Mehmet Demir",
          amount: "₺2,125.00",
          status: "Tamamlandı",
          date: new Date(),
        },
      ],
      topProducts: [
        {
          id: "PRD-001",
          name: "Premium Protein Tozu",
          price: "₺1,299.90",
          stock: 48,
          category: "Protein",
        },
        {
          id: "PRD-002",
          name: "B12 Vitamini",
          price: "₺459.90",
          stock: 132,
          category: "Vitamin",
        },
        {
          id: "PRD-003",
          name: "Kreatin Monohidrat",
          price: "₺799.90",
          stock: 72,
          category: "Kreatin",
        },
        {
          id: "PRD-004",
          name: "BCAA Amino Asit",
          price: "₺689.90",
          stock: 94,
          category: "Amino Asit",
        },
        {
          id: "PRD-005",
          name: "Multivitamin",
          price: "₺529.90",
          stock: 156,
          category: "Vitamin",
        },
      ],
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
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Dashboard verisi alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
