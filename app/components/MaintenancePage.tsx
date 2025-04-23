"use client";

import Image from "next/image";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { useSettingsStore } from "@/app/store/settings-store";

const MaintenancePage = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center animate-spin">
            <SettingsIcon style={{ fontSize: 60, color: "#6366F1" }} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bakım Modu</h1>

        <p className="text-gray-600 mb-6">
          Şu anda sitemiz bakım modundadır. Daha iyi bir deneyim sunmak için
          çalışıyoruz. Lütfen daha sonra tekrar ziyaret edin.
        </p>

        <div className="mt-8 text-gray-500 text-sm">
          <p>{settings?.contactEmail}</p>
          <p>{settings?.contactPhone}</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
