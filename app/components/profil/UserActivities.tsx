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
} from "@mui/icons-material";
import { themeColors } from "./ProfilePage";
import dayjs from "dayjs";
import "dayjs/locale/tr"; // Türkçe tarih formatı için

// Türkçe lokalizasyonu etkinleştir
dayjs.locale("tr");

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
    default: <HistoryIcon />,
  };
  return icons[type] || icons.default;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/api/activities");
      if (response.data.success) {
        setActivities(response.data.data);
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

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
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
        ) : activities.length > 0 ? (
          <List disablePadding>
            {activities.map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: themeColors.primary }}>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
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
                      color="primary"
                      variant="outlined"
                      sx={{ mt: { xs: 0.5, sm: 0 } }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontSize="0.875rem"
                  >
                    {getActivityDescription(activity)}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap", ml: 2, fontSize: "0.75rem" }}
                >
                  {dayjs(activity.date).fromNow()}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="textSecondary" variant="body1">
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
