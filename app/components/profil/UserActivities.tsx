import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from "@mui/material";
import {
  History as HistoryIcon,
  Lock as PasswordIcon,
  Person as ProfileIcon,
  ShoppingCart as OrderIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";
import { themeColors } from "./ProfilePage";
import dayjs from "dayjs";

type Activity = {
  id: string;
  type: string;
  referenceId: string;
  productName: string;
  details: string;
  date: string;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "password_change":
      return <PasswordIcon />;
    case "profile_update":
      return <ProfileIcon />;
    case "order":
      return <OrderIcon />;
    case "review":
      return <ReviewIcon />;
    default:
      return <HistoryIcon />;
  }
};

const getActivityTitle = (activity: Activity) => {
  switch (activity.type) {
    case "password_change":
      return "Şifre Değişikliği";
    case "profile_update":
      return "Profil Güncelleme";
    case "order":
      return `Sipariş #${activity.referenceId}`;
    case "review":
      return `${activity.productName} için yorum`;
    default:
      return "Aktivite";
  }
};

const getActivityDescription = (activity: Activity) => {
  switch (activity.type) {
    case "password_change":
      return "Hesap şifreniz değiştirildi";
    case "profile_update":
      return activity.details;
    case "order":
      return "Yeni sipariş oluşturuldu";
    case "review":
      return "Ürüne yorum yapıldı";
    default:
      return activity.details;
  }
};

const UserActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/api/activities");
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error("Aktivite verisi alınırken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      password_change: "Şifre",
      profile_update: "Profil",
      order: "Sipariş",
      review: "Yorum",
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            color: themeColors.primary,
          }}
        >
          <HistoryIcon sx={{ mr: 1 }} />
          Son Aktiviteler
        </Typography>

        {isLoading ? (
          <Typography>Yükleniyor...</Typography>
        ) : activities.length > 0 ? (
          <List>
            {activities.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemIcon sx={{ minWidth: 40, color: themeColors.primary }}>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body1" fontWeight={500} sx={{ mr: 1 }}>
                      {getActivityTitle(activity)}
                    </Typography>
                    <Chip
                      label={getActivityTypeLabel(activity.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontSize="0.875rem"
                  >
                    {getActivityDescription(activity)}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ whiteSpace: "nowrap", ml: 2 }}
                >
                  {dayjs(activity.date).fromNow()}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <HistoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="textSecondary">
              Henüz aktivite bulunmamaktadır
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivities;
