import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

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

    // Get all supplements
    const supplements = await prisma.supplement.findMany({
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Total number of supplements
    const totalSupplements = supplements.length;

    // Total stock across all supplements
    const totalStock = supplements.reduce(
      (acc, supplement) => acc + supplement.stock,
      0
    );

    // Average price
    const averagePrice =
      supplements.length > 0
        ? supplements.reduce((acc, supplement) => acc + supplement.price, 0) /
          supplements.length
        : 0;

    // Supplements with low stock (less than 10)
    const lowStockSupplements = supplements.filter(
      (supplement) => supplement.stock < 10
    ).length;

    // Category distribution
    const categoryData = [];
    const categoryCounts: Record<string, number> = {};

    supplements.forEach((supplement) => {
      if (supplement.category) {
        const categoryKey = supplement.category.toString();
        categoryCounts[categoryKey] = (categoryCounts[categoryKey] || 0) + 1;
      }
    });

    for (const [category, count] of Object.entries(categoryCounts)) {
      categoryData.push({
        name: category,
        value: count,
        percentage: Math.round((count / totalSupplements) * 100),
      });
    }

    // Price range distribution
    const priceRanges = [
      { range: "0-50 ₺", count: 0 },
      { range: "51-100 ₺", count: 0 },
      { range: "101-200 ₺", count: 0 },
      { range: "201-500 ₺", count: 0 },
      { range: "500+ ₺", count: 0 },
    ];

    supplements.forEach((supplement) => {
      if (supplement.price <= 50) {
        priceRanges[0].count++;
      } else if (supplement.price <= 100) {
        priceRanges[1].count++;
      } else if (supplement.price <= 200) {
        priceRanges[2].count++;
      } else if (supplement.price <= 500) {
        priceRanges[3].count++;
      } else {
        priceRanges[4].count++;
      }
    });

    // Top 5 most expensive supplements
    const topPricedSupplements = [...supplements]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((supplement) => ({
        id: supplement.id,
        name: supplement.name,
        price: supplement.price,
        category: supplement.category,
      }));

    // Top 5 supplements with highest stock
    const topStockedSupplements = [...supplements]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
      .map((supplement) => ({
        id: supplement.id,
        name: supplement.name,
        stock: supplement.stock,
        category: supplement.category,
      }));

    // Top 5 supplements with most comments
    const topCommentedSupplements = [...supplements]
      .sort((a, b) => b._count.comments - a._count.comments)
      .slice(0, 5)
      .map((supplement) => ({
        id: supplement.id,
        name: supplement.name,
        commentCount: supplement._count.comments,
        category: supplement.category,
      }));

    // Get monthly sales data (mock data for this example)
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

    const currentMonth = new Date().getMonth();
    const salesData = monthNames.map((month, index) => {
      // Generate realistic-looking mock data
      const baseSales = 50 + Math.floor(Math.random() * 50);
      // Create a gradual increase over months with some variance
      const trend = 1 + (index / 12) * 0.5; // Up to 50% growth over the year
      const seasonal = Math.sin((index / 12) * Math.PI * 2) * 0.2 + 1; // ±20% seasonal variation

      return {
        month,
        sales: Math.round(baseSales * trend * seasonal),
        // Mark current month
        isCurrent: index === currentMonth,
      };
    });

    return NextResponse.json({
      summary: {
        totalSupplements,
        totalStock,
        averagePrice,
        lowStockSupplements,
      },
      categoryData,
      priceRanges,
      topPricedSupplements,
      topStockedSupplements,
      topCommentedSupplements,
      salesData,
    });
  } catch (error) {
    console.error("Error fetching supplement statistics:", error);
    return NextResponse.json(
      { error: "İstatistikler yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
