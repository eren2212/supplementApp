"use client";

import { create } from "zustand";
import axios from "axios";

// Site ayarları için arayüz
export interface SiteSettings {
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

// Varsayılan ayarlar
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

// Store tipi tanımı
interface SettingsStore {
  settings: SiteSettings;
  loading: boolean;
  saving: boolean;
  success: boolean | null;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updatedSettings: SiteSettings) => Promise<void>;
  updateField: <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K]
  ) => void;
  resetSuccess: () => void;
  resetError: () => void;
}

// API istek yapılandırması
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Zustand store oluştur
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  saving: false,
  success: null,
  error: null,

  // Ayarları getir
  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });

      // Admin için yetkilendirilmiş endpoint'i kullan
      const response = await api.get("/admin/settings");

      set({
        settings: response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
      set({
        error: "Ayarlar yüklenirken bir hata oluştu",
        loading: false,
      });
    }
  },

  // Ayarları güncelle
  updateSettings: async (updatedSettings: SiteSettings) => {
    try {
      set({ saving: true, error: null, success: null });

      await api.put("/admin/settings", updatedSettings);

      set({
        settings: updatedSettings,
        saving: false,
        success: true,
      });
    } catch (error) {
      console.error("Ayarlar güncellenirken hata:", error);
      set({
        error: "Ayarlar güncellenirken bir hata oluştu",
        saving: false,
        success: false,
      });
    }
  },

  // Tek bir alanı güncelle (yerel state'te)
  updateField: <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K]
  ) => {
    set((state) => ({
      settings: {
        ...state.settings,
        [field]: value,
      },
    }));
  },

  // Başarı durumunu sıfırla
  resetSuccess: () => set({ success: null }),

  // Hata durumunu sıfırla
  resetError: () => set({ error: null }),
}));
