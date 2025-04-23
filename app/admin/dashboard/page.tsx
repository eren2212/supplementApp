"use client";

import React, { useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/app/store/dashboardStore";

// Bileşenler - mutlak yollar kullanarak
import SummaryCards from "@/app/admin/dashboard/components/SummaryCards";
import SalesTrendChart from "@/app/admin/dashboard/components/SalesTrendChart";
import CategoryDistributionChart from "@/app/admin/dashboard/components/CategoryDistributionChart";
import RecentOrders from "@/app/admin/dashboard/components/RecentOrders";

// Zaman periyodu seçenekleri
const periodOptions = [
  { value: "7days", label: "Son 7 Gün" },
  { value: "30days", label: "Son 30 Gün" },
  { value: "90days", label: "Son 3 Ay" },
  { value: "12months", label: "Son 12 Ay" },
  { value: "all", label: "Tüm Zamanlar" },
];

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();

  // Zustand store'dan state ve metodları al
  const {
    data,
    loading,
    error,
    selectedPeriod,
    setPeriod,
    fetchDashboardData,
  } = useDashboardStore();

  // Component mount olduğunda verileri yükle
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Periyod değiştiğinde verileri yeniden yükle
  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(
      event.target.value as "7days" | "30days" | "90days" | "12months" | "all"
    );
  };

  // Yükleniyor durumu
  if (loading || !data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Hata Oluştu
        </Typography>
        <Typography variant="body1">{error}</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => fetchDashboardData()}
        >
          Yeniden Dene
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Başlık ve Geri Butonu */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push("/admin")}
            sx={{ mr: 2 }}
          >
            Geri
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
        </Box>

        {/* Periyot Seçici */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Dönem</InputLabel>
          <Select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            label="Dönem"
          >
            {periodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Dashboard içeriği */}
      <Grid container spacing={3}>
        {/* Özet Kartları */}
        <Grid item xs={12}>
          <SummaryCards period={selectedPeriod} loading={loading} />
        </Grid>

        {/* Satış Trendi */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Satış Trendi
              </Typography>
              <Box sx={{ height: 350, mt: 2, position: "relative" }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  data?.salesTrend && <SalesTrendChart data={data.salesTrend} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Kategori Dağılımı */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Kategori Dağılımı
              </Typography>
              <Box sx={{ height: 350, mt: 2, position: "relative" }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  data?.categoryDistribution && (
                    <CategoryDistributionChart
                      data={data.categoryDistribution}
                    />
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Son Siparişler */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Son Siparişler
              </Typography>
              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  data?.recentOrders && (
                    <RecentOrders orders={data.recentOrders} />
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
