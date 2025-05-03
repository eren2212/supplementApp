import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { Advice, Doctor } from "./doctorAdviceStore";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: string;
}

interface AdminState {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;

  // Admin settings
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Dashboard data
  dashboardData: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    recentOrders: any[];
    topProducts: any[];
    isLoading: boolean;
  };
  fetchDashboardData: () => Promise<void>;

  // New fields for doctor advice
  advices: Advice[];
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  adviceSearchQuery: string;
  adviceCategoryFilter: string;
  adviceStatusFilter: string;
  adviceSortBy: string;
  adviceSortDirection: "asc" | "desc";

  fetchAdminAdvices: () => Promise<void>;
  deleteAdminAdvice: (adviceId: string) => Promise<void>;
  setAdviceSearchQuery: (query: string) => void;
  setAdviceCategoryFilter: (category: string) => void;
  setAdviceStatusFilter: (status: string) => void;
  setAdviceSortBy: (field: string, direction: "asc" | "desc") => void;
  resetAdviceFilters: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50 notifications
          unreadCount: state.unreadCount + 1,
        }));
      },
      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          );

          const unreadCount = updatedNotifications.filter(
            (n) => !n.read
          ).length;

          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      removeNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(
            (notification) => notification.id !== id
          );

          const unreadCount = updatedNotifications.filter(
            (n) => !n.read
          ).length;

          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      // Admin settings
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Dashboard data
      dashboardData: {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        recentOrders: [],
        topProducts: [],
        isLoading: false,
      },
      fetchDashboardData: async () => {
        set((state) => ({
          dashboardData: {
            ...state.dashboardData,
            isLoading: true,
          },
        }));

        try {
          const response = await axios.get("/api/admin/dashboard");

          if (response.data) {
            set({
              dashboardData: {
                ...response.data,
                isLoading: false,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          // Add error notification
          get().addNotification({
            message: "Dashboard verilerini yüklerken hata oluştu",
            type: "error",
            read: false,
          });
        } finally {
          set((state) => ({
            dashboardData: {
              ...state.dashboardData,
              isLoading: false,
            },
          }));
        }
      },

      // New fields for doctor advice
      advices: [],
      doctors: [],
      loading: false,
      error: null,
      adviceSearchQuery: "",
      adviceCategoryFilter: "",
      adviceStatusFilter: "",
      adviceSortBy: "date",
      adviceSortDirection: "desc",

      fetchAdminAdvices: async () => {
        set({ loading: true, error: null });
        try {
          const advicesRes = await axios.get("/api/admin/advices");
          set({
            advices: advicesRes.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error ||
              "Tavsiyeler yüklenirken bir hata oluştu",
            loading: false,
          });
          console.error("Tavsiyeleri getirme hatası:", error);
        }
      },

      deleteAdminAdvice: async (adviceId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(`/api/admin/advices/${adviceId}`);
          // Başarılı silme sonrası state'i güncelle
          set((state) => ({
            advices: state.advices.filter((advice) => advice.id !== adviceId),
            loading: false,
          }));

          // Bildirim ekle
          get().addNotification({
            message: "Tavsiye başarıyla silindi",
            type: "success",
            read: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.error ||
              "Tavsiye silinirken bir hata oluştu",
            loading: false,
          });
          console.error("Tavsiye silme hatası:", error);

          // Hata bildirimi ekle
          get().addNotification({
            message:
              error.response?.data?.error ||
              "Tavsiye silinirken bir hata oluştu",
            type: "error",
            read: false,
          });
        }
      },

      setAdviceSearchQuery: (query) => set({ adviceSearchQuery: query }),

      setAdviceCategoryFilter: (category) =>
        set({ adviceCategoryFilter: category }),

      setAdviceStatusFilter: (status) => set({ adviceStatusFilter: status }),

      setAdviceSortBy: (field, direction) =>
        set({
          adviceSortBy: field,
          adviceSortDirection: direction,
        }),

      resetAdviceFilters: () =>
        set({
          adviceSearchQuery: "",
          adviceCategoryFilter: "",
          adviceStatusFilter: "",
          adviceSortBy: "date",
          adviceSortDirection: "desc",
        }),
    }),
    {
      name: "admin-store",
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
