"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Stack,
  IconButton,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InventoryIcon from "@mui/icons-material/Inventory";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material/styles";
import { useDashboardStore } from "@/app/store/dashboardStore";

type SummaryCardProps = {
  title: string;
  value: string;
  change: number;
  period: string;
  icon: "sales" | "customers" | "revenue" | "products";
  loading?: boolean;
};

const SummaryCard = ({
  title,
  value,
  change,
  period,
  icon,
  loading = false,
}: SummaryCardProps) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (icon) {
      case "sales":
        return <ShoppingBagIcon sx={{ fontSize: 40, color: "primary.main" }} />;
      case "customers":
        return <PeopleIcon sx={{ fontSize: 40, color: "info.main" }} />;
      case "revenue":
        return (
          <AccountBalanceWalletIcon
            sx={{ fontSize: 40, color: "success.main" }}
          />
        );
      case "products":
        return <InventoryIcon sx={{ fontSize: 40, color: "warning.main" }} />;
      default:
        return <ShoppingBagIcon sx={{ fontSize: 40, color: "primary.main" }} />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%", boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ padding: 3 }}>
          <Box
            sx={{
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Yükleniyor...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", boxShadow: 2, borderRadius: 2 }}>
      <CardContent sx={{ padding: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="medium" gutterBottom>
              {value}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: change >= 0 ? "success.main" : "error.main",
                }}
              >
                {change >= 0 ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                  ml={0.5}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {period} göre
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              backgroundColor:
                theme.palette.mode === "dark" ? "background.paper" : "grey.50",
              p: 1.5,
              borderRadius: 2,
            }}
          >
            {getIcon()}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

type SummaryCardsProps = {
  period: string;
  loading?: boolean;
};

const SummaryCards = ({ period, loading = false }: SummaryCardsProps) => {
  const { data } = useDashboardStore();

  // Dashboard verisi yoksa default değerleri göster
  if (!data) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard
              title="Yükleniyor..."
              value="--"
              change={0}
              period=""
              icon="sales"
              loading={true}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Veri kartları için bilgileri oluştur
  const getComparisonText = () => {
    switch (period) {
      case "7days":
        return "geçen haftaya";
      case "30days":
        return "geçen aya";
      case "90days":
        return "geçen çeyreğe";
      case "12months":
        return "geçen yıla";
      default:
        return "geçen döneme";
    }
  };

  const comparisonText = getComparisonText();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const summaryData = [
    {
      title: "Toplam Sipariş",
      value: data.salesSummary.totalOrders.toLocaleString("tr-TR"),
      change: 12.5, // API'den gelmesi gerekir
      period: comparisonText,
      icon: "sales" as const,
    },
    {
      title: "Müşteri Sayısı",
      value: data.userStats.totalUsers.toLocaleString("tr-TR"),
      change: 5.8, // API'den gelmesi gerekir
      period: comparisonText,
      icon: "customers" as const,
    },
    {
      title: "Toplam Gelir",
      value: formatMoney(data.salesSummary.totalRevenue),
      change: data.salesSummary.totalRevenue > 0 ? 8.4 : -2.3, // API'den gelmesi gerekir
      period: comparisonText,
      icon: "revenue" as const,
    },
    {
      title: "Ortalama Sipariş Değeri",
      value: formatMoney(data.salesSummary.averageOrderValue),
      change: 4.2, // API'den gelmesi gerekir
      period: comparisonText,
      icon: "products" as const,
    },
  ];

  return (
    <Grid container spacing={3}>
      {summaryData.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <SummaryCard
            title={card.title}
            value={card.value}
            change={card.change}
            period={card.period}
            icon={card.icon}
            loading={loading}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
