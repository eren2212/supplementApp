"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  CheckCircleOutlined,
  ShoppingBagOutlined,
  HomeOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Sepeti temizle
    clearCart();

    // Sipariş durumunu kontrol et
    const verifyPayment = async () => {
      try {
        if (!sessionId && !orderId) {
          router.push("/");
          return;
        }

        // API'dan sipariş durumunu kontrol et
        const response = await fetch(
          `/api/checkout?session_id=${sessionId || ""}&order_id=${
            orderId || ""
          }`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sipariş bilgileri alınamadı");
        }

        setOrder(data.order);
      } catch (error: any) {
        console.error("Ödeme doğrulama hatası:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, router, clearCart]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h5" gutterBottom>
            Ödeme Durumu Kontrol Ediliyor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lütfen bekleyin, işleminiz tamamlanıyor...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Typography variant="h5" color="error" gutterBottom>
            Bir sorun oluştu
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {error}
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeOutlined />}
          >
            Ana Sayfaya Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <CheckCircleOutlined
            sx={{ fontSize: 80, color: "success.main", mb: 3 }}
          />

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Sipariş Başarıyla Tamamlandı!
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "500px" }}
          >
            Ödemeniz başarıyla alındı. Siparişiniz kısa süre içinde hazırlanacak
            ve size ulaştırılacak.
          </Typography>

          {order && (
            <Box
              sx={{
                width: "100%",
                mb: 4,
                p: 3,
                backgroundColor: "rgba(0, 150, 136, 0.05)",
                borderRadius: "12px",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Sipariş Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" color="text.secondary">
                  Sipariş Numarası:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  #{order.id.slice(-8).toUpperCase()}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" color="text.secondary">
                  Tutar:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.totalAmount.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" color="text.secondary">
                  Ödeme Durumu:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color={
                    order.paymentStatus === "PAID"
                      ? "success.main"
                      : "warning.main"
                  }
                >
                  {order.paymentStatus === "PAID" ? "Ödendi" : "Beklemede"}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" color="text.secondary">
                  Sipariş Durumu:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.status === "PROCESSING"
                    ? "Hazırlanıyor"
                    : order.status === "PENDING"
                    ? "Beklemede"
                    : order.status === "SHIPPED"
                    ? "Kargoya Verildi"
                    : order.status === "DELIVERED"
                    ? "Teslim Edildi"
                    : "Beklemede"}
                </Typography>
              </Box>
            </Box>
          )}

          <Box display="flex" gap={2}>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              startIcon={<HomeOutlined />}
              sx={{ borderRadius: "8px", py: 1.5, px: 3 }}
            >
              Ana Sayfaya Dön
            </Button>

            <Button
              component={Link}
              href="/profile/orders"
              variant="contained"
              startIcon={<ShoppingBagOutlined />}
              sx={{ borderRadius: "8px", py: 1.5, px: 3 }}
            >
              Siparişlerimi Görüntüle
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
