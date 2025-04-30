"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  ShoppingBag,
  LocalShipping,
  Inventory,
  CalendarToday,
  Receipt,
  LocationOn,
  Person,
  Phone,
  Email,
  Home,
  DateRange,
  CheckCircleOutline,
  InfoOutlined,
  Schedule,
  CreditCard,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { toast } from "react-hot-toast";

// Türkçe tarih formatı için
dayjs.locale("tr");
dayjs.extend(relativeTime);

// Sipariş durumu için renk kodları ve etiketler
type StatusColorType =
  | "success"
  | "info"
  | "warning"
  | "primary"
  | "error"
  | "secondary"
  | "default";

const getStatusColor = (status: string): StatusColorType => {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
      return "info";
    case "pending":
      return "warning";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    case "returned":
      return "secondary";
    default:
      return "default";
  }
};

// Sipariş durumu için arkaplan rengi alma
const getStatusBgColor = (theme: any, status: string): string => {
  const colorKey = getStatusColor(status);

  // default rengi için gri tonunu dön
  if (colorKey === "default") {
    return alpha(theme.palette.grey[300], 0.1);
  }

  return alpha(theme.palette[colorKey].main, 0.1);
};

// Sipariş durumu için kenarlık rengi alma
const getStatusBorderColor = (theme: any, status: string): string => {
  const colorKey = getStatusColor(status);

  // default rengi için gri tonunu dön
  if (colorKey === "default") {
    return alpha(theme.palette.grey[300], 0.3);
  }

  return alpha(theme.palette[colorKey].main, 0.3);
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Tamamlandı";
    case "processing":
      return "İşleniyor";
    case "pending":
      return "Beklemede";
    case "shipped":
      return "Kargoya Verildi";
    case "delivered":
      return "Teslim Edildi";
    case "cancelled":
      return "İptal Edildi";
    case "returned":
      return "İade Edildi";
    default:
      return status;
  }
};

// Sipariş öğeleri tablosu
const OrderItems = ({ items }: { items: any[] }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ürün</TableCell>
            <TableCell align="right">Fiyat</TableCell>
            <TableCell align="right">Adet</TableCell>
            <TableCell align="right">Toplam</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell component="th" scope="row">
                {item.productName}
              </TableCell>
              <TableCell align="right">
                {item.unitPrice.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">
                {item.totalPrice.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Ana sipariş sayfası
export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedForOrders, setCheckedForOrders] = useState(false);

  // Sipariş detaylarını aç/kapat
  const handleToggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Siparişleri yeniden yükleme fonksiyonu
  const reloadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/orders");
      setOrders(data);
      setCheckedForOrders(true);
    } catch (error: any) {
      console.error("Siparişler yüklenirken hata:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Siparişleriniz yüklenirken bir hata oluştu";
      setError(errorMessage);
      toast.error(errorMessage);
      setCheckedForOrders(true);
    } finally {
      setLoading(false);
    }
  };

  // Her 10 saniyede bir siparişleri yeniden yükleme (sipariş yoksa ve henüz yeni sipariş verdiyse)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Eğer sipariş yoksa ve tekrar yüklemek gerekiyorsa
    if (checkedForOrders && orders.length === 0 && !error) {
      interval = setInterval(() => {
        reloadOrders();
      }, 10000); // 10 saniyede bir yenile
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkedForOrders, orders.length, error]);

  // Siparişleri yükle
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (status === "loading") return;

        if (status === "unauthenticated") {
          router.push("/login");
          return;
        }

        const { data } = await axios.get("/api/orders");
        setOrders(data);
        setCheckedForOrders(true);
      } catch (error: any) {
        console.error("Siparişler yüklenirken hata:", error);
        const errorMessage =
          error.response?.data?.error ||
          "Siparişleriniz yüklenirken bir hata oluştu";
        setError(errorMessage);
        toast.error(errorMessage);
        setCheckedForOrders(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 8 }}>
      <Box mb={5}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          gutterBottom
          textAlign="center"
        >
          <ShoppingBag
            sx={{
              mr: 1,
              verticalAlign: "sub",
              color: theme.palette.primary.main,
            }}
          />
          Siparişlerim
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ maxWidth: 700, mx: "auto", mb: 5 }}
        >
          Tüm siparişlerinizi buradan takip edebilirsiniz. Sipariş detaylarını
          görüntülemek için siparişinizin üzerine tıklayabilirsiniz.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={reloadOrders}>
              Yeniden Dene
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {orders.length === 0 && !error ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Inventory sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Henüz Siparişiniz Bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {checkedForOrders
              ? "Sipariş verdiğinizde, siparişleriniz burada listelenecektir."
              : "Siparişleriniz yükleniyor veya işleniyor olabilir. Lütfen biraz bekleyin."}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/")}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Alışverişe Başla
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={reloadOrders}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Siparişleri Yenile
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => (
            <Card
              key={order.id}
              elevation={0}
              sx={{
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Sipariş Başlık Kısmı */}
                <Box
                  sx={{
                    p: 3,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 2,
                  }}
                  onClick={() => handleToggleOrderDetails(order.id)}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Sipariş #{order.orderNumber}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CalendarToday fontSize="small" />
                      {dayjs(order.createdAt).format("DD MMMM YYYY, HH:mm")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{ minWidth: 100, textAlign: "right" }}
                    >
                      {order.totalAmount.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOrderDetails(order.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {expandedOrderId === order.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                {/* Sipariş Detayları */}
                <Collapse in={expandedOrderId === order.id}>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Sol Sütun - Ürünler */}
                      <Grid item xs={12} md={8}>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          fontWeight={600}
                          sx={{ mb: 2, display: "flex", alignItems: "center" }}
                        >
                          <Receipt sx={{ mr: 1 }} /> Sipariş Detayları
                        </Typography>
                        <OrderItems items={order.items} />
                      </Grid>

                      {/* Sağ Sütun - Teslimat Bilgileri */}
                      <Grid item xs={12} md={4}>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          fontWeight={600}
                          sx={{ mb: 2, display: "flex", alignItems: "center" }}
                        >
                          <LocationOn sx={{ mr: 1 }} /> Teslimat Bilgileri
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2, mb: 3 }}
                        >
                          <List dense disablePadding>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Person fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                              />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Email fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={order.shippingAddress.email}
                              />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Phone fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`+90 ${order.shippingAddress.phone}`}
                              />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Home fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={order.shippingAddress.address}
                                secondary={`${order.shippingAddress.city}, ${order.shippingAddress.postcode}`}
                              />
                            </ListItem>
                          </List>
                        </Paper>

                        {/* Sipariş Durum Bilgisi */}
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: getStatusBgColor(theme, order.status),
                            border: "1px solid",
                            borderColor: getStatusBorderColor(
                              theme,
                              order.status
                            ),
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          {order.status === "pending" && (
                            <Schedule
                              color="warning"
                              sx={{ mt: 0.5, fontSize: 20 }}
                            />
                          )}
                          {order.status === "processing" && (
                            <InfoOutlined
                              color="info"
                              sx={{ mt: 0.5, fontSize: 20 }}
                            />
                          )}
                          {order.status === "shipped" && (
                            <LocalShipping
                              color="primary"
                              sx={{ mt: 0.5, fontSize: 20 }}
                            />
                          )}
                          {order.status === "delivered" && (
                            <CheckCircleOutline
                              color="success"
                              sx={{ mt: 0.5, fontSize: 20 }}
                            />
                          )}
                          {order.status === "completed" && (
                            <CheckCircleOutline
                              color="success"
                              sx={{ mt: 0.5, fontSize: 20 }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Sipariş Durumu: {getStatusLabel(order.status)}
                            </Typography>
                            {order.trackingNumber && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Takip No: {order.trackingNumber}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <DateRange
                                fontSize="small"
                                sx={{ verticalAlign: "text-bottom", mr: 0.5 }}
                              />
                              {dayjs(order.createdAt).format(
                                "DD MMMM YYYY, HH:mm"
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
