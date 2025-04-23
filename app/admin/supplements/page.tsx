"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Box,
  Grid,
  Chip,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  WarningAmber,
  LocalShipping,
  Refresh,
  FilterList,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSupplementStore, Supplement } from "@/app/store/supplementStore";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  height: "100%",
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 5,
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  boxShadow: "none",
  fontWeight: 500,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)",
  borderRadius: 50,
  color: "white",
  boxShadow: "0 3px 5px 2px rgba(99, 102, 241, .3)",
  height: 48,
  padding: "0 30px",
  "&:hover": {
    background: "linear-gradient(45deg, #5a5ed6 30%, #7a4de0 90%)",
    boxShadow: "0 5px 8px 2px rgba(99, 102, 241, .4)",
  },
}));

const StatusCard = styled(Card)(({ color }: { color: string }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  color: "white",
  borderRadius: 16,
  boxShadow: `0 8px 16px -4px ${color}50`,
}));

const COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#A855F7", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
];

const SupplementsPage = () => {
  const router = useRouter();

  // Use Zustand store instead of local state
  const {
    supplements,
    filteredSupplements,
    isLoading,
    error,
    searchQuery,
    categoryFilter,
    sortBy,
    sortDirection,
    fetchSupplements,
    deleteSupplement,
    setSearchQuery,
    setCategoryFilter,
    setSortBy,
    resetFilters,
  } = useSupplementStore();

  // Local UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplementToDelete, setSupplementToDelete] =
    useState<Supplement | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch supplements on component mount
  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(supplements.map((sup) => sup.category))
    );
    setCategories(uniqueCategories);
  }, [supplements]);

  const openDeleteDialog = (supplement: Supplement) => {
    setSupplementToDelete(supplement);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSupplementToDelete(null);
  };

  const handleDelete = async (supplement: Supplement) => {
    openDeleteDialog(supplement);
  };

  const confirmDelete = async () => {
    if (!supplementToDelete) return;

    try {
      await deleteSupplement(supplementToDelete.id);
      toast.success("Takviye başarıyla silindi.");
    } catch (error) {
      console.error("Error deleting supplement:", error);
      toast.error(
        (error as any).response?.data?.error ||
          "Silme işlemi sırasında bir hata oluştu"
      );
    } finally {
      closeDeleteDialog();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value === "all" ? "" : event.target.value);
  };

  const handleRequestSort = (property: keyof Supplement) => {
    const newDirection =
      sortBy === property && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(property, newDirection);
  };

  // Prepare data for category distribution chart
  const getCategoryData = () => {
    const categoryCounts: Record<string, number> = {};
    supplements.forEach((sup) => {
      categoryCounts[sup.category] = (categoryCounts[sup.category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category.replace("_", " "),
      value: count,
    }));
  };

  // Prepare data for price range chart
  const getPriceRangeData = () => {
    const ranges = [
      { range: "0-50 ₺", count: 0 },
      { range: "51-100 ₺", count: 0 },
      { range: "101-200 ₺", count: 0 },
      { range: "201-500 ₺", count: 0 },
      { range: "500+ ₺", count: 0 },
    ];

    supplements.forEach((sup) => {
      if (sup.price <= 50) {
        ranges[0].count++;
      } else if (sup.price <= 100) {
        ranges[1].count++;
      } else if (sup.price <= 200) {
        ranges[2].count++;
      } else if (sup.price <= 500) {
        ranges[3].count++;
      } else {
        ranges[4].count++;
      }
    });

    return ranges;
  };

  // Get top supplements by criteria (price or stock)
  const getTopProducts = (
    criteria: "price" | "stock",
    limit: number = 5,
    ascending: boolean = false
  ) => {
    return [...supplements]
      .sort((a, b) =>
        ascending ? a[criteria] - b[criteria] : b[criteria] - a[criteria]
      )
      .slice(0, limit);
  };

  // Get general statistics
  const getStatistics = () => {
    const totalProducts = supplements.length;
    const totalStock = supplements.reduce((acc, curr) => acc + curr.stock, 0);
    const avgPrice =
      totalProducts > 0
        ? supplements.reduce((acc, curr) => acc + curr.price, 0) / totalProducts
        : 0;
    const lowStockProducts = supplements.filter((sup) => sup.stock < 10).length;

    return {
      totalProducts,
      totalStock,
      avgPrice,
      lowStockProducts,
    };
  };

  // Mock data for monthly sales trend (in a real app, this would come from the backend)
  const salesTrendData = [
    { name: "Oca", sales: 32 },
    { name: "Şub", sales: 45 },
    { name: "Mar", sales: 37 },
    { name: "Nis", sales: 51 },
    { name: "May", sales: 42 },
    { name: "Haz", sales: 60 },
    { name: "Tem", sales: 55 },
  ];

  const stats = getStatistics();
  const categoryData = getCategoryData();
  const priceRangeData = getPriceRangeData();

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: "primary.main" }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => fetchSupplements()}
          sx={{ mt: 2 }}
        >
          Yeniden Dene
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header with Title and Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link href="/admin" passHref>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: 14,
                textDecoration: "none",
                display: "block",
                cursor: "pointer",
              }}
            >
              Admin Panel
            </Typography>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: 14 }}>
            Takviyeler
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={600} gutterBottom>
          Takviyeler
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tüm takviyeleri görüntüle, düzenle ve yönet
        </Typography>
      </Box>

      {/* Filters and Actions Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <SearchTextField
              placeholder="Takviye ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              variant="outlined"
            />

            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="category-filter-label">Kategori</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={categoryFilter}
                label="Kategori"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">Tümü</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace("_", " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <ActionButton
              variant="outlined"
              startIcon={<Refresh />}
              color="primary"
              onClick={fetchSupplements}
            >
              Yenile
            </ActionButton>

            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              color="primary"
              onClick={() => router.push("/admin/supplements/new")}
            >
              Yeni Takviye
            </ActionButton>
          </Box>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Toplam Ürün
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.totalProducts}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#6342D815",
                    color: "primary.main",
                    width: 56,
                    height: 56,
                  }}
                >
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Toplam Stok
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.totalStock}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#10B98115",
                    color: "#10B981",
                    width: 56,
                    height: 56,
                  }}
                >
                  <LocalShipping />
                </Avatar>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Ortalama Fiyat
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.avgPrice.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#F59E0B15",
                    color: "#F59E0B",
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Düşük Stok
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {stats.lowStockProducts}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#EF444415",
                    color: "#EF4444",
                    width: 56,
                    height: 56,
                  }}
                >
                  <WarningAmber />
                </Avatar>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6">Takviye Listesi</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {filteredSupplements.length} ürün
                  </Typography>
                </Box>
              </Box>

              {filteredSupplements.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    Hiç takviye bulunamadı
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ mt: 1 }}
                  >
                    Farklı arama kriterleri deneyin veya yeni bir takviye
                    ekleyin
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRequestSort("name")}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            Ürün Adı
                            {sortBy === "name" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ) : (
                                <ArrowDownward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRequestSort("category")}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            Kategori
                            {sortBy === "category" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ) : (
                                <ArrowDownward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRequestSort("price")}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            Fiyat
                            {sortBy === "price" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ) : (
                                <ArrowDownward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRequestSort("stock")}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            Stok
                            {sortBy === "stock" &&
                              (sortDirection === "asc" ? (
                                <ArrowUpward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ) : (
                                <ArrowDownward
                                  fontSize="small"
                                  sx={{ ml: 0.5 }}
                                />
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell align="right">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSupplements.map((supplement) => (
                        <TableRow key={supplement.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                component="img"
                                src={`/SupplementImage/${supplement.imageUrl}`}
                                alt={supplement.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  mr: 2,
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder-image.png";
                                }}
                              />
                              <Typography variant="body2" fontWeight={500}>
                                {supplement.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={supplement.category.replace("_", " ")}
                              size="small"
                              sx={{
                                bgcolor: `${
                                  COLORS[
                                    categories.indexOf(supplement.category) %
                                      COLORS.length
                                  ]
                                }15`,
                                color:
                                  COLORS[
                                    categories.indexOf(supplement.category) %
                                      COLORS.length
                                  ],
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {supplement.price.toLocaleString("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={supplement.stock}
                              color={
                                supplement.stock < 10
                                  ? "error"
                                  : supplement.stock < 50
                                  ? "warning"
                                  : "success"
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  router.push(
                                    `/admin/supplements/edit/${supplement.id}`
                                  )
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(supplement)}
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
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Takviye Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{supplementToDelete?.name}</strong> isimli takviyeyi silmek
            istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplementsPage;
