"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ThumbUp,
  AutoGraph,
  MedicalServices,
} from "@mui/icons-material";
import { useDoctorAdviceStore, Advice } from "@/app/store/doctorAdviceStore";
import Link from "next/link";

const DoctorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const { fetchDoctorAdvices, loading, error, deleteAdvice, setUserDoctorId } =
    useDoctorAdviceStore();

  const [doctorAdvices, setDoctorAdvices] = useState<Advice[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAdvices: 0,
    totalLikes: 0,
    publishedAdvices: 0,
    draftAdvices: 0,
  });

  // Not: Gerçek uygulamada doktor kimliği session'dan alınacak
  // Şimdilik sabit bir ID kullanıyoruz
  const currentDoctorId = 1; // Dr. Ahmet Yılmaz ID'si

  useEffect(() => {
    // Kullanıcı doktor ID'sini ayarla
    setUserDoctorId(currentDoctorId);

    // Doktorun tavsiyelerini getir
    const loadDoctorAdvices = async () => {
      const advices = await fetchDoctorAdvices(currentDoctorId);
      setDoctorAdvices(advices);

      // İstatistikleri güncelle
      setStats({
        totalAdvices: advices.length,
        totalLikes: advices.reduce((sum, advice) => sum + advice.likes, 0),
        publishedAdvices: advices.filter((a) => a.status === "published")
          .length,
        draftAdvices: advices.filter((a) => a.status === "draft").length,
      });
    };

    loadDoctorAdvices();
  }, [fetchDoctorAdvices, setUserDoctorId, currentDoctorId]);

  const handleDeleteAdvice = async (adviceId: number) => {
    if (window.confirm("Bu tavsiyeyi silmek istediğinize emin misiniz?")) {
      setDeleteLoading(true);
      try {
        await deleteAdvice(adviceId);
        // Tavsiye listesini güncelle
        setDoctorAdvices(doctorAdvices.filter((a) => a.id !== adviceId));
        // İstatistikleri güncelle
        const deletedAdvice = doctorAdvices.find((a) => a.id === adviceId);
        if (deletedAdvice) {
          setStats({
            ...stats,
            totalAdvices: stats.totalAdvices - 1,
            totalLikes: stats.totalLikes - deletedAdvice.likes,
            publishedAdvices:
              deletedAdvice.status === "published"
                ? stats.publishedAdvices - 1
                : stats.publishedAdvices,
            draftAdvices:
              deletedAdvice.status === "draft"
                ? stats.draftAdvices - 1
                : stats.draftAdvices,
          });
        }
      } catch (error) {
        console.error("Tavsiye silme hatası:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Dr. Ahmet Yılmaz Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Tavsiyelerinizi yönetin ve yeni tavsiyeler ekleyin
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Toplam Tavsiye
                </Typography>
                <MedicalServices color="primary" />
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.totalAdvices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Toplam Beğeni
                </Typography>
                <ThumbUp color="error" />
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.totalLikes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Yayınlanan
                </Typography>
                <VisibilityIcon color="success" />
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.publishedAdvices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Taslaklar
                </Typography>
                <AutoGraph color="info" />
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.draftAdvices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ana İçerik */}
      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold">
            Tavsiyelerim
          </Typography>

          <Link href="/doctor/advices/create" passHref>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              }}
            >
              Yeni Tavsiye Ekle
            </Button>
          </Link>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : doctorAdvices.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz hiç tavsiyeniz bulunmuyor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              "Yeni Tavsiye Ekle" butonuna tıklayarak ilk tavsitenizi
              oluşturabilirsiniz
            </Typography>
            <Link href="/doctor/advices/create" passHref>
              <Button variant="outlined" startIcon={<AddIcon />}>
                İlk Tavsiyeni Oluştur
              </Button>
            </Link>
          </Box>
        ) : (
          <TableContainer>
            <Table aria-label="tavsiyeler tablosu">
              <TableHead sx={{ bgcolor: "primary.light" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Başlık</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Kategori</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Beğeni</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorAdvices.map((advice) => (
                  <TableRow key={advice.id} hover>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {advice.title}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={advice.category}
                        size="small"
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
                      />
                    </TableCell>
                    <TableCell>{advice.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThumbUp
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1, opacity: 0.7 }}
                        />
                        {advice.likes}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          advice.status === "published"
                            ? "Yayında"
                            : advice.status === "draft"
                            ? "Taslak"
                            : advice.status === "pending"
                            ? "Onay Bekliyor"
                            : "Bilinmiyor"
                        }
                        size="small"
                        color={
                          advice.status === "published"
                            ? "success"
                            : advice.status === "draft"
                            ? "default"
                            : advice.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
                        <Link href={`/advice/${advice.id}`} passHref>
                          <IconButton size="small" color="info" sx={{ mr: 1 }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Link>

                        <Link
                          href={`/doctor/advices/edit/${advice.id}`}
                          passHref
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Link>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAdvice(advice.id)}
                          disabled={deleteLoading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default DoctorDashboard;
