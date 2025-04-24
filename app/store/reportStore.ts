import { create } from "zustand";
import axios from "axios";

// CommentReport türü için arayüz
export interface CommentReport {
  id: string;
  commentId: string;
  userId: string;
  reason?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  comment: {
    id: string;
    content: string;
    userId: string;
    supplement?: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

// Report store'u için arayüz
interface ReportStore {
  reports: CommentReport[];
  loading: boolean;
  error: string | null;

  // Aksiyonlar
  fetchReports: () => Promise<void>;
  dismissReport: (reportId: string) => Promise<void>;
  acceptReport: (reportId: string) => Promise<void>;
}

// API yapılandırması
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Zustand store oluştur
export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  loading: false,
  error: null,

  // Tüm raporları getir
  fetchReports: async () => {
    try {
      set({ loading: true, error: null });

      const response = await api.get("/admin/reports");

      set({
        reports: response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Raporlar yüklenirken hata:", error);
      set({
        error: "Raporlar yüklenirken bir hata oluştu",
        loading: false,
      });
    }
  },

  // Raporu reddet (silme işlemi)
  dismissReport: async (reportId: string) => {
    try {
      set({ loading: true, error: null });

      await api.delete(`/comments/reports/${reportId}`);

      // Yerel durumdan raporu kaldır
      set((state) => ({
        reports: state.reports.filter((report) => report.id !== reportId),
        loading: false,
      }));
    } catch (error) {
      console.error("Rapor reddedilirken hata:", error);
      set({
        error: "Rapor reddedilirken bir hata oluştu",
        loading: false,
      });
    }
  },

  // Raporu kabul et (yorumu gizleme işlemi)
  acceptReport: async (reportId: string) => {
    try {
      set({ loading: true, error: null });

      // Önce rapor detaylarını al
      const report = get().reports.find((r) => r.id === reportId);

      if (!report) {
        throw new Error("Rapor bulunamadı");
      }

      // Yorumu gizle
      await api.patch(`/comments/${report.commentId}`, {
        isHidden: true,
      });

      // Raporu kaldır
      await api.delete(`/comments/reports/${reportId}`);

      // Yerel durumdan raporu kaldır
      set((state) => ({
        reports: state.reports.filter((report) => report.id !== reportId),
        loading: false,
      }));
    } catch (error) {
      console.error("Rapor kabul edilirken hata:", error);
      set({
        error: "Rapor kabul edilirken bir hata oluştu",
        loading: false,
      });
    }
  },
}));
