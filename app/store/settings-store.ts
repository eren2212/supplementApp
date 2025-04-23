import { create } from "zustand";
import axios from "axios";

interface SiteSettings {
  id?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  shippingFee: number;
  taxRate: number;
  maintenanceMode: boolean;
  updatedAt?: Date;
}

interface SettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  siteName: "Supplement App",
  siteTitle: "Supplement App",
  siteDescription: "Sağlıklı yaşam için en iyi supplementler",
  contactEmail: "info@supplementapp.com",
  contactPhone: "+90 555 123 4567",
  address: "İstanbul, Türkiye",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  enableRegistration: true,
  enableGuestCheckout: true,
  shippingFee: 20,
  taxRate: 18,
  maintenanceMode: false,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/settings");
      set({
        settings: response.data || defaultSettings,
        isLoading: false,
      });
    } catch (error) {
      console.error("Settings fetch error:", error);
      set({
        settings: defaultSettings,
        isLoading: false,
        error: "Ayarlar yüklenirken hata oluştu",
      });
    }
  },
}));
