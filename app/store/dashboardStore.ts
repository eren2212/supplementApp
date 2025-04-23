"use client";

import { create } from "zustand";
import axios from "axios";

// Aylık satış verisi için tip tanımı
export interface MonthlySales {
  month: string;
  totalSales: number;
  orders: number;
}

// En çok satan ürün için tip tanımı
export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  stock: number;
  revenue: number;
}

// Kullanıcı istatistikleri için tip tanımı
export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  usersByRole: {
    role: string;
    count: number;
  }[];
}

// Sipariş istatistikleri için tip tanımı
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

// Ödeme yöntemleri dağılımı için tip tanımı
export interface PaymentMethodDistribution {
  method: string;
  count: number;
  percentage: number;
}

// Trafik kaynakları için tip tanımı
export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

// Satış trendi için tip tanımı
export interface SalesTrendData {
  date: string;
  sales: number;
}

// Kategori dağılımı için tip tanımı
export interface CategoryDistribution {
  category: string;
  value: number;
}

// Sipariş tipi tanımı
export interface RecentOrder {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: "completed" | "processing" | "pending" | "cancelled";
  products: number;
}

// Dashboard verisi için genel tip tanımı
export interface DashboardData {
  salesSummary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  monthlySales: MonthlySales[];
  topProducts: TopProduct[];
  userStats: UserStats;
  orderStats: OrderStats;
  paymentMethodDistribution: PaymentMethodDistribution[];
  trafficSources: TrafficSource[];
  recentActivity: {
    type: string;
    user: string;
    description: string;
    timestamp: string;
  }[];
  // Yeni eklenen alanlar
  salesTrend: SalesTrendData[];
  categoryDistribution: CategoryDistribution[];
  recentOrders: RecentOrder[];
}

// Zaman periyodu için tip
type TimePeriod = "7days" | "30days" | "90days" | "12months" | "all";

// Store tipi tanımı
interface DashboardStore {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  fetchDashboardData: () => Promise<void>;
}

// API istek yapılandırması
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Zustand store oluştur
export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  selectedPeriod: "30days", // Varsayılan periyod

  // Zaman periyodunu değiştir
  setPeriod: (period: TimePeriod) => {
    set({ selectedPeriod: period });
    // Periyot değiştiğinde verileri yeniden yükle
    get().fetchDashboardData();
  },

  // Dashboard verilerini getir
  fetchDashboardData: async () => {
    try {
      const { selectedPeriod } = get();
      set({ loading: true, error: null });

      // API'den veri al
      const response = await api.get(
        `/admin/dashboard?period=${selectedPeriod}`
      );

      // API'den dönen veride yeni alanlar yoksa, ekliyoruz
      const data = {
        ...response.data,
        // Eğer API'den gelmiyorsa, mock veri oluşturuyoruz
        salesTrend: response.data.salesTrend || createMockSalesTrend(),
        categoryDistribution:
          response.data.categoryDistribution ||
          createMockCategoryDistribution(),
        recentOrders: response.data.recentOrders || createMockRecentOrders(),
      };

      set({
        data,
        loading: false,
      });
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata:", error);
      set({
        error: "Dashboard verileri yüklenirken bir hata oluştu",
        loading: false,
      });
    }
  },
}));

// Mock veri oluşturma fonksiyonları
function createMockSalesTrend(): SalesTrendData[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(now.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      sales: Math.round(10000 + Math.random() * 15000),
    };
  });
}

function createMockCategoryDistribution(): CategoryDistribution[] {
  return [
    { category: "Vitaminler", value: 35 },
    { category: "Mineraller", value: 25 },
    { category: "Protein", value: 20 },
    { category: "Spor", value: 15 },
    { category: "Diğer", value: 5 },
  ];
}

function createMockRecentOrders(): RecentOrder[] {
  return [
    {
      id: "ORD-001",
      customerName: "Ahmet Yılmaz",
      date: new Date().toISOString(),
      amount: 1250,
      status: "completed",
      products: 3,
    },
    {
      id: "ORD-002",
      customerName: "Ayşe Kaya",
      date: new Date().toISOString(),
      amount: 850,
      status: "processing",
      products: 2,
    },
    {
      id: "ORD-003",
      customerName: "Mehmet Demir",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
      amount: 3200,
      status: "completed",
      products: 5,
    },
    {
      id: "ORD-004",
      customerName: "Zeynep Aydın",
      date: new Date(Date.now() - 86400000).toISOString(),
      amount: 950,
      status: "pending",
      products: 1,
    },
    {
      id: "ORD-005",
      customerName: "Can Özkan",
      date: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
      amount: 1650,
      status: "cancelled",
      products: 4,
    },
  ];
}
