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
  Avatar,
  LinearProgress,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ThumbUp,
  AutoGraph,
  MedicalServices,
  Person,
  MoreVert,
  MedicalInformation,
  LocalHospital,
  Biotech,
} from "@mui/icons-material";
import { useDoctorAdviceStore, Advice } from "@/app/store/doctorAdviceStore";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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

  useEffect(() => {
    // Authenticate user and redirect if not a doctor
    const authenticateUser = async () => {
      try {
        const response = await axios.get("/api/auth/session");
        if (!response.data?.user || response.data?.user?.role !== "DOCTOR") {
          // Redirect to home page if not authenticated or not a doctor
          window.location.href = "/";
          return;
        }

        // Continue with doctor-specific logic
        // Get the current doctor ID from the session
        const doctorId = response.data.user.id;

        // Kullanıcı doktor ID'sini ayarla
        setUserDoctorId(doctorId);

        // Doktorun tavsiyelerini getir
        const advices = await fetchDoctorAdvices(doctorId);
        setDoctorAdvices(advices);

        // İstatistikleri güncelle
        setStats({
          totalAdvices: advices.length,
          totalLikes: advices.reduce((sum, advice) => sum + advice.likes, 0),
          publishedAdvices: advices.filter((a) => a.status === "published")
            .length,
          draftAdvices: advices.filter((a) => a.status === "draft").length,
        });
      } catch (error) {
        console.error("Authentication error:", error);
        // Redirect to home page if there's any authentication error
        window.location.href = "/";
      }
    };

    authenticateUser();
  }, [fetchDoctorAdvices, setUserDoctorId]);

  const handleDeleteAdvice = async (adviceId: string) => {
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

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "-";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "dd MMM yyyy", { locale: tr });
    } catch (error) {
      return dateString || "-";
    }
  };

  // Kategori Renkleri
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vitamin":
        return theme.palette.primary.main;
      case "Mineral":
        return theme.palette.success.main;
      case "Yağ Asitleri":
        return theme.palette.info.main;
      case "Antioksidan":
        return theme.palette.secondary.main;
      case "Sindirim":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Durum Renkleri
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return theme.palette.success.main;
      case "draft":
        return theme.palette.grey[500];
      case "pending":
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <MedicalInformation fontSize="large" />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Doktor Paneli
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tavsiyelerinizi yönetin, oluşturun ve paylaşın
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              href="/doctor/advices/create"
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              }}
            >
              Yeni Tavsiye Ekle
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Kart İstatistikleri */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                <MedicalInformation />
              </Avatar>
              <Typography
                gutterBottom
                variant="h4"
                component="div"
                fontWeight="bold"
              >
                {stats.totalAdvices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Tavsiye
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                <ThumbUp />
              </Avatar>
              <Typography
                gutterBottom
                variant="h4"
                component="div"
                fontWeight="bold"
              >
                {stats.totalLikes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Beğeni
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                <AutoGraph />
              </Avatar>
              <Typography
                gutterBottom
                variant="h4"
                component="div"
                fontWeight="bold"
              >
                {stats.publishedAdvices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yayınlanan Tavsiye
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  width: 56,
                  height: 56,
                  mb: 2,
                }}
              >
                <MedicalServices />
              </Avatar>
              <Typography
                gutterBottom
                variant="h4"
                component="div"
                fontWeight="bold"
              >
                {stats.draftAdvices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taslak Tavsiye
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tavsiyeler Listesi */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Tavsiyeleriniz
        </Typography>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : doctorAdvices.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Başlık</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Ekleme Tarihi</TableCell>
                  <TableCell>Beğeni</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorAdvices.map((advice) => (
                  <TableRow
                    key={advice.id}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: {
                            xs: "150px",
                            sm: "250px",
                            md: "300px",
                          },
                        }}
                      >
                        {advice.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={advice.category}
                        size="small"
                        sx={{
                          backgroundColor: alpha(
                            getCategoryColor(advice.category),
                            0.1
                          ),
                          color: getCategoryColor(advice.category),
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          advice.status === "published"
                            ? "Yayında"
                            : advice.status === "draft"
                            ? "Taslak"
                            : "Beklemede"
                        }
                        size="small"
                        sx={{
                          backgroundColor: alpha(
                            getStatusColor(advice.status || "draft"),
                            0.1
                          ),
                          color: getStatusColor(advice.status || "draft"),
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(advice.date)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ThumbUp
                          fontSize="small"
                          sx={{
                            color: theme.palette.primary.main,
                            mr: 0.5,
                            fontSize: "0.875rem",
                          }}
                        />
                        {advice.likes}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Düzenle">
                        <IconButton
                          component={Link}
                          href={`/doctor/advices/edit/${advice.id}`}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAdvice(advice.id)}
                          disabled={deleteLoading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <MedicalInformation
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Henüz tavsiye eklenmedi
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              sx={{ mb: 3 }}
            >
              Hastalarınıza takviyeler hakkında tavsiyeler vermek için ilk
              tavsinenizi ekleyin.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/doctor/advices/create"
              startIcon={<AddIcon />}
            >
              Tavsiye Ekle
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DoctorDashboard;
