"use client";

import React, { useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  TrendingUp,
  People,
  Warning,
  Receipt,
  Inventory,
  LocalShipping,
  MonetizationOn,
  CheckCircle,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminStore } from "@/app/store/adminStore";
import axios from "axios";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  height: "100%",
}));

const GradientCard = styled(StyledCard)<{
  gradientstart: string;
  gradientend: string;
}>(({ gradientstart, gradientend, theme }) => ({
  background: `linear-gradient(135deg, ${gradientstart} 0%, ${gradientend} 100%)`,
  color: "white",
  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 5,
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderWidth: 0,
    },
    "&:hover fieldset": {
      borderWidth: 0,
    },
    "&.Mui-focused fieldset": {
      borderWidth: 0,
    },
  },
}));

const StatCard = ({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <GradientCard gradientstart={color} gradientend={`${color}dd`}>
      <CardContent sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: -5,
            right: -5,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ my: 1, fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.2)",
            width: "fit-content",
            px: 1,
            py: 0.5,
            borderRadius: 5,
          }}
        >
          <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
          {change}
        </Typography>
      </CardContent>
    </GradientCard>
  );
};

// Generate random data for charts
const generateRandomData = () => ({
  weekly: Array.from({ length: 7 }, (_, i) => ({
    name: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][i],
    value: Math.floor(Math.random() * 5000) + 1000,
  })),
  monthly: Array.from({ length: 12 }, (_, i) => ({
    name: i + 1,
    value: Math.floor(Math.random() * 10000) + 2000,
  })),
});

// Main component
const AdminPage = () => {
  const { dashboardData, fetchDashboardData } = useAdminStore();
  const [chartData, setChartData] = React.useState(generateRandomData());
  const [salesData, setSalesData] = React.useState<any[]>([]);
  const [categoryData, setCategoryData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated and is an admin
        const response = await axios.get("/api/auth/session");
        if (!response.data?.user || response.data?.user?.role !== "ADMIN") {
          // Redirect to home page if not authenticated or not an admin
          window.location.href = "/";
          return;
        }

        await fetchDashboardData();

        // Fetch additional data
        const statsResponse = await axios.get("/api/admin/statistics");
        if (statsResponse.data) {
          setSalesData(statsResponse.data.salesData || []);
          setCategoryData(statsResponse.data.categoryData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Redirect to home page if there's any authentication error
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchDashboardData]);

  // Colors for the pie chart
  const COLORS = [
    "#6342D8",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#A855F7",
  ];

  // Dummy data for recent activities
  const recentActivities = [
    {
      id: 1,
      user: "Ahmet Yılmaz",
      action: "yeni sipariş oluşturdu",
      time: "5 dakika önce",
      avatar: "/avatar1.jpg",
    },
    {
      id: 2,
      user: "Ayşe Kaya",
      action: "yeni müşteri olarak kaydoldu",
      time: "12 dakika önce",
      avatar: "/avatar2.jpg",
    },
    {
      id: 3,
      user: "Mehmet Demir",
      action: "premium paket satın aldı",
      time: "23 dakika önce",
      avatar: "/avatar3.jpg",
    },
    {
      id: 4,
      user: "Zeynep Şahin",
      action: "iade talebi oluşturdu",
      time: "42 dakika önce",
      avatar: "/avatar4.jpg",
    },
  ];

  // Fallback data if API doesn't return data
  const fallbackData = {
    stats: [
      {
        title: "Toplam Gelir",
        value: "₺148.924",
        change: "+12.5%",
        icon: <MonetizationOn />,
        color: "#6342D8",
      },
      {
        title: "Siparişler",
        value: "1,245",
        change: "+8.2%",
        icon: <Receipt />,
        color: "#10B981",
      },
      {
        title: "Stok Ürünler",
        value: "284",
        change: "+3.7%",
        icon: <Inventory />,
        color: "#F59E0B",
      },
      {
        title: "Yeni Müşteriler",
        value: "3,842",
        change: "+14.6%",
        icon: <People />,
        color: "#EC4899",
      },
    ],
    recentOrders: [
      {
        id: "ORD-5142",
        customer: "Ali Yılmaz",
        amount: "₺1,245",
        status: "Tamamlandı",
      },
      {
        id: "ORD-5141",
        customer: "Zeynep Demir",
        amount: "₺845",
        status: "İşlemde",
      },
      {
        id: "ORD-5140",
        customer: "Ahmet Kaya",
        amount: "₺1,845",
        status: "Tamamlandı",
      },
      {
        id: "ORD-5139",
        customer: "Ayşe Şahin",
        amount: "₺645",
        status: "Beklemede",
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="medium">
          Hoş Geldiniz 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Admin paneli gösterge tablosunuza genel bir bakış.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {fallbackData.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activity Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Gelir İstatistikleri</Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: (theme) => theme.palette.primary.main,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                Aylık
              </Button>
            </Box>

            <Box sx={{ height: 300, flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.monthly}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6342D8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6342D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₺${value}`}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.2}
                  />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6342D8"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Son Aktiviteler
            </Typography>

            <List sx={{ px: 0 }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={activity.avatar} alt={activity.user}>
                        {activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" component="span">
                          {activity.user}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            component="span"
                          >
                            {activity.action}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                          >
                            {activity.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Bottom Row: Category Distribution and Recent Orders */}
      <Grid container spacing={3}>
        {/* Category Distribution */}
        <Grid item xs={12} md={5}>
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Kategori Dağılımı
            </Typography>

            <Box
              sx={{ height: 280, display: "flex", justifyContent: "center" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Protein", value: 35 },
                      { name: "Vitamin", value: 25 },
                      { name: "Amino Asit", value: 20 },
                      { name: "Kreatin", value: 15 },
                      { name: "Diğer", value: 5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.5;
                      const x =
                        cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y =
                        cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#999"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={12}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {[
                      { name: "Protein", value: 35 },
                      { name: "Vitamin", value: 25 },
                      { name: "Amino Asit", value: 20 },
                      { name: "Kreatin", value: 15 },
                      { name: "Diğer", value: 5 },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              {[
                { name: "Protein", color: COLORS[0] },
                { name: "Vitamin", color: COLORS[1] },
                { name: "Amino Asit", color: COLORS[2] },
                { name: "Kreatin", color: COLORS[3] },
                { name: "Diğer", color: COLORS[4] },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mx: 1, mb: 1 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      mr: 0.5,
                    }}
                  />
                  <Typography variant="caption">{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </StyledPaper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <StyledPaper>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Son Siparişler</Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  borderColor: (theme) => theme.palette.primary.main,
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                Tümünü Gör
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                  tableLayout: "fixed",
                }}
              >
                <Box component="thead">
                  <Box
                    component="tr"
                    sx={{
                      "& th": {
                        fontWeight: 500,
                        color: "text.secondary",
                        fontSize: 14,
                      },
                    }}
                  >
                    <Box
                      component="th"
                      sx={{ textAlign: "left", pb: 2, width: "20%" }}
                    >
                      Sipariş No
                    </Box>
                    <Box
                      component="th"
                      sx={{ textAlign: "left", pb: 2, width: "35%" }}
                    >
                      Müşteri
                    </Box>
                    <Box
                      component="th"
                      sx={{ textAlign: "right", pb: 2, width: "25%" }}
                    >
                      Tutar
                    </Box>
                    <Box
                      component="th"
                      sx={{ textAlign: "right", pb: 2, width: "20%" }}
                    >
                      Durum
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {fallbackData.recentOrders.map((order) => (
                    <Box
                      component="tr"
                      key={order.id}
                      sx={{
                        backgroundColor: "background.paper",
                        "& td": { py: 2 },
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          cursor: "pointer",
                        },
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          pl: 2,
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                        }}
                      >
                        {order.id}
                      </Box>
                      <Box component="td">{order.customer}</Box>
                      <Box component="td" sx={{ textAlign: "right" }}>
                        {order.amount}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          textAlign: "right",
                          pr: 2,
                          borderTopRightRadius: 8,
                          borderBottomRightRadius: 8,
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 500,
                            textAlign: "center",
                            backgroundColor:
                              order.status === "Tamamlandı"
                                ? "rgba(16, 185, 129, 0.1)"
                                : order.status === "İşlemde"
                                ? "rgba(99, 102, 241, 0.1)"
                                : "rgba(245, 158, 11, 0.1)",
                            color:
                              order.status === "Tamamlandı"
                                ? "#10B981"
                                : order.status === "İşlemde"
                                ? "#6366F1"
                                : "#F59E0B",
                          }}
                        >
                          {order.status}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPage;
