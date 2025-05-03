"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  Delete,
  Edit,
  Visibility,
  Home,
  FilterList,
  SortByAlpha,
  AccessTime,
  Clear,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAdminStore } from "@/app/store/adminStore";
import { adviceCategories, Advice } from "@/app/store/doctorAdviceStore";

const AdminAdvicesPage = () => {
  const router = useRouter();

  const {
    advices,
    doctors,
    loading,
    error,
    adviceSearchQuery,
    adviceCategoryFilter,
    adviceStatusFilter,
    adviceSortBy,
    adviceSortDirection,
    fetchAdminAdvices,
    deleteAdminAdvice,
    setAdviceSearchQuery,
    setAdviceCategoryFilter,
    setAdviceStatusFilter,
    setAdviceSortBy,
    resetAdviceFilters,
  } = useAdminStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);

  useEffect(() => {
    fetchAdminAdvices();
  }, [fetchAdminAdvices]);

  const openDeleteDialog = (advice: Advice) => {
    setSelectedAdvice(advice);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedAdvice(null);
  };

  const confirmDelete = async () => {
    if (!selectedAdvice) return;

    try {
      await deleteAdminAdvice(selectedAdvice.id);
      toast.success("Tavsiye başarıyla silindi");
      closeDeleteDialog();
    } catch (error: any) {
      toast.error(error.message || "Tavsiye silinirken bir hata oluştu");
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdviceSearchQuery(event.target.value);
  };

  const handleCategoryFilter = (event: any) => {
    setAdviceCategoryFilter(event.target.value);
  };

  const handleStatusFilter = (event: any) => {
    setAdviceStatusFilter(event.target.value);
  };

  const handleSort = (field: string) => {
    const newDirection =
      adviceSortBy === field && adviceSortDirection === "asc" ? "desc" : "asc";
    setAdviceSortBy(field, newDirection);
  };

  // Filtreleme ve sıralama işlemleri
  const filteredAndSortedAdvices = () => {
    let filtered = [...advices];

    // Arama filtreleme
    if (adviceSearchQuery) {
      const query = adviceSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (advice) =>
          advice.title.toLowerCase().includes(query) ||
          advice.content.toLowerCase().includes(query)
      );
    }

    // Kategori filtreleme
    if (adviceCategoryFilter) {
      filtered = filtered.filter(
        (advice) => advice.category === adviceCategoryFilter
      );
    }

    // Durum filtreleme
    if (adviceStatusFilter) {
      filtered = filtered.filter(
        (advice) => advice.status === adviceStatusFilter
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (adviceSortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "likes":
          comparison = a.likes - b.likes;
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return adviceSortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  // Doktor bilgilerini getir
  const getDoctorName = (doctorId: string, advice: Advice) => {
    // Öncelikle advice'in doctor property'sini kontrol et (api'den gelen ilişkisel veri)
    if (advice.doctor && advice.doctor.name) {
      return advice.doctor.name;
    }

    // Eğer advice'de doctor yoksa, store'daki doctors listesinden bul
    const doctor = doctors.find((doc) => doc.id === doctorId);
    return doctor ? doctor.name : "Bilinmeyen Doktor";
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Başlık ve Yol */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <MuiLink
            component={Link}
            href="/admin"
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            Ana Panel
          </MuiLink>
          <Typography color="text.primary">Tavsiyeler</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Uzman Tavsiyeler Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Doktorların paylaştığı tüm tavsiyeleri bu sayfadan yönetebilirsiniz.
        </Typography>
      </Box>

      {/* Özet Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "4px solid #3f51b5",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Toplam Tavsiye
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {advices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "4px solid #f44336",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Toplam Beğeni
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {advices.reduce((total, advice) => total + advice.likes, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "4px solid #4caf50",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Kategoriler
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {new Set(advices.map((a) => a.category)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderLeft: "4px solid #ff9800",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Doktorlar
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {new Set(advices.map((a) => a.doctorId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtreler */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tavsiye ara..."
              value={adviceSearchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={adviceCategoryFilter}
                onChange={handleCategoryFilter}
                label="Kategori"
                displayEmpty
              >
                <MenuItem value="">Tümü</MenuItem>
                {adviceCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={adviceStatusFilter}
                onChange={handleStatusFilter}
                label="Durum"
                displayEmpty
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="published">Yayında</MenuItem>
                <MenuItem value="draft">Taslak</MenuItem>
                <MenuItem value="pending">Onay Bekliyor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={resetAdviceFilters}
              startIcon={<Clear />}
              size="medium"
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tavsiyeler Tablosu */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "primary.50" }}>
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("title")}
                    >
                      Başlık
                      {adviceSortBy === "title" && (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {adviceSortDirection === "asc" ? "↑" : "↓"}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("category")}
                    >
                      Kategori
                      {adviceSortBy === "category" && (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {adviceSortDirection === "asc" ? "↑" : "↓"}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Doktor</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("date")}
                    >
                      Tarih
                      {adviceSortBy === "date" && (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {adviceSortDirection === "asc" ? "↑" : "↓"}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort("likes")}
                    >
                      Beğeni
                      {adviceSortBy === "likes" && (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {adviceSortDirection === "asc" ? "↑" : "↓"}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedAdvices().length > 0 ? (
                  filteredAndSortedAdvices().map((advice) => (
                    <TableRow key={advice.id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "250px",
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
                            bgcolor:
                              advice.category === "Vitamin"
                                ? "blue.100"
                                : advice.category === "Mineral"
                                ? "green.100"
                                : advice.category === "Yağ Asitleri"
                                ? "orange.100"
                                : "grey.100",
                            color:
                              advice.category === "Vitamin"
                                ? "blue.800"
                                : advice.category === "Mineral"
                                ? "green.800"
                                : advice.category === "Yağ Asitleri"
                                ? "orange.800"
                                : "grey.800",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {getDoctorName(advice.doctorId, advice)}
                      </TableCell>
                      <TableCell>{advice.date}</TableCell>
                      <TableCell>{advice.likes}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            advice.status === "published"
                              ? "Yayında"
                              : advice.status === "draft"
                              ? "Taslak"
                              : advice.status === "pending"
                              ? "Onay Bekliyor"
                              : "Yayında" // Default değer
                          }
                          size="small"
                          color={
                            advice.status === "published"
                              ? "success"
                              : advice.status === "draft"
                              ? "default"
                              : advice.status === "pending"
                              ? "warning"
                              : "success" // Default değer
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Görüntüle">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => router.push(`/advice/${advice.id}`)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => openDeleteDialog(advice)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        Gösterilecek tavsiye bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Tavsiyeyi silmek istediğinize emin misiniz?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <strong>{selectedAdvice?.title}</strong> başlıklı tavsiye
            silinecektir. Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAdvicesPage;
