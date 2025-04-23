"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import VisibilityIcon from "@mui/icons-material/Visibility";

export type OrderStatus = "completed" | "processing" | "pending" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: OrderStatus;
  products: number;
};

type RecentOrdersProps = {
  orders: Order[];
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  // Sipariş durumu için renk kodları
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Sipariş durumu için etiketler
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "processing":
        return "İşleniyor";
      case "pending":
        return "Beklemede";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  // Tarih biçimlendirme
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy HH:mm", { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  // Para birimi biçimlendirme
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  // Müşteri ismine göre profil resmi oluşturma
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 650 }} aria-label="recent orders table">
        <TableHead>
          <TableRow>
            <TableCell>Sipariş No</TableCell>
            <TableCell>Müşteri</TableCell>
            <TableCell>Tarih</TableCell>
            <TableCell>Ürün Sayısı</TableCell>
            <TableCell>Tutar</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell align="right">İşlem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {order.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1.5,
                      bgcolor: "primary.main",
                    }}
                  >
                    {getInitials(order.customerName)}
                  </Avatar>
                  <Typography variant="body2">{order.customerName}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(order.date)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.products}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(order.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Detayları Görüntüle">
                  <IconButton size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentOrders;
