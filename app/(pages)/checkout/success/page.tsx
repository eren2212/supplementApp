"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/app/store/cartStore";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  CheckCircleOutline,
  ShoppingBag,
  Receipt,
  ArrowForward,
} from "@mui/icons-material";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // URL'den ödeme bilgilerini al
  const paymentIntentId = searchParams.get("payment_intent");
  const paymentStatus = searchParams.get("status");

  // LocalStorage'dan teslimat bilgilerini al
  useEffect(() => {
    const createOrder = async () => {
      try {
        // Sepet boşsa ana sayfaya yönlendir
        if (items.length === 0) {
          router.push("/");
          return;
        }

        // Oturum yoksa giriş sayfasına yönlendir
        if (!session) {
          router.push("/login");
          return;
        }

        // URL'den sipariş ID'sini al (checkout API'den dönüyor)
        const orderIdFromURL = searchParams.get("order_id");
        const sessionId = searchParams.get("session_id");

        // Ödeme başarılı değilse sepet sayfasına yönlendir
        if (paymentStatus !== "success" && !orderIdFromURL) {
          toast.error("Ödeme işlemi başarısız oldu");
          setError("Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.");
          router.push("/cart");
          return;
        }

        // LocalStorage'dan teslimat bilgilerini al
        const shippingInfoStr = localStorage.getItem("shippingInfo");
        if (!shippingInfoStr) {
          toast.error("Teslimat bilgileri bulunamadı");
          setError("Teslimat bilgileri bulunamadı. Lütfen tekrar deneyiniz.");
          router.push("/cart");
          return;
        }

        const shippingInfo = JSON.parse(shippingInfoStr);

        try {
          // Eğer sipariş zaten checkout API'de oluşturulduysa, sadece teslimat bilgilerini güncelle
          if (orderIdFromURL && sessionId) {
            // Checkout API'den ödeme durumunu doğrula
            const { data: sessionData } = await axios.get(
              `/api/checkout?session_id=${sessionId}&order_id=${orderIdFromURL}`
            );

            if (sessionData.success) {
              // Sipariş zaten oluşturuldu, sadece teslimat bilgilerini güncelle
              await axios.patch(`/api/orders/${orderIdFromURL}`, {
                shippingAddress: shippingInfo,
              });

              // Sipariş numarasını al
              setOrderNumber(sessionData.order.orderNumber);
              setOrderCreated(true);

              // Sepeti temizle
              clearCart();

              // localStorage'dan teslimat bilgilerini temizle
              localStorage.removeItem("shippingInfo");

              // Başarılı mesaj göster
              toast.success("Siparişiniz başarıyla oluşturuldu!");

              // 3 saniye sonra siparişler sayfasına yönlendir
              setTimeout(() => {
                router.push("/profile/orders");
              }, 3000);

              return;
            }
          }

          // Eğer yukarıdaki yöntem çalışmadıysa, yeni sipariş oluştur
          const { data } = await axios.post("/api/orders", {
            items,
            totalAmount: getTotalPrice(),
            shippingAddress: shippingInfo,
            paymentIntentId,
            paymentStatus: "completed",
          });

          // Sipariş numarasını kaydet
          setOrderNumber(data.orderNumber);
          setOrderCreated(true);

          // Sepeti temizle
          clearCart();

          // localStorage'dan teslimat bilgilerini temizle
          localStorage.removeItem("shippingInfo");

          // Başarılı mesajı göster
          toast.success("Siparişiniz başarıyla oluşturuldu!");

          // 3 saniye sonra siparişler sayfasına yönlendir
          setTimeout(() => {
            router.push("/profile/orders");
          }, 3000);
        } catch (apiError: any) {
          console.error("API hatası:", apiError);
          throw apiError;
        }
      } catch (error: any) {
        console.error("Sipariş oluşturulurken hata:", error);

        // Hata mesajını belirle
        const errorMessage =
          error.response?.data?.error ||
          "Sipariş oluşturulurken bir hata oluştu. Lütfen müşteri hizmetleriyle iletişime geçin.";

        setError(errorMessage);
        toast.error(errorMessage);

        // Hata durumunda 3 saniye sonra profil/orders sayfasına yönlendir
        // Kullanıcı ödemesi yapıldığı için yine de siparişlere bakabilir
        setTimeout(() => {
          router.push("/profile/orders");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (paymentIntentId && items.length > 0) {
      // Kullanıcının oturumu kontrol ediliyor, maksimum 5 saniye bekleyelim
      const checkSessionTimeout = setTimeout(() => {
        if (!session) {
          setLoading(false);
          setError(
            "Oturum bilgileriniz doğrulanamadı. Lütfen giriş yapın ve tekrar deneyin."
          );
          router.push("/login");
        }
      }, 5000);

      if (session) {
        clearTimeout(checkSessionTimeout);
        createOrder();
      }
    } else {
      // OrderId URL'de varsa ve session var ise orderı kontrol et
      const orderIdFromURL = searchParams.get("order_id");
      const sessionId = searchParams.get("session_id");

      if (orderIdFromURL && sessionId && session) {
        createOrder();
      } else {
        setLoading(false);
        if (!paymentIntentId && !orderIdFromURL) {
          setError("Ödeme bilgileri bulunamadı. Lütfen tekrar deneyiniz.");
        }
        if (items.length === 0) {
          setError("Sepetiniz boş. Lütfen ürün ekleyip tekrar deneyiniz.");
        }
      }
    }
  }, [
    session,
    items,
    paymentIntentId,
    paymentStatus,
    router,
    getTotalPrice,
    clearCart,
    searchParams,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Siparişiniz oluşturuluyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 10, mt: 5 }}>
      <Fade in={true} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          {orderCreated ? (
            <Box>
              <CheckCircleOutline
                sx={{
                  fontSize: 80,
                  color: theme.palette.success.main,
                  mb: 2,
                }}
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Siparişiniz Başarıyla Oluşturuldu!
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
              >
                Ödemeniz başarıyla alındı. Siparişiniz hazırlanıyor. Sipariş
                detaylarınıza aşağıdaki bağlantıdan ulaşabilirsiniz.
              </Typography>

              <Box
                sx={{
                  p: 3,
                  mb: 4,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: "10px",
                  display: "inline-block",
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Sipariş Numaranız:{" "}
                  <Typography
                    component="span"
                    variant="body1"
                    fontWeight={700}
                    color="primary"
                  >
                    {orderNumber}
                  </Typography>
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ShoppingBag />}
                  onClick={() => router.push("/")}
                  size="large"
                  sx={{
                    borderRadius: "10px",
                    py: 1.5,
                    px: 3,
                    textTransform: "none",
                  }}
                >
                  Alışverişe Devam Et
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Receipt />}
                  onClick={() => router.push("/profile/orders")}
                  size="large"
                  sx={{
                    borderRadius: "10px",
                    py: 1.5,
                    px: 3,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  }}
                >
                  Siparişlerime Git
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Typography variant="h4" color="error" gutterBottom>
                Bir Sorun Oluştu
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {error ||
                  "Siparişiniz oluşturulurken bir sorun oluştu. Lütfen tekrar deneyiniz."}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ödemeniz başarıyla alınmış olabilir. Profil sayfanızdan
                siparişlerinizi kontrol edebilirsiniz.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="outlined"
                  onClick={() => router.push("/cart")}
                  sx={{ borderRadius: "10px", py: 1.5, px: 3 }}
                >
                  Sepete Dön
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push("/profile/orders")}
                  sx={{ borderRadius: "10px", py: 1.5, px: 3 }}
                >
                  Siparişlerimi Kontrol Et
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      </Fade>
    </Container>
  );
}
