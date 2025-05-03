"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import {
  Container,
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Share,
} from "@mui/icons-material";
import Link from "next/link";
import axios from "axios";
import { Advice, Doctor } from "@/app/store/doctorAdviceStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import DOMPurify from "isomorphic-dompurify";

interface AdviceParams {
  params: {
    id: string;
  };
}

export default function AdviceDetailPage({ params }: AdviceParams) {
  const theme = useTheme();
  const router = useRouter();
  // @ts-ignore - TypeScript hatasını gidermek için
  const adviceId = use(params).id;
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/public/advices/${adviceId}`);
        setAdvice(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching advice:", error);
        setError(error.response?.data?.error || "Tavsiye bilgisi yüklenemedi.");
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [adviceId]);

  const handleLike = async () => {
    if (!advice) return;

    try {
      const response = await axios.patch(`/api/public/advices/${advice.id}`);
      setAdvice({
        ...advice,
        likes: response.data.likes,
      });
      setLiked(true);
    } catch (error) {
      console.error("Error liking advice:", error);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: advice?.title,
        text: `${advice?.title} - ${advice?.doctor?.name} tavsiyesi`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Bağlantı panoya kopyalandı!");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !advice) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error || "Tavsiye bulunamadı."}</Alert>
        <Box sx={{ mt: 3 }}>
          <Button
            component={Link}
            href="/advice"
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Tüm Tavsiyelere Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button
        component={Link}
        href="/advice"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Tüm Tavsiyelere Dön
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* Kategori ve Tarih */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={advice.category}
                color={
                  advice.category === "Vitamin"
                    ? "primary"
                    : advice.category === "Mineral"
                    ? "success"
                    : advice.category === "Yağ Asitleri"
                    ? "info"
                    : advice.category === "Antioksidan"
                    ? "secondary"
                    : advice.category === "Sindirim"
                    ? "warning"
                    : "default"
                }
                sx={{ fontWeight: 600, borderRadius: "12px" }}
              />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(advice.date), "d MMMM yyyy", { locale: tr })}
              </Typography>
            </Box>

            {/* Başlık */}
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary.dark"
              sx={{ my: 2 }}
            >
              {advice.title}
            </Typography>

            {/* Görsel (varsa) */}
            {advice.imageUrl && (
              <Box sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
                <img
                  src={advice.imageUrl}
                  alt={advice.title}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            {/* İçerik */}
            <Typography
              variant="body1"
              sx={{ mb: 4, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(advice.content),
              }}
            />

            {/* Beğeni ve Paylaşım */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={handleLike}
                  color={liked ? "error" : "default"}
                  sx={{ mr: 1 }}
                >
                  {liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {advice.likes} beğeni
                </Typography>
              </Box>

              <Button
                startIcon={<Share />}
                variant="outlined"
                onClick={handleShare}
                size="small"
              >
                Paylaş
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Doktor Bilgisi Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              position: "sticky",
              top: 100,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              Doktor Bilgisi
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
              <Avatar
                src={advice.doctor?.image}
                alt={advice.doctor?.name}
                sx={{
                  width: 80,
                  height: 80,
                  mr: 2,
                  border: "3px solid white",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {advice.doctor?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {advice.doctor?.title}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                  {advice.doctor?.specialty}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" paragraph>
              {advice.doctor?.bio ||
                "Sağlık ve takviyeler konusunda uzman doktor."}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              color="primary"
              sx={{
                mt: 2,
                borderRadius: "8px",
                py: 1,
                fontWeight: 600,
              }}
              component={Link}
              href={`mailto:${advice.doctor?.email || "contact@example.com"}`}
            >
              İletişime Geç
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
