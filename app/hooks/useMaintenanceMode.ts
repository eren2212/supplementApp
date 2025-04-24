"use client";

import { useEffect, useState } from "react";
import { useMaintenanceStore } from "@/app/store/maintenanceStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Hook to handle maintenance mode
export const useMaintenanceMode = () => {
  const { isMaintenanceMode, loading, checkMaintenanceMode } =
    useMaintenanceStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        await checkMaintenanceMode();
        setInitialized(true);
      }
    };

    init();
  }, [checkMaintenanceMode, initialized]);

  useEffect(() => {
    // If maintenance mode is active and user is not admin
    if (initialized && isMaintenanceMode && status !== "loading") {
      const isAdmin = session?.user?.role === "ADMIN";

      if (!isAdmin) {
        router.push("/maintenance");
      }
    }
  }, [isMaintenanceMode, session, status, router, initialized]);

  return {
    isMaintenanceMode,
    isLoading: loading || status === "loading" || !initialized,
    isAdmin: session?.user?.role === "ADMIN",
  };
};
