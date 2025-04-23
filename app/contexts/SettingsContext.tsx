"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

// Context arayüzü
interface SettingsContextProps {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

// Context oluştur
const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined
);

// Props için arayüz
interface SettingsProviderProps {
  children: ReactNode;
}

// Context Provider bileşeni
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Ayarları getir
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
      setLoading(false);
    }
  };

  // Yükleme sırasında ayarları getir
  useEffect(() => {
    fetchSettings();
  }, []);

  // Değerleri sağla
  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook
export function useSettings() {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings, SettingsProvider içinde kullanılmalıdır");
  }

  return context;
}
