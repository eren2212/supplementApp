import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Avatar,
  alpha,
  Fade,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  History as HistoryIcon,
  Lock as PasswordIcon,
  Person as ProfileIcon,
  ShoppingCart as OrderIcon,
  RateReview as ReviewIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { themeColors } from "./ProfilePage";
import dayjs from "dayjs";
import "dayjs/locale/tr"; // Türkçe tarih formatı için
import relativeTime from "dayjs/plugin/relativeTime";

// Türkçe lokalizasyonu etkinleştir
dayjs.locale("tr");
dayjs.extend(relativeTime);

type Activity = {
  id: string;
  type: string;
  referenceId: string;
  productName: string;
  description: string;
  date: string;
};

// Aktivite ikonlarını belirleme
const getActivityIcon = (type: string) => {
  const icons: Record<string, React.ReactElement> = {
    password_change: <PasswordIcon />,
    profile_update: <ProfileIcon />,
    phone_update: <PhoneIcon />,
    address_update: <LocationIcon />,
    order: <OrderIcon />,
    review: <ReviewIcon />,
    login: <HistoryIcon />,
    logout: <HistoryIcon />,
    default: <HistoryIcon />,
  };
  return icons[type] || icons.default;
};

// Aktivite renklerini belirleme
const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    password_change: "#FFA726", // Turuncu
    profile_update: "#42A5F5", // Mavi
    phone_update: "#66BB6A", // Yeşil
    address_update: "#7E57C2", // Mor
    order: "#EC407A", // Pembe
    review: "#26A69A", // Turkuaz
    login: "#5C6BC0", // Indigo
    logout: "#78909C", // Gri-Mavi
    default: "#9E9E9E", // Gri
  };
  return colors[type] || colors.default;
};

// Aktivite başlıklarını Türkçe olarak belirleme
const getActivityTitle = (activity: Activity) => {
  const titles: Record<string, string> = {
    password_change: "Şifre Değişikliği",
    profile_update: "Profil Bilgileri Güncellendi",
    phone_update: "Telefon Numarası Güncellendi",
    address_update: "Adres Güncellendi",
    order: `Sipariş Oluşturuldu (#${activity.referenceId})`,
    review: `${activity.productName} Ürün Yorumu`,
    login: "Giriş Yapıldı",
    logout: "Çıkış Yapıldı",
    default: "Sistem Aktivitesi",
  };
  return titles[activity.type] || titles.default;
};

// Aktivite açıklamalarını Türkçe olarak belirleme
const getActivityDescription = (activity: Activity) => {
  const descriptions: Record<string, string> = {
    password_change: "Hesap şifreniz başarıyla güncellendi",
    profile_update: activity.description || "Profil bilgileriniz değiştirildi",
    phone_update: activity.description || "Telefon numaranız güncellendi",
    address_update: activity.description || "Adresiniz güncellendi",
    order: "Yeni siparişiniz oluşturuldu",
    review: activity.description || "Ürüne yorum yapıldı",
    login: "Hesabınıza giriş yapıldı",
    logout: "Hesabınızdan çıkış yapıldı",
    default: activity.description || "Sistem aktivitesi gerçekleşti",
  };
  return descriptions[activity.type] || descriptions.default;
};

// Aktivite türü etiketlerini Türkçe yapma
const getActivityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    password_change: "Güvenlik",
    profile_update: "Profil",
    phone_update: "Profil",
    address_update: "Profil",
    order: "Sipariş",
    review: "Yorum",
    login: "Giriş",
    logout: "Çıkış",
    default: "Genel",
  };
  return labels[type] || labels.default;
};

const UserActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<number>(5); // Varsayılan 5 gün

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/api/activities");
      if (response.data.success) {
        setActivities(response.data.data);
        applyFilters(response.data.data, searchQuery, filterType, timeRange);
      } else {
        setError("Aktiviteler alınırken bir sorun oluştu");
      }
    } catch (error) {
      console.error("Aktivite verisi alınırken hata:", error);
      setError("Aktiviteler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Tüm filtreleri uygula
  const applyFilters = (
    data: Activity[],
    query: string,
    type: string,
    days: number
  ) => {
    // Zaman filtreleme
    const cutoffDate = dayjs().subtract(days, "day").toDate();

    let result = data.filter((activity) =>
      dayjs(activity.date).isAfter(cutoffDate)
    );

    // Tür filtreleme
    if (type !== "all") {
      result = result.filter((activity) => activity.type === type);
    }

    // Arama filtreleme
    if (query.trim() !== "") {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        (activity) =>
          getActivityTitle(activity).toLowerCase().includes(lowercaseQuery) ||
          getActivityDescription(activity)
            .toLowerCase()
            .includes(lowercaseQuery) ||
          (activity.referenceId &&
            activity.referenceId.toLowerCase().includes(lowercaseQuery)) ||
          (activity.productName &&
            activity.productName.toLowerCase().includes(lowercaseQuery))
      );
    }

    setFilteredActivities(result);
  };

  // Arama değiştiğinde filtrele
  useEffect(() => {
    applyFilters(activities, searchQuery, filterType, timeRange);
  }, [searchQuery, filterType, timeRange]);

  // Aktiviteleri günlere göre grupla
  const groupActivitiesByDay = () => {
    const grouped: Record<string, Activity[]> = {};

    filteredActivities.forEach((activity) => {
      const day = dayjs(activity.date).format("YYYY-MM-DD");
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(activity);
    });

    return grouped;
  };

  const groupedActivities = groupActivitiesByDay();
  const sortedDays = Object.keys(groupedActivities).sort().reverse();

  // Filtreleme seçenekleri
  const filterOptions = [
    { value: "all", label: "Tümü" },
    { value: "password_change", label: "Şifre Değişikliği" },
    { value: "profile_update", label: "Profil Güncelleme" },
    { value: "phone_update", label: "Telefon Güncelleme" },
    { value: "address_update", label: "Adres Güncelleme" },
    { value: "order", label: "Sipariş" },
    { value: "review", label: "Yorum" },
    { value: "login", label: "Giriş" },
    { value: "logout", label: "Çıkış" },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            color: themeColors.primary,
            fontWeight: 600,
          }}
        >
          <HistoryIcon sx={{ mr: 1.5, fontSize: 28 }} />
          Kullanıcı Aktivite Geçmişi
        </Typography>

        {!isLoading && !error && (
          <Box sx={{ mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                mb: 2,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Aktivitelerde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Aktivite Türü</InputLabel>
                    <Select
                      value={filterType}
                      label="Aktivite Türü"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      {filterOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Zaman Aralığı</InputLabel>
                    <Select
                      value={timeRange}
                      label="Zaman Aralığı"
                      onChange={(e) => setTimeRange(Number(e.target.value))}
                    >
                      <MenuItem value={1}>Son 1 gün</MenuItem>
                      <MenuItem value={3}>Son 3 gün</MenuItem>
                      <MenuItem value={5}>Son 5 gün</MenuItem>
                      <MenuItem value={7}>Son 7 gün</MenuItem>
                      <MenuItem value={14}>Son 14 gün</MenuItem>
                      <MenuItem value={30}>Son 30 gün</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Paper>

            {filteredActivities.length === 0 && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={3}
              >
                <FilterIcon
                  sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
                />
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Seçili filtrelere uygun aktivite bulunamadı
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={4}
            color="error.main"
          >
            <WarningIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography>{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Lütfen daha sonra tekrar deneyin
            </Typography>
          </Box>
        ) : filteredActivities.length > 0 ? (
          <Box>
            {sortedDays.map((day, index) => (
              <Fade
                in={true}
                key={day}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      fontWeight: 500,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {dayjs(day).format("D MMMM YYYY, dddd")}
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      overflow: "hidden",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {groupedActivities[day].map((activity, idx) => (
                      <React.Fragment key={activity.id}>
                        <Box
                          sx={{
                            display: "flex",
                            p: 2,
                            position: "relative",
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(
                                getActivityColor(activity.type),
                                0.2
                              ),
                              color: getActivityColor(activity.type),
                              mr: 2,
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </Avatar>

                          <Box sx={{ flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                sx={{ mr: 1 }}
                              >
                                {getActivityTitle(activity)}
                              </Typography>
                              <Chip
                                label={getActivityTypeLabel(activity.type)}
                                size="small"
                                sx={{
                                  mt: { xs: 0.5, sm: 0 },
                                  bgcolor: alpha(
                                    getActivityColor(activity.type),
                                    0.1
                                  ),
                                  color: getActivityColor(activity.type),
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontSize="0.875rem"
                              sx={{ mt: 0.5 }}
                            >
                              {getActivityDescription(activity)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              whiteSpace: "nowrap",
                              ml: 2,
                              fontSize: "0.75rem",
                              alignSelf: "flex-start",
                              mt: 0.5,
                            }}
                          >
                            {dayjs(activity.date).format("HH:mm")}
                          </Typography>
                        </Box>
                        {idx < groupedActivities[day].length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Paper>
                </Box>
              </Fade>
            ))}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <Avatar
              sx={{
                bgcolor: alpha(themeColors.primary, 0.1),
                color: themeColors.primary,
                width: 80,
                height: 80,
                mb: 2,
              }}
            >
              <HistoryIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography color="textSecondary" variant="body1" fontWeight={500}>
              Henüz kayıtlı aktivite bulunmamaktadır
            </Typography>
            <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
              Gerçekleştirdiğiniz işlemler burada görünecektir
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivities;
