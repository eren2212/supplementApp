"use client";

import { create } from "zustand";
import axios from "axios";

interface MaintenanceState {
  isMaintenanceMode: boolean;
  loading: boolean;
  error: string | null;
  checkMaintenanceMode: () => Promise<void>;
}

// Bakım modu kontrolü için zustand store oluştur
export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  isMaintenanceMode: false,
  loading: true,
  error: null,

  // Bakım modunu kontrol et
  checkMaintenanceMode: async () => {
    try {
      set({ loading: true, error: null });

      // Bakım modu durumunu API'den al
      const response = await axios.get("/api/maintenance-check");

      set({
        isMaintenanceMode: response.data.maintenanceMode,
        loading: false,
      });

      return response.data.maintenanceMode;
    } catch (error) {
      console.error("Bakım modu kontrolü sırasında hata:", error);
      set({
        error: "Bakım modu durumu kontrol edilirken bir hata oluştu",
        loading: false,
      });
      return false;
    }
  },
}));
