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
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Doktor Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tavsiyelerinizi yönetin ve sağlık bilgilerinizi paylaşın
            </Typography>
          </Grid>
          <Grid item>
            <Link href="/doctor/advices/create" passHref>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  boxShadow: `0px 4px 14px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                }}
              >
                Yeni Tavsiye
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              boxShadow: `0px 4px 12px ${alpha(
                theme.palette.primary.main,
                0.1
              )}`,
              position: "relative",
              overflow: "hidden",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0px 8px 20px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  Toplam Tavsiye
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <MedicalServices />
                </Avatar>
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
              borderRadius: 4,
              boxShadow: `0px 4px 12px ${alpha(theme.palette.error.main, 0.1)}`,
              position: "relative",
              overflow: "hidden",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0px 8px 20px ${alpha(
                  theme.palette.error.main,
                  0.2
                )}`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: theme.palette.error.main,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  Toplam Beğeni
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  }}
                >
                  <ThumbUp />
                </Avatar>
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
              borderRadius: 4,
              boxShadow: `0px 4px 12px ${alpha(
                theme.palette.success.main,
                0.1
              )}`,
              position: "relative",
              overflow: "hidden",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0px 8px 20px ${alpha(
                  theme.palette.success.main,
                  0.2
                )}`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: theme.palette.success.main,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  Yayınlanan
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                  }}
                >
                  <VisibilityIcon />
                </Avatar>
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
              borderRadius: 4,
              boxShadow: `0px 4px 12px ${alpha(theme.palette.info.main, 0.1)}`,
              position: "relative",
              overflow: "hidden",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0px 8px 20px ${alpha(
                  theme.palette.info.main,
                  0.2
                )}`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: theme.palette.info.main,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontWeight="medium"
                >
                  Taslaklar
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                >
                  <AutoGraph />
                </Avatar>
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
          borderRadius: 4,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocalHospital
              sx={{
                color: theme.palette.primary.main,
                mr: 1.5,
                fontSize: 28,
              }}
            />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Tavsiyelerim
            </Typography>
          </Box>

          <Link href="/doctor/advices/create" passHref>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 8,
                px: 3,
                boxShadow: `0px 4px 14px ${alpha(
                  theme.palette.primary.main,
                  0.25
                )}`,
                background: theme.palette.primary.main,
                "&:hover": {
                  background: theme.palette.primary.dark,
                },
              }}
            >
              Yeni Tavsiye Ekle
            </Button>
          </Link>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ p: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
              Tavsiyeler yükleniyor...
            </Typography>
          </Box>
        ) : doctorAdvices.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <MedicalServices
              sx={{
                fontSize: 60,
                color: alpha(theme.palette.primary.main, 0.2),
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz hiç tavsiyeniz bulunmuyor
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 500, mx: "auto" }}
            >
              "Yeni Tavsiye Ekle" butonuna tıklayarak ilk tavsiyenizi
              oluşturabilir ve deneyimlerinizi paylaşabilirsiniz.
            </Typography>
            <Link href="/doctor/advices/create" passHref>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 8, px: 3 }}
              >
                İlk Tavsiyeni Oluştur
              </Button>
            </Link>
          </Box>
        ) : (
          <TableContainer sx={{ pb: 1 }}>
            <Table aria-label="tavsiyeler tablosu">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 600,
                      py: 2,
                    },
                  }}
                >
                  <TableCell>Başlık</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Beğeni</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctorAdvices.map((advice) => (
                  <TableRow
                    key={advice.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {advice.title}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={advice.category}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            getCategoryColor(advice.category),
                            0.1
                          ),
                          color: getCategoryColor(advice.category),
                          fontWeight: "medium",
                          borderRadius: "6px",
                          px: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(advice.date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThumbUp
                          fontSize="small"
                          sx={{
                            mr: 1,
                            color: theme.palette.error.main,
                            opacity: 0.7,
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={advice.likes > 0 ? "bold" : "normal"}
                          color={
                            advice.likes > 0 ? "error.main" : "text.secondary"
                          }
                        >
                          {advice.likes}
                        </Typography>
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
                        sx={{
                          bgcolor: alpha(getStatusColor(advice.status), 0.1),
                          color: getStatusColor(advice.status),
                          fontWeight: "medium",
                          borderRadius: "6px",
                          px: 0.5,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Görüntüle">
                          <Link href={`/advice/${advice.id}`} passHref>
                            <IconButton
                              size="small"
                              sx={{
                                mr: 1,
                                color: theme.palette.info.main,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.info.main, 0.2),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>

                        <Tooltip title="Düzenle">
                          <Link
                            href={`/doctor/advices/edit/${advice.id}`}
                            passHref
                          >
                            <IconButton
                              size="small"
                              sx={{
                                mr: 1,
                                color: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.2
                                  ),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>

                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAdvice(advice.id)}
                            disabled={deleteLoading}
                            sx={{
                              color: theme.palette.error.main,
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
