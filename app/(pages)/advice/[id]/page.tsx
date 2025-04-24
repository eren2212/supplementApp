"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Box,
  Button,
  Typography,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
} from "@mui/material";
import { ArrowBack, NavigateNext } from "@mui/icons-material";
import AdviceDetail from "@/app/components/advice/AdviceDetail";
import { useDoctorAdviceStore } from "@/app/store/doctorAdviceStore";
import { useRouter } from "next/navigation";
import type { Advice, Doctor } from "@/app/store/doctorAdviceStore";

const AdviceDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const adviceId = params.id as string;

  const { doctors, advices, loading, error, fetchDoctors, fetchAdvices } =
    useDoctorAdviceStore();

  const [currentAdvice, setCurrentAdvice] = useState<Advice | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAdvices();
  }, [fetchDoctors, fetchAdvices]);

  useEffect(() => {
    if (advices.length > 0 && doctors.length > 0) {
      const advice = advices.find((a) => a.id === Number(adviceId));

      if (advice) {
        setCurrentAdvice(advice);
        const doctor = doctors.find((d) => d.id === advice.doctorId);
        if (doctor) {
          setCurrentDoctor(doctor);
        }
      }
    }
  }, [adviceId, advices, doctors]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !currentAdvice || !currentDoctor) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 4 }}>
          Tavsiyelere Geri Dön
        </Button>
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Tavsiye Bulunamadı
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aradığınız tavsiye bulunamadı veya bir hata oluştu.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Geri dönüş butonu ve breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{
            mb: 2,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          Tavsiyelere Geri Dön
        </Button>

        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            color="inherit"
            href="/advice"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Tavsiyeler
          </Link>
          <Link
            color="inherit"
            href={`/advice?category=${currentAdvice.category}`}
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {currentAdvice.category}
          </Link>
          <Typography color="text.primary">{currentAdvice.title}</Typography>
        </Breadcrumbs>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Tavsiye detayı */}
      <AdviceDetail advice={currentAdvice} doctor={currentDoctor} />

      {/* İlgili Tavsiyeler */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          İlgili Tavsiyeler
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Burada ilgili tavsiyeleri listeleyen bir bileşen eklenebilir */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 3 }}
        >
          Bu kategoride başka tavsiyeler bulunmuyor.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdviceDetailPage;
