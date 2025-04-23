"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/app/store/settings-store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { fetchSettings } = useSettingsStore();

  // Uygulama ilk yüklendiğinde site ayarlarını getir
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
}
