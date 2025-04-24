"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useSettingsStore } from "@/app/store/settings-store";
import { Button, Typography } from "@mui/material";

const MaintenancePage = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden m-4"
        >
          {/* Header with spinning icon */}
          <div className="flex flex-col items-center pt-12 pb-8 px-4">
            <div className="relative mb-8">
              <div className="absolute -z-10 inset-0 blur-xl bg-indigo-100 rounded-full opacity-70"></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <SettingsIcon style={{ fontSize: 48, color: "white" }} />
                </div>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center text-gray-800 mb-4"
            >
              Bakım Modundayız
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-center mb-8 px-6"
            >
              Sitemiz şu anda bakım modundadır. Daha iyi bir deneyim sunmak için
              çalışıyoruz. Lütfen daha sonra tekrar ziyaret edin.
            </motion.p>
          </div>

          {/* Admin Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 pt-0"
          >
            <Link href="/admin/login" className="block">
              <Button
                variant="contained"
                fullWidth
                startIcon={<AdminIcon />}
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  background:
                    "linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                  fontSize: "1rem",
                  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
                }}
              >
                Yönetici Girişi
              </Button>
            </Link>
          </motion.div>

          {/* Contact Info */}
          {(settings?.contactEmail || settings?.contactPhone) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-6 pb-8 text-center"
            >
              <div className="pt-4 border-t border-gray-100">
                <Typography
                  variant="caption"
                  className="text-gray-400 block mb-1 uppercase tracking-wide font-medium"
                >
                  İletişim Bilgileri
                </Typography>
                {settings?.contactEmail && (
                  <Typography variant="body2" className="text-gray-600">
                    {settings.contactEmail}
                  </Typography>
                )}
                {settings?.contactPhone && (
                  <Typography variant="body2" className="text-gray-600">
                    {settings.contactPhone}
                  </Typography>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
