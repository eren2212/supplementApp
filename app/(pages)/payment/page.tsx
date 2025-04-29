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
} from "@mui/material";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { PaymentOutlined, CheckCircleOutline } from "@mui/icons-material";
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

    // 3 saniye sonra yönlendir
    setTimeout(() => {
      router.push(returnUrl);
    }, 3000);
  };

  // Ödeme hatası olduğunda
  const handlePaymentError = (error: Error) => {
    console.error("Ödeme hatası:", error);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Sayfa yükleniyor...</Typography>
      </Container>
    );
  }

  if (paymentComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CheckCircleOutline color="success" sx={{ fontSize: 60 }} />

          <Typography variant="h4" sx={{ mt: 2, fontWeight: 700 }}>
            Ödemeniz Başarıyla Tamamlandı!
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            Ödeme işleminiz başarıyla gerçekleştirildi. Teşekkür ederiz!
          </Typography>

          {orderDetails && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: "8px",
              }}
            >
              <Typography variant="subtitle1">
                Sipariş No: <strong>{orderDetails.id}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Tutar: <strong>{orderDetails.amount.toFixed(2)} TL</strong>
              </Typography>
              <Typography variant="subtitle1">
                Tarih: <strong>{orderDetails.date}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Durum: <strong>{orderDetails.status}</strong>
              </Typography>
            </Box>
          )}

          <Typography variant="body2" sx={{ mt: 4, color: "text.secondary" }}>
            {returnUrl !== "/"
              ? "Yönlendiriliyorsunuz..."
              : "Ana sayfaya yönlendiriliyorsunuz..."}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(returnUrl)}
            sx={{ mt: 2 }}
          >
            Şimdi Yönlendir
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center">
        <PaymentOutlined sx={{ mr: 1, verticalAlign: "middle" }} />
        Ödeme
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mt: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Sipariş Özeti
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body1">{description}</Typography>
            <Typography variant="body1" fontWeight={600}>
              {amount.toFixed(2)} TL
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Toplam</Typography>
            <Typography variant="h6" fontWeight={700}>
              {amount.toFixed(2)} TL
            </Typography>
          </Box>
        </Box>

        <StripePaymentForm
          amount={amount}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          buttonText={`${amount.toFixed(2)} TL Öde`}
        />
      </Paper>
    </Container>
  );
}
