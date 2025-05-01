"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { toast } from "react-hot-toast";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL'den session_id'yi al
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Session ID yoksa ana sayfaya yönlendir
    if (!sessionId) {
      router.push("/");
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log("Ödeme doğrulaması başlatılıyor:", sessionId);

        // Ödeme durumunu kontrol et
        const response = await axios.get(
          `/api/checkout?session_id=${sessionId}`
        );
        console.log("Ödeme doğrulama yanıtı:", response.data);

        if (response.data.success) {
          setIsSuccess(true);
          toast.success("Ödeme başarıyla gerçekleşti!");
        } else {
          setError(
            "Ödeme durumu doğrulanamadı. Lütfen müşteri hizmetleriyle iletişime geçin."
          );
          toast.error("Ödeme durumu doğrulanamadı");
        }
      } catch (error: any) {
        console.error("Ödeme doğrulama hatası:", error);
        console.error("Hata detayları:", error.response?.data);

        setError(
          "Ödeme doğrulanırken bir hata oluştu. Lütfen müşteri hizmetleriyle iletişime geçin."
        );
        toast.error("Ödeme doğrulanırken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {isSuccess ? (
          <>
            <CheckCircleOutline
              sx={{ fontSize: 80, color: "success.main", mb: 3 }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Ödeme Başarılı!
            </Typography>
            <Typography variant="body1" paragraph>
              Premium üyelik satın alımınız için teşekkür ederiz. Hesabınız
              başarıyla yükseltildi.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" sx={{ mb: 3 }}>
              Premium üyelik avantajlarınızdan hemen yararlanmaya
              başlayabilirsiniz.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/profile")}
              sx={{ mr: 2 }}
            >
              Profilim
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/")}
            >
              Ana Sayfaya Dön
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" color="error" gutterBottom>
              Bir Sorun Oluştu
            </Typography>
            <Typography variant="body1" paragraph>
              {error ||
                "Ödeme işlemi sırasında bir sorun oluştu. Lütfen müşteri hizmetleriyle iletişime geçin."}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/payment/premium")}
              sx={{ mr: 2 }}
            >
              Tekrar Dene
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/")}
            >
              Ana Sayfaya Dön
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
