"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  Fade,
  Stack,
  Chip,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  PaymentOutlined,
  CheckCircleOutline,
  SecurityOutlined,
  EventNoteOutlined,
  ArrowBackIosNew,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import StripePaymentForm from "@/app/components/StripePaymentForm";

// Ödeme detayları için tip tanımı
interface PaymentDetails {
  id: string;
  amount: number;
  date: string;
  status: string;
}

// Stripe PaymentIntent tipi
interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  [key: string]: any;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<PaymentDetails | null>(null);
  const theme = useTheme();

  // URL'den amount parametresini al
  const amount = searchParams.get("amount")
    ? parseFloat(searchParams.get("amount") as string)
    : 0;

  const description = searchParams.get("description") || "Ödeme";
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    // Sayfaya amount parametresi ile gelinmediyse ana sayfaya yönlendir
    if (!amount || amount <= 0) {
      toast.error("Geçersiz ödeme tutarı");
      router.push("/");
      return;
    }

    // Kullanıcı giriş yapmadıysa ve gerekli parametreler eksikse ana sayfaya yönlendir
    if (status === "unauthenticated") {
      router.push("/login?redirect=/payment?amount=" + amount);
      return;
    }

    setLoading(false);
  }, [amount, router, status]);

  // Ödeme başarılı olduğunda
  const handlePaymentSuccess = (paymentIntent: PaymentIntent) => {
    setPaymentComplete(true);
    setOrderDetails({
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Kuruş -> TL dönüşümü
      date: new Date().toLocaleString("tr-TR"),
      status: "Ödendi",
    });

    // Başarılı ödeme durumunda checkout/success sayfasına yönlendir
    const successUrl = returnUrl.includes("/checkout/success")
      ? returnUrl
      : `/checkout/success?session_id=${paymentIntent.id}&order_id=${paymentIntent.id}`;

    // 2 saniye sonra yönlendir
    setTimeout(() => {
      router.push(successUrl);
    }, 2000);
  };

  // Ödeme hatası olduğunda
  const handlePaymentError = (error: Error) => {
    console.error("Ödeme hatası:", error);

    // Hata durumunda checkout/cancel sayfasına yönlendir
    setTimeout(() => {
      router.push("/checkout/cancel");
    }, 1000);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(145deg, ${alpha(
                  theme.palette.background.default,
                  0.9
                )}, ${alpha(theme.palette.primary.dark, 0.2)})`
              : `linear-gradient(145deg, ${alpha("#f7f9fc", 0.9)}, ${alpha(
                  theme.palette.primary.light,
                  0.2
                )})`,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography sx={{ mt: 3 }} variant="h6">
          Ödeme sayfası yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (paymentComplete) {
    return (
      <Box
        sx={{
          py: 6,
          mt: 10,
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(145deg, ${alpha(
                  theme.palette.background.default,
                  0.9
                )}, ${alpha(theme.palette.primary.dark, 0.2)})`
              : `linear-gradient(145deg, ${alpha("#f7f9fc", 0.9)}, ${alpha(
                  theme.palette.primary.light,
                  0.2
                )})`,
        }}
      >
        <Container maxWidth="md">
          <Fade in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(10px)",
              }}
            >
              <CheckCircleOutline
                color="success"
                sx={{
                  fontSize: 80,
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  mb: 2,
                }}
              />

              <Typography variant="h4" sx={{ mt: 2, fontWeight: 700 }}>
                Ödemeniz Başarıyla Tamamlandı!
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 3, color: "text.secondary" }}
              >
                Ödeme işleminiz başarıyla gerçekleştirildi. Teşekkür ederiz!
              </Typography>

              {orderDetails && (
                <Card
                  sx={{
                    mt: 4,
                    p: 2.5,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    borderRadius: "12px",
                    border: `1px solid ${alpha(
                      theme.palette.success.main,
                      0.2
                    )}`,
                    boxShadow: "none",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <ReceiptLongOutlined color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Sipariş No:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {orderDetails.id.substring(0, 8)}...
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <PaymentOutlined color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Tutar:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {orderDetails.amount.toFixed(2)} TL
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ mb: { xs: 1.5, sm: 0 } }}
                      >
                        <EventNoteOutlined color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Tarih:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {orderDetails.date}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CheckCircleOutline color="success" />
                        <Typography variant="body2" color="text.secondary">
                          Durum:
                        </Typography>
                        <Chip
                          label={orderDetails.status}
                          color="success"
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Card>
              )}

              <Typography
                variant="body2"
                sx={{ mt: 4, color: "text.secondary" }}
              >
                {returnUrl !== "/checkout/success"
                  ? "Yönlendiriliyorsunuz..."
                  : "Ana sayfaya yönlendiriliyorsunuz..."}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push(returnUrl)}
                sx={{
                  mt: 3,
                  minWidth: 200,
                  borderRadius: "10px",
                  py: 1.2,
                  boxShadow: `0 4px 14px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                }}
              >
                Şimdi Yönlendir
              </Button>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 6,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha(
                theme.palette.background.default,
                0.9
              )}, ${alpha(theme.palette.primary.dark, 0.2)})`
            : `linear-gradient(145deg, ${alpha("#f7f9fc", 0.9)}, ${alpha(
                theme.palette.primary.light,
                0.2
              )})`,
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Fade in={true} timeout={800}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight={700}
              textAlign="center"
              sx={{
                mb: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PaymentOutlined
                sx={{
                  mr: 1.5,
                  color: theme.palette.primary.main,
                  fontSize: 36,
                }}
              />
              Ödeme
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <StripePaymentForm
                    amount={amount}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    buttonText={`${amount.toFixed(2)} TL Öde`}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(8px)",
                    position: "sticky",
                    top: "20px",
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      <ReceiptLongOutlined sx={{ mr: 1 }} />
                      Sipariş Özeti
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        {description}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {amount.toFixed(2)} TL
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="h6">Toplam</Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          textFillColor: "transparent",
                        }}
                      >
                        {amount.toFixed(2)} TL
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ArrowBackIosNew />}
                      onClick={() => router.back()}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        py: 1.2,
                      }}
                    >
                      Siparişe Dön
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: "center",
                      mt: 3,
                    }}
                  >
                    <Chip
                      icon={<SecurityOutlined />}
                      label="Güvenli Ödeme"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: "8px" }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
