"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Tooltip,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  KeyboardReturn as ReturnIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import axios from "axios";
import { OrderStatus } from "@prisma/client";

// Sipariş türü
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
}

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
      icon: <LocalShippingIcon fontSize="small" />,
    },
    delivered: {
      label: "Teslim Edildi",
      color: "#66BB6A",
      icon: <ShoppingBagIcon fontSize="small" />,
    },
    completed: {
      label: "Tamamlandı",
      color: "#43A047",
      icon: <CheckIcon fontSize="small" />,
    },
    cancelled: {
      label: "İptal Edildi",
      color: "#E53935",
      icon: <CancelIcon fontSize="small" />,
    },
    returned: {
      label: "İade Edildi",
      color: "#8D6E63",
      icon: <ReturnIcon fontSize="small" />,
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [savingStatus, setSavingStatus] = useState(false);

  // Siparişleri getir
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/orders");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.error("Siparişler yüklenirken hata:", response.data.error);
      }
    } catch (error) {
      console.error("Siparişler yüklenirken bir hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde siparişleri getir
  useEffect(() => {
    fetchOrders();
  }, []);

  // Arama ve filtreleme işlemleri
  const filteredOrders = orders.filter((order) => {
    // Arama filtresi
    const searchMatch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.shippingAddress.firstName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.shippingAddress.lastName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.shippingAddress.email.toLowerCase().includes(search.toLowerCase());

    // Durum filtresi
    const statusMatch = statusFilter === "all" || order.status === statusFilter;

    return searchMatch && statusMatch;
  });

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
    try {
      return format(parseISO(dateString), "dd MMM yyyy, HH:mm", { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  // Para birimi formatını düzenle
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  // Sipariş detaylarını göster
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  // Sipariş durumunu düzenle
  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setEditStatusOpen(true);
  };

  // Sipariş durumunu güncelle
  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    setSavingStatus(true);
    try {
      const response = await axios.put(
        `/api/admin/orders/${selectedOrder.id}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        // Siparişleri güncelle
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, status: newStatus }
              : order
          )
        );
        setEditStatusOpen(false);
      } else {
        console.error(
          "Sipariş durumu güncellenirken hata:",
          response.data.error
        );
      }
    } catch (error) {
      console.error("Sipariş durumu güncellenirken bir hata oluştu:", error);
    } finally {
      setSavingStatus(false);
    }
  };

  // Sipariş durumu Chip bileşeni
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Sipariş Yönetimi
      </Typography>

      {/* Arama ve filtreleme */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Sipariş Ara"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Durum Filtresi</InputLabel>
            <Select
              value={statusFilter}
              label="Durum Filtresi"
              onChange={(e) => setStatusFilter(e.target.value)}
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

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            Yenile
          </Button>
        </Stack>
      </Paper>

      {/* Siparişler tablosu */}
      <Paper>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <LinearProgress sx={{ mb: 2 }} />
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={40} />
              </Box>
            ))}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Sipariş No</TableCell>
                    <TableCell>Müşteri</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.length > 0 ? (
                    displayedOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.shippingAddress.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(order.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <OrderStatusChip status={order.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Sipariş Detayı">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Durum Değiştir">
                            <IconButton
                              size="small"
                              onClick={() => handleEditStatus(order)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {orders.length > 0
                            ? "Filtrelenen sonuç bulunamadı"
                            : "Henüz sipariş bulunmuyor"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count}`
              }
            />
          </>
        )}
      </Paper>

      {/* Sipariş Detay Diyaloğu */}
      <Dialog
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">
                  Sipariş Detayı: {selectedOrder.orderNumber}
                </Typography>
                <OrderStatusChip status={selectedOrder.status} />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Müşteri Bilgileri
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    <strong>Ad Soyad:</strong>{" "}
                    {selectedOrder.shippingAddress.firstName}{" "}
                    {selectedOrder.shippingAddress.lastName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>E-posta:</strong>{" "}
                    {selectedOrder.shippingAddress.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Telefon:</strong>{" "}
                    {selectedOrder.shippingAddress.phone}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Teslimat Adresi
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress.address}
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.postcode}
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress.country}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sipariş Ürünleri
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell align="right">Birim Fiyat</TableCell>
                        <TableCell align="right">Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="subtitle2">Toplam:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sipariş Bilgileri
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    <strong>Sipariş Tarihi:</strong>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Son Güncelleme:</strong>{" "}
                    {formatDate(selectedOrder.updatedAt)}
                  </Typography>
                  {selectedOrder.trackingNumber && (
                    <Typography variant="body2">
                      <strong>Takip Numarası:</strong>{" "}
                      {selectedOrder.trackingNumber}
                    </Typography>
                  )}
                  {selectedOrder.notes && (
                    <Typography variant="body2">
                      <strong>Notlar:</strong> {selectedOrder.notes}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOrderDetailOpen(false)}>Kapat</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOrderDetailOpen(false);
                  handleEditStatus(selectedOrder);
                }}
              >
                Durumu Değiştir
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Sipariş Durumu Düzenleme Diyaloğu */}
      <Dialog
        open={editStatusOpen}
        onClose={() => !savingStatus && setEditStatusOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Sipariş Durumunu Güncelle: {selectedOrder.orderNumber}
            </DialogTitle>
            <DialogContent>
              {savingStatus && <LinearProgress sx={{ mb: 2 }} />}

              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Sipariş Durumu</InputLabel>
                <Select
                  value={newStatus}
                  label="Sipariş Durumu"
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  disabled={savingStatus}
                >
                  <MenuItem value="pending">Beklemede</MenuItem>
                  <MenuItem value="processing">İşleniyor</MenuItem>
                  <MenuItem value="shipped">Kargoya Verildi</MenuItem>
                  <MenuItem value="delivered">Teslim Edildi</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="cancelled">İptal Edildi</MenuItem>
                  <MenuItem value="returned">İade Edildi</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                    sx={{ mr: 1 }}
                  >
                    Mevcut durum:
                  </Typography>
                  <OrderStatusChip status={selectedOrder.status} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setEditStatusOpen(false)}
                disabled={savingStatus}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={updateOrderStatus}
                disabled={savingStatus || newStatus === selectedOrder.status}
              >
                Güncelle
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
