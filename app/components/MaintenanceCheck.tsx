"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/app/store/settings-store";
import { useRouter } from "next/navigation";
import MaintenancePage from "@/app/maintenance/page";

interface MaintenanceCheckProps {
  children: React.ReactNode;
  adminBypass?: boolean;
}

const MaintenanceCheck = ({
  children,
  adminBypass = true,
}: MaintenanceCheckProps) => {
  const { settings, fetchSettings, isLoading } = useSettingsStore();
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ayarları yükle
    fetchSettings().then(() => setInitialized(true));
  }, [fetchSettings]);

  // Yükleme sırasında yükleme göstergesi göster
  if (isLoading || !initialized) {
    return null; // veya bir loading spinner gösterilebilir
  }

  // Bakım modu aktif değilse normal içeriği göster
  if (!settings?.maintenanceMode) {
    return <>{children}</>;
  }

  // Bakım modu aktifse bakım sayfası göster
  return <MaintenancePage />;
};

export default MaintenanceCheck;
