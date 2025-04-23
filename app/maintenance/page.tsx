"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Grow,
  useTheme,
} from "@mui/material";
import { Build, Warning, Engineering } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSettingsStore } from "../store/settingsStore";

export default function MaintenancePage() {
  const router = useRouter();
  const theme = useTheme();
  const [countdown, setCountdown] = useState(10);

  // Zustand store'dan state ve metodları al
  const { settings, loading, fetchSettings } = useSettingsStore();

  // Component mount olduğunda ayarları yükle
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Geri sayım efekti
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Siteye geri dön butonu
  const handleBackToSite = () => {
    router.push("/");
  };

  // Admin giriş sayfasına git
  const handleGoToLogin = () => {
    router.push("/login");
  };

  // Bakım modu kapalıysa ana sayfaya yönlendir
  useEffect(() => {
    if (!loading && !settings.maintenanceMode) {
      router.push("/");
    }
  }, [loading, settings.maintenanceMode, router]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        bgcolor: theme.palette.mode === "light" ? "#f8f9fa" : "#121212",
        backgroundImage: `radial-gradient(${
          theme.palette.mode === "light"
            ? "rgba(0,0,0,0.03)"
            : "rgba(255,255,255,0.05)"
        } 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <Container maxWidth="md">
        <Grow in={true} timeout={800}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, md: 5 },
              textAlign: "center",
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[10],
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
              }}
            />

            <Grid container spacing={3} direction="column" alignItems="center">
              <Grid item>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                    mt: 2,
                  }}
                >
                  <Engineering
                    color="primary"
                    sx={{
                      fontSize: { xs: 60, md: 100 },
                      animation: "wrench 2.5s ease infinite",
                      "@keyframes wrench": {
                        "0%": { transform: "rotate(-10deg)" },
                        "10%": { transform: "rotate(10deg)" },
                        "20%": { transform: "rotate(-10deg)" },
                        "30%": { transform: "rotate(10deg)" },
                        "40%": { transform: "rotate(-5deg)" },
                        "50%": { transform: "rotate(5deg)" },
                        "60%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(0deg)" },
                      },
                    }}
                  />
                </Box>
              </Grid>

              <Grid item>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.error.main})`,
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitBackgroundClip: "text",
                    textShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  Bakım Çalışması
                </Typography>
              </Grid>

              <Grid item>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Üzgünüz, sitemiz şu anda bakımdadır
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    maxWidth: 600,
                    mx: "auto",
                    color: theme.palette.text.secondary,
                    mb: 4,
                    px: 2,
                  }}
                >
                  Daha iyi bir deneyim sunmak için sitemizde bakım ve
                  güncellemeler yapıyoruz. Kısa süre içinde tekrar
                  hizmetinizdeyiz. Anlayışınız için teşekkür ederiz.
                </Typography>
              </Grid>

              <Grid item>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 4,
                    width: "100%",
                    maxWidth: 400,
                    mx: "auto",
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(0,0,0,0.03)"
                        : "rgba(255,255,255,0.03)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Tahmini tamamlanma süresi:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                    Yaklaşık 2 saat
                  </Typography>
                </Paper>
              </Grid>

              <Grid item sx={{ width: "100%" }}>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    px: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleBackToSite}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      px: 3,
                      minWidth: 180,
                    }}
                  >
                    {countdown > 0
                      ? `Siteyi kontrol et (${countdown})`
                      : "Siteyi kontrol et"}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGoToLogin}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      px: 3,
                      minWidth: 180,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: 2,
                    }}
                  >
                    Yönetici Girişi
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
}
