"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Box,
  Skeleton,
  ThemeProvider,
  createTheme,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  Security,
  Inventory,
  Menu as MenuIcon,
  ChevronLeft,
  Home,
  Notifications,
  Email,
  AccountCircle,
  Settings,
  MonetizationOn,
  People,
  TrendingUp,
  Palette,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { InfoOutlined, ArrowForward } from "@mui/icons-material";
// Tema ayarları
const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "0.5px",
        },
      },
    },
  },
});

// Yan menü öğeleri
const sidebarItems = [
  { name: "Panel", href: "/admin", icon: <Dashboard /> },
  { name: "Takviyeler", href: "/admin/supplements", icon: <Inventory /> },
  { name: "Ürünler", href: "/admin/products", icon: <Inventory /> },
  { name: "Siparişler", href: "/admin/orders", icon: <ShoppingCart /> },
  { name: "Müşteriler", href: "/admin/customers", icon: <People /> },
  { name: "Yetkilendirme", href: "/admin/auth", icon: <Security /> },
  { name: "Siteye Dön", href: "/", icon: <Home /> },
];

const data = [
  { name: "Ocak", sales: 4000 },
  { name: "Şubat", sales: 3000 },
  { name: "Mart", sales: 5000 },
  { name: "Nisan", sales: 7000 },
  { name: "Mayıs", sales: 6000 },
];
// Sabit istatistik verileri (hydration hatalarını önlemek için)
const stats = [
  {
    label: "Toplam Sipariş",
    value: "1.240",
    icon: <ShoppingCart color="primary" />,
    trend: "+12%",
  },
  {
    label: "Toplam Gelir",
    value: "89.500 ₺",
    icon: <MonetizationOn color="success" />,
    trend: "+24%",
  },
  {
    label: "Yeni Ürünler",
    value: "28",
    icon: <Inventory color="info" />,
    trend: "+5%",
  },
  {
    label: "Aktif Kullanıcılar",
    value: "1.482",
    icon: <People color="warning" />,
    trend: "+8%",
  },
];

// Son aktiviteler
const recentActivities = [
  {
    id: 1,
    user: "Ahmet Yılmaz",
    action: "yeni sipariş oluşturdu",
    time: "5 dakika önce",
  },
  {
    id: 2,
    user: "Ayşe Kaya",
    action: "yeni müşteri olarak kaydoldu",
    time: "12 dakika önce",
  },
  {
    id: 3,
    user: "Mehmet Demir",
    action: "premium paket satın aldı",
    time: "23 dakika önce",
  },
  {
    id: 4,
    user: "Zeynep Şahin",
    action: "iade talebi oluşturdu",
    time: "42 dakika önce",
  },
];

// En iyi ürünler
const topProducts = [
  { name: "Lüks Saat", price: "5.999,99 ₺" },
  { name: "Tasarım Çanta", price: "3.999,99 ₺" },
  { name: "Premium Parfüm", price: "1.999,99 ₺" },
  { name: "İpek Eşarp", price: "1.299,99 ₺" },
];

// Özelleştirilmiş kart bileşeni
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const AdminDashboard = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration hatalarını önlemek için
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Skeleton variant="rectangular" width={256} height="100%" />
        <div className="flex-1 p-6">
          <Skeleton variant="text" width={200} height={40} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={150} />
            ))}
          </div>
          <Skeleton variant="rectangular" height={300} className="mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={300} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-gray-50">
        {/* Yan Menü */}
        <div
          className={`bg-indigo-700 text-white transition-all duration-300 ease-in-out flex flex-col ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            {!collapsed && (
              <Typography variant="h6" className="tracking-wide font-bold">
                Admin Panel
              </Typography>
            )}
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              className="text-white"
            >
              {collapsed ? <MenuIcon /> : <ChevronLeft />}
            </IconButton>
          </div>

          <Divider className="bg-white bg-opacity-20" />

          <div className="p-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center p-2 my-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white bg-opacity-20"
                      : "hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      collapsed ? "justify-center w-full" : ""
                    }`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {!collapsed && (
            <div className="mt-auto w-full">
              <Divider className="my-4 bg-white bg-opacity-20" />
              <div className="flex items-center p-2 rounded-lg hover:bg-opacity-10 cursor-pointer">
                <AccountCircle className="text-white mr-3" />
                <div>
                  <Typography
                    variant="body2"
                    className="text-white font-medium"
                  >
                    Admin Kullanıcı
                  </Typography>
                  <Typography variant="caption" className="text-gray-300">
                    Süper Yönetici
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Üst Menü */}
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <Typography variant="h5" className="font-serif">
              Panel Genel Bakış
            </Typography>

            <div className="flex items-center space-x-4">
              <Tooltip title="Bildirimler">
                <IconButton aria-label="Bildirimler">
                  <Notifications />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mesajlar">
                <IconButton aria-label="Mesajlar">
                  <Email />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ayarlar">
                <IconButton aria-label="Ayarlar">
                  <Settings />
                </IconButton>
              </Tooltip>
              <Avatar alt="Admin Kullanıcı" src="/images/avatar.jpg" />
            </div>
          </header>

          {/* İçerik */}
          <div className="flex-1 overflow-auto p-6">
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map(({ label, value, icon, trend }, index) => (
                <StyledCard key={index}>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div>
                        <Typography variant="subtitle2" color="textSecondary">
                          {label}
                        </Typography>
                        <Typography variant="h4" className="mt-1 font-serif">
                          {value}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            trend.startsWith("+")
                              ? "success.main"
                              : "error.main"
                          }
                          className="flex items-center mt-1"
                        >
                          <TrendingUp fontSize="inherit" className="mr-1" />
                          {trend} geçen haftaya göre
                        </Typography>
                      </div>
                      <div className="p-3 rounded-full bg-indigo-50">
                        {icon}
                      </div>
                    </div>
                  </CardContent>
                </StyledCard>
              ))}
            </div>

            {/* Son Aktiviteler */}
            <StyledCard className="mb-8">
              <CardContent>
                <Typography variant="h5" className="mb-4 font-serif">
                  Son Aktiviteler
                </Typography>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <Avatar className="mr-3 bg-indigo-100 text-indigo-600">
                        {activity.user.charAt(0)}
                      </Avatar>
                      <div>
                        <Typography variant="body2">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.time}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </StyledCard>

            {/* Hızlı İstatistikler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StyledCard>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h5" className="font-serif">
                      Satış Dağılımı
                    </Typography>
                    <Tooltip title="Kategorilere göre satış yüzdeleri">
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>

                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Elektronik", value: 35 },
                              { name: "Giyim", value: 25 },
                              { name: "Ev Eşyaları", value: 20 },
                              { name: "Kozmetik", value: 15 },
                              { name: "Diğer", value: 5 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              "#6366F1",
                              "#8B5CF6",
                              "#EC4899",
                              "#F59E0B",
                              "#10B981",
                            ].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value, name, props) => [
                              `${value}%`,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0 md:pl-4">
                      {[
                        { name: "Elektronik", value: 35, color: "#6366F1" },
                        { name: "Giyim", value: 25, color: "#8B5CF6" },
                        { name: "Ev Eşyaları", value: 20, color: "#EC4899" },
                        { name: "Kozmetik", value: 15, color: "#F59E0B" },
                        { name: "Diğer", value: 5, color: "#10B981" },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <Typography variant="body2" className="font-medium">
                              {item.name}
                            </Typography>
                          </div>
                          <Typography variant="body2" color="text.secondary">
                            {item.value}%
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                      fullWidth
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForward />}
                      className="hover:bg-indigo-50"
                    >
                      Detaylı Rapor
                    </Button>
                  </div>
                </CardContent>
              </StyledCard>

              <StyledCard>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h5" className="font-serif">
                      En Çok Satanlar
                    </Typography>
                    <Tooltip title="Son 30 günün en çok satan ürünleri">
                      <IconButton size="small">
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>

                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 mr-3">
                          <Avatar
                            sx={{
                              bgcolor:
                                index % 2 === 0 ? "indigo.100" : "purple.100",
                              color:
                                index % 2 === 0 ? "indigo.600" : "purple.600",
                              width: 40,
                              height: 40,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography
                            variant="subtitle2"
                            noWrap
                            className="font-medium"
                          >
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {Math.floor(100000 + Math.random() * 900000)}
                          </Typography>
                        </div>
                        <div className="ml-3 text-right">
                          <Typography color="primary" fontWeight="bold">
                            {product.price}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="flex items-center justify-end"
                          >
                            <TrendingUp
                              fontSize="inherit"
                              className="mr-1 text-green-500"
                            />
                            {Math.floor(10 + Math.random() * 20)}% artış
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                      fullWidth
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForward />}
                    >
                      Tümünü Görüntüle
                    </Button>
                  </div>
                </CardContent>
              </StyledCard>

              <StyledCard>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <Typography
                      variant="h5"
                      className="font-serif text-gray-800"
                    >
                      Hızlı Eylemler
                    </Typography>
                    <Chip
                      label="Premium"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Özelleştir Butonu */}
                    <Button
                      variant="contained"
                      startIcon={<Palette sx={{ fontSize: "1.2rem" }} />}
                      fullWidth
                      sx={{
                        height: 90,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #5a6fd1 0%, #6a4399 100%)",
                          boxShadow: "0 6px 8px rgba(102, 126, 234, 0.4)",
                        },
                      }}
                    >
                      <div className="text-left">
                        <Typography
                          variant="subtitle2"
                          className="text-white font-medium"
                        >
                          Özelleştir
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-white opacity-80"
                        >
                          Tema Ayarları
                        </Typography>
                      </div>
                    </Button>

                    {/* Kullanıcılar Butonu */}
                    <Button
                      variant="contained"
                      startIcon={<People sx={{ fontSize: "1.2rem" }} />}
                      fullWidth
                      sx={{
                        height: 90,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #0da271 0%, #047852 100%)",
                          boxShadow: "0 6px 8px rgba(16, 185, 129, 0.4)",
                        },
                      }}
                    >
                      <div className="text-left">
                        <Typography
                          variant="subtitle2"
                          className="text-white font-medium"
                        >
                          Kullanıcılar
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-white opacity-80"
                        >
                          Yönetim Paneli
                        </Typography>
                      </div>
                    </Button>

                    {/* Envanter Butonu */}
                    <Button
                      variant="contained"
                      startIcon={<Inventory sx={{ fontSize: "1.2rem" }} />}
                      fullWidth
                      sx={{
                        height: 90,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #dd8d0a 0%, #c26b05 100%)",
                          boxShadow: "0 6px 8px rgba(245, 158, 11, 0.4)",
                        },
                      }}
                    >
                      <div className="text-left">
                        <Typography
                          variant="subtitle2"
                          className="text-white font-medium"
                        >
                          Envanter
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-white opacity-80"
                        >
                          Stok Takibi
                        </Typography>
                      </div>
                    </Button>

                    {/* Ayarlar Butonu */}
                    <Button
                      variant="contained"
                      startIcon={<Settings sx={{ fontSize: "1.2rem" }} />}
                      fullWidth
                      sx={{
                        height: 90,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        boxShadow: "0 4px 6px rgba(239, 68, 68, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #dc3c3c 0%, #c22121 100%)",
                          boxShadow: "0 6px 8px rgba(239, 68, 68, 0.4)",
                        },
                      }}
                    >
                      <div className="text-left">
                        <Typography
                          variant="subtitle2"
                          className="text-white font-medium"
                        >
                          Ayarlar
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-white opacity-80"
                        >
                          Sistem Ayarları
                        </Typography>
                      </div>
                    </Button>
                  </div>

                  <div className="mt-4 text-center">
                    <Typography variant="caption" color="text.secondary">
                      Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
                    </Typography>
                  </div>
                </CardContent>
              </StyledCard>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
