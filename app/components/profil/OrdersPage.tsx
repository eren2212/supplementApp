"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  CircularProgress,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Badge,
} from "@mui/material";
import {
  ShoppingBag as OrderIcon,
  LocalShipping as ShippingIcon,
  ReceiptLong as ReceiptIcon,
  VisibilityOutlined as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Event as DateIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import { themeColors } from "./ProfilePage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

// Türkçe lokalizasyonu etkinleştir
dayjs.locale("tr");
dayjs.extend(relativeTime);

// Sipariş türü tanımlaması
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned";

// Sipariş ürünü türü
type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

// Teslimat adresi türü
type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
};

// Sipariş türü
type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  paymentId: string;
};

// Sipariş durumuna göre Türkçe metin ve renk tanımlama
const getOrderStatusInfo = (status: OrderStatus) => {
  const statusInfo: Record<
    OrderStatus,
    { label: string; color: string; icon: React.ReactElement }
  > = {
    pending: {
      label: "Beklemede",
      color: "#FFA726",
      icon: <WarningIcon fontSize="small" />,
    },
    processing: {
      label: "İşleniyor",
      color: "#42A5F5",
      icon: <RefreshIcon fontSize="small" />,
    },
    shipped: {
      label: "Kargoya Verildi",
      color: "#26A69A",
      icon: <ShippingIcon fontSize="small" />,
    },
    delivered: {
      label: "Teslim Edildi",
      color: "#66BB6A",
      icon: <SuccessIcon fontSize="small" />,
    },
    completed: {
      label: "Tamamlandı",
      color: "#43A047",
      icon: <SuccessIcon fontSize="small" />,
    },
    cancelled: {
      label: "İptal Edildi",
      color: "#E53935",
      icon: <WarningIcon fontSize="small" />,
    },
    returned: {
      label: "İade Edildi",
      color: "#8D6E63",
      icon: <WarningIcon fontSize="small" />,
    },
  };

  return (
    statusInfo[status] || {
      label: "Bilinmiyor",
      color: "#9E9E9E",
      icon: <WarningIcon fontSize="small" />,
    }
  );
};

const OrdersPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtreleme durumları
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<number>(90); // son 90 gün

  // Sayfalama
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Siparişleri getir
  const fetchOrders = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await axios.get("/api/profile/orders");

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        setError("Siparişler alınırken bir sorun oluştu");
      }
    } catch (error) {
      console.error("Siparişler alınırken hata:", error);
      setError("Siparişler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Sipariş detayını getir
  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await axios.get(`/api/profile/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setOrderDialogOpen(true);
      } else {
        setError("Sipariş detayları alınırken bir sorun oluştu");
      }
    } catch (error) {
      console.error("Sipariş detayları alınırken hata:", error);
      setError("Sipariş detayları yüklenirken bir hata oluştu");
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  // Filtreleri uygula
  useEffect(() => {
    if (!orders.length) return;

    let result = [...orders];

    // Zaman filtreleme
    if (timeRange > 0) {
      const cutoffDate = dayjs().subtract(timeRange, "day").toDate();
      result = result.filter((order) =>
        dayjs(order.createdAt).isAfter(cutoffDate)
      );
    }

    // Durum filtreleme
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Arama filtreleme
    if (searchQuery.trim() !== "") {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(lowercaseQuery) ||
          (order.trackingNumber &&
            order.trackingNumber.toLowerCase().includes(lowercaseQuery)) ||
          order.items.some((item) =>
            item.productName.toLowerCase().includes(lowercaseQuery)
          )
      );
    }

    setFilteredOrders(result);
    setPage(0); // Filtreleme yapıldığında ilk sayfaya dön
  }, [searchQuery, statusFilter, timeRange, orders]);

  // Sipariş detay diyaloğunu kapat
  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  // Sayfalama işlemleri
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD MMMM YYYY, HH:mm");
  };

  // Sipariş durumunu Türkçe olarak göster
  const OrderStatusChip = ({ status }: { status: OrderStatus }) => {
    const statusInfo = getOrderStatusInfo(status);

    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        sx={{
          bgcolor: alpha(statusInfo.color, 0.1),
          color: statusInfo.color,
          fontWeight: "medium",
          borderRadius: "8px",
          "& .MuiChip-icon": {
            color: statusInfo.color,
          },
        }}
        size="small"
      />
    );
  };

  // Mevcut sayfada gösterilecek siparişler
  const displayedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      sx={{
        width: "100%",
        p: 0,
        position: "relative",
        minHeight: 500,
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(128, 90, 213, 0.1)",
        marginTop: 15,
        background: "linear-gradient(180deg, #fafafa 0%, #f5f3ff 100%)",
        border: "1px solid rgba(124, 58, 237, 0.06)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            fontWeight="bold"
            color="#7c3aed"
          >
            <OrderIcon
              sx={{ mr: 1, verticalAlign: "text-bottom", color: "#7c3aed" }}
            />
            Siparişlerim
          </Typography>

          <Badge
            badgeContent={orders.length}
            color="secondary"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: 12,
                fontWeight: "bold",
                backgroundColor: "#8b5cf6",
              },
            }}
          >
            <Chip
              label="Toplam Sipariş"
              variant="outlined"
              size="small"
              sx={{ borderColor: "#8b5cf6", color: "#7c3aed" }}
            />
          </Badge>
        </Box>

        {/* Filtreler */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: "rgba(124, 58, 237, 0.03)",
            border: `1px solid rgba(124, 58, 237, 0.1)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              placeholder="Sipariş ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "rgba(124, 58, 237, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7c3aed",
                  },
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "rgba(124, 58, 237, 0.7)" }}>
                Durum
              </InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  "&.MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "rgba(124, 58, 237, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c3aed",
                    },
                  },
                }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="pending">Beklemede</MenuItem>
                <MenuItem value="processing">İşleniyor</MenuItem>
                <MenuItem value="shipped">Kargoya Verildi</MenuItem>
                <MenuItem value="delivered">Teslim Edildi</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="cancelled">İptal Edildi</MenuItem>
                <MenuItem value="returned">İade Edildi</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "rgba(124, 58, 237, 0.7)" }}>
                Tarih
              </InputLabel>
              <Select
                value={timeRange}
                label="Tarih"
                onChange={(e) => setTimeRange(Number(e.target.value))}
                sx={{
                  "&.MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "rgba(124, 58, 237, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c3aed",
                    },
                  },
                }}
              >
                <MenuItem value={0}>Tüm Zamanlar</MenuItem>
                <MenuItem value={30}>Son 30 Gün</MenuItem>
                <MenuItem value={90}>Son 90 Gün</MenuItem>
                <MenuItem value={180}>Son 6 Ay</MenuItem>
                <MenuItem value={365}>Son 1 Yıl</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {loading ? (
          <Box sx={{ width: "100%", mt: 3 }}>
            <LinearProgress
              sx={{
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#7c3aed",
                },
              }}
            />
            <Typography
              sx={{ mt: 2, textAlign: "center" }}
              color="text.secondary"
            >
              Siparişleriniz yükleniyor...
            </Typography>
          </Box>
        ) : error ? (
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              borderRadius: "12px",
            }}
          >
            <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography color="error">{error}</Typography>
            <Button
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "#7c3aed",
                color: "#7c3aed",
                "&:hover": {
                  borderColor: "#6d28d9",
                  backgroundColor: "rgba(124, 58, 237, 0.05)",
                },
              }}
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchOrders}
            >
              Yeniden Dene
            </Button>
          </Paper>
        ) : filteredOrders.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "rgba(124, 58, 237, 0.02)",
              borderRadius: "12px",
              border: "1px dashed rgba(124, 58, 237, 0.2)",
            }}
          >
            <OrderIcon
              sx={{
                fontSize: 60,
                color: "rgba(124, 58, 237, 0.3)",
                mb: 2,
              }}
            />

            <Typography variant="h6" color="#7c3aed" gutterBottom>
              Henüz siparişiniz bulunmuyor
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              Burada yaptığınız tüm siparişleri görebilir ve takip
              edebilirsiniz.
            </Typography>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#7c3aed",
                "&:hover": {
                  bgcolor: "#6d28d9",
                },
              }}
              startIcon={<OrderIcon />}
              onClick={() => router.push("/supplement")}
            >
              Alışverişe Başla
            </Button>
          </Paper>
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid rgba(124, 58, 237, 0.1)`,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(124, 58, 237, 0.05)",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: "rgba(124, 58, 237, 0.08)",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "#6d28d9" }}>
                      Sipariş No
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#6d28d9" }}>
                      Tarih
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#6d28d9" }}>
                      Durum
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: "#6d28d9" }}
                    >
                      Tutar
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#6d28d9" }}
                    >
                      İşlem
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(124, 58, 237, 0.03)",
                          cursor: "pointer",
                        },
                        "&:last-child td, &:last-child th": {
                          borderBottom: 0,
                        },
                      }}
                      onClick={() => fetchOrderDetail(order.id)}
                    >
                      <TableCell
                        sx={{ fontWeight: "medium", color: "#4c1d95" }}
                      >
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <OrderStatusChip status={order.status} />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "medium", color: "#4c1d95" }}
                      >
                        {order.totalAmount.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton
                            color="secondary"
                            size="small"
                            sx={{
                              color: "#7c3aed",
                              "&:hover": {
                                backgroundColor: "rgba(124, 58, 237, 0.1)",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchOrderDetail(order.id);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count}`
              }
              sx={{
                ".MuiTablePagination-select": {
                  color: "#7c3aed",
                },
                ".MuiTablePagination-selectIcon": {
                  color: "#7c3aed",
                },
                ".MuiTablePagination-actions .MuiIconButton-root": {
                  color: "#7c3aed",
                  "&:disabled": {
                    color: "rgba(124, 58, 237, 0.3)",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                  },
                },
              }}
            />
          </>
        )}
      </CardContent>

      {/* Sipariş Detay Diyaloğu */}
      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            backgroundImage: `radial-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          },
        }}
      >
        {!selectedOrder ? (
          <DialogContent>
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#7c3aed" }} />
            </Box>
          </DialogContent>
        ) : (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" color="#7c3aed">
                    Sipariş #{selectedOrder.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedOrder.createdAt)}
                  </Typography>
                </Box>
                <OrderStatusChip status={selectedOrder.status} />
              </Box>
            </DialogTitle>

            <Divider sx={{ borderColor: "rgba(124, 58, 237, 0.1)" }} />

            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: "100%",
                      bgcolor: "rgba(124, 58, 237, 0.03)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      color="#7c3aed"
                    >
                      <ReceiptIcon
                        sx={{
                          mr: 1,
                          verticalAlign: "text-bottom",
                          fontSize: 20,
                          color: "#7c3aed",
                        }}
                      />
                      Sipariş Bilgileri
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Sipariş Tarihi:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedOrder.createdAt)}
                        </Typography>
                      </Box>

                      {selectedOrder.trackingNumber && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Kargo Takip No:
                          </Typography>
                          <Chip
                            label={selectedOrder.trackingNumber}
                            size="small"
                            variant="outlined"
                            icon={<ShippingIcon />}
                            sx={{
                              mt: 0.5,
                              borderColor: "#8b5cf6",
                              color: "#7c3aed",
                            }}
                          />
                        </Box>
                      )}

                      {selectedOrder.notes && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Notlar:
                          </Typography>
                          <Typography variant="body1">
                            {selectedOrder.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: "100%",
                      bgcolor: "rgba(124, 58, 237, 0.03)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      color="#7c3aed"
                    >
                      <ShippingIcon
                        sx={{
                          mr: 1,
                          verticalAlign: "text-bottom",
                          fontSize: 20,
                          color: "#7c3aed",
                        }}
                      />
                      Teslimat Adresi
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOrder.shippingAddress.firstName}{" "}
                        {selectedOrder.shippingAddress.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedOrder.shippingAddress.address}
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.shippingAddress.postcode},{" "}
                        {selectedOrder.shippingAddress.city}
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.shippingAddress.country}
                      </Typography>

                      <Divider
                        sx={{ my: 1.5, borderColor: "rgba(124, 58, 237, 0.1)" }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        Telefon: {selectedOrder.shippingAddress.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        E-posta: {selectedOrder.shippingAddress.email}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ mt: 1, borderRadius: "12px", overflow: "hidden" }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ px: 2, pt: 2 }}
                      color="#7c3aed"
                    >
                      <ShoppingIcon
                        sx={{
                          mr: 1,
                          verticalAlign: "text-bottom",
                          fontSize: 20,
                          color: "#7c3aed",
                        }}
                      />
                      Sipariş Ürünleri
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableHead
                          sx={{
                            bgcolor: "rgba(124, 58, 237, 0.05)",
                          }}
                        >
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: "bold", color: "#6d28d9" }}
                            >
                              Ürün
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", color: "#6d28d9" }}
                            >
                              Birim Fiyat
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", color: "#6d28d9" }}
                            >
                              Adet
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", color: "#6d28d9" }}
                            >
                              Toplam
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  {item.productImage && (
                                    <Box
                                      component="img"
                                      src={`/SupplementImage/${item.productImage}`}
                                      alt={item.productName}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        mr: 2,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                      }}
                                    />
                                  )}
                                  {item.productName}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                {item.unitPrice.toLocaleString("tr-TR", {
                                  style: "currency",
                                  currency: "TRY",
                                })}
                              </TableCell>
                              <TableCell align="right">
                                {item.quantity}
                              </TableCell>
                              <TableCell align="right">
                                {item.totalPrice.toLocaleString("tr-TR", {
                                  style: "currency",
                                  currency: "TRY",
                                })}
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Toplam Satırı */}
                          <TableRow
                            sx={{
                              bgcolor: "rgba(124, 58, 237, 0.05)",
                            }}
                          >
                            <TableCell
                              colSpan={3}
                              align="right"
                              sx={{ fontWeight: "bold" }}
                            >
                              Toplam Tutar:
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: "bold",
                                color: "#7c3aed",
                              }}
                            >
                              {selectedOrder.totalAmount.toLocaleString(
                                "tr-TR",
                                {
                                  style: "currency",
                                  currency: "TRY",
                                }
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={handleCloseOrderDialog}
                sx={{
                  borderColor: "#7c3aed",
                  color: "#7c3aed",
                  "&:hover": {
                    borderColor: "#6d28d9",
                    backgroundColor: "rgba(124, 58, 237, 0.05)",
                  },
                }}
                variant="outlined"
              >
                Kapat
              </Button>

              {selectedOrder.status === "shipped" &&
                selectedOrder.trackingNumber && (
                  <Button
                    sx={{
                      bgcolor: "#7c3aed",
                      "&:hover": {
                        bgcolor: "#6d28d9",
                      },
                    }}
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${selectedOrder.trackingNumber}`}
                    target="_blank"
                  >
                    Kargo Takip
                  </Button>
                )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

const ShoppingIcon = OrderIcon;

export default OrdersPage;
