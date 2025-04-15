"use client";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import AccountDeleteButon from "./AccountDeleteButon";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Divider,
  Button,
  Skeleton,
  IconButton,
  TextField,
  useTheme,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  CreditCard as PaymentIcon,
  ShoppingCart as OrderIcon,
  Star as StarIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserActivities from "./UserActivities";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export const themeColors = {
  primary: "#7c3aed",
  secondary: "#a78bfa",
  background: "#f8f5ff",
  text: "#373062",
  accent: "#facc15",
  success: "#4ade80",
  info: "#60a5fa",
  warning: "#fbbf24",
  error: "#f87171",
};

const theme = createTheme({
  palette: {
    primary: { main: themeColors.primary },
    secondary: { main: themeColors.secondary },
    text: {
      primary: themeColors.text,
      secondary: "#6b6b9c",
    },
    background: { default: themeColors.background },
    success: { main: themeColors.success },
    info: { main: themeColors.info },
    warning: { main: themeColors.warning },
    error: { main: themeColors.error },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2.2rem",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.8rem",
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.3rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  },
});

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  borderRadius: "24px",
  boxShadow: "0px 20px 60px rgba(124, 58, 237, 0.15)",
  background: `linear-gradient(145deg, #ffffff 0%, ${themeColors.background} 100%)`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: `linear-gradient(90deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  background: "white",
  borderLeft: `4px solid ${themeColors.primary}`,
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: "8px",
  marginBottom: theme.spacing(1),
  background: "rgba(255, 255, 255, 0.7)",
  "&:hover": {
    background: "rgba(124, 58, 237, 0.05)",
  },
}));

interface UserData {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  image?: string | null;
  role?: string;
  joinDate?: string;
  ordersCount?: number;
  reviewsCount?: number;
  lastOrderDate?: string;
  paymentMethods?: number;
}

interface Activity {
  id: string;
  type: "order" | "review" | "account";
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

interface EditableFieldProps {
  label: string;
  value: string;
  onEdit: (value: string) => Promise<void>;
  editable?: boolean;
  icon?: React.ReactNode;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onEdit,
  editable = true,
  icon,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setFieldError(null);
    try {
      await onEdit(fieldValue);
      setIsEditing(false);

      // Aktivite kaydı ekleme
    } catch (error: any) {
      console.error("Error saving field:", error);
      setFieldError(error.message || "Alan güncellenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      {icon && (
        <Box sx={{ color: themeColors.primary, display: "flex" }}>{icon}</Box>
      )}
      {isEditing ? (
        <>
          <TextField
            size="small"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={isLoading}
            error={!!fieldError}
            helperText={fieldError}
            sx={{ flexGrow: 1 }}
          />
          <Button
            onClick={handleSave}
            size="small"
            color="primary"
            variant="contained"
            disabled={isLoading}
            sx={{
              ml: 1,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setFieldValue(value);
            }}
            size="small"
            color="secondary"
            variant="outlined"
            disabled={isLoading}
            sx={{
              ml: 1,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            İptal
          </Button>
        </>
      ) : (
        <>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: "0.75rem", mb: 0.5 }}
            >
              {label}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: value
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
              }}
            >
              {value || "Belirtilmemiş"}
            </Typography>
          </Box>
          {editable && (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              sx={{
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                },
              }}
            >
              <EditIcon fontSize="small" sx={{ color: themeColors.primary }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};

const PasswordDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => void;
  isLoading: boolean;
  error: string | null;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(currentPassword, newPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: themeColors.primary,
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <LockIcon sx={{ mr: 1 }} />
        Şifre Güncelle
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          fullWidth
          label="Mevcut Şifre"
          type="password"
          margin="normal"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Yeni Şifre"
          type="password"
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="En az 8 karakter, bir büyük harf, bir küçük harf ve bir sayı içermeli"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: "8px" }}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          sx={{
            backgroundColor: themeColors.primary,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: themeColors.secondary,
            },
          }}
        >
          {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const theme = useTheme();
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
    address: null,
    phone: null,
    image: null,
    role: "CUSTOMER",
    joinDate: new Date().toISOString(),
    ordersCount: 0,
    reviewsCount: 0,
    paymentMethods: 0,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(
    null
  );
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(
    null
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const api = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const isOAuthUser = !(session?.user?.provider === "credentials");
  console.log(isOAuthUser);
  const fetchProfile = async () => {
    if (status === "authenticated") {
      setIsLoadingProfile(true);
      try {
        // Session'dan temel bilgileri al
        setUserData({
          id: session.user?.id || " ",
          name: session.user?.name || "",
          email: session.user?.email || "",
          address: session.user?.address || null,
          phone:
            "phone" in session.user ? (session.user.phone as string) : null, // 📌 Telefon numarası da ekleniyor
          image: session.user?.image || null,
          role: session.user?.role || "CUSTOMER",
          joinDate: session.user?.joinDate || new Date().toISOString(),
        });

        // Ek bilgiler için API'ye istek at
        const response = await api.get("/profile");
        if (response.data?.data) {
          setUserData((prev) => ({
            ...prev,
            ...response.data.data,
          }));
        }
      } catch (error: any) {
        console.error("Profil bilgileri alınırken hata:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [status, session]);

  const handleEditField = (field: keyof UserData) => async (value: string) => {
    setProfileUpdateError(null);
    try {
      // Telefon numarası için özel doğrulama
      if (field === "phone" && value && !/^\d{10,15}$/.test(value)) {
        setProfileUpdateError(
          "Telefon numarası 10-15 hane arasında olmalıdır."
        );
        toast.error("Geçersiz telefon numarası");
        return;
      }

      const { data } = await api.post("/profile", { [field]: value });

      setUserData((prev) => ({ ...prev, [field]: value }));

      await update({
        ...session,
        user: {
          ...session?.user,
          [field]: value,
        },
      });

      toast.success("Profil bilgileri başarıyla güncellendi");

      // Profil güncelleme aktivitesi kaydet
      const fieldNames: Record<string, string> = {
        name: "İsim",
        phone: "Telefon",
        address: "Adres",
      };

      // Aktivite tipini belirle
      let activityType: string = "PROFILE_UPDATE";
      if (field === "phone") {
        activityType = "PHONE_UPDATE";
      } else if (field === "address") {
        activityType = "ADDRESS_UPDATE";
      }

      // Aktivite kaydı oluştur
      await api.post("/activities", {
        type: activityType,
        details: `${fieldNames[field]} güncellendi: ${value}`,
      });

      return data;
    } catch (error: any) {
      console.error("Güncelleme hatası:", error);
      setProfileUpdateError(
        error.response?.data?.message ||
          "Profil güncelleme sırasında bir hata oluştu."
      );
      toast.error("Profil güncelleme sırasında bir hata oluştu");
      throw error;
    }
  };

  const handlePasswordUpdate = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!currentPassword || !newPassword) {
      setPasswordUpdateError("Lütfen tüm alanları doldurun");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordUpdateError("Yeni şifre en az 8 karakter olmalıdır");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordUpdateError("");

    try {
      const validateResponse = await api.post("/validate-password", {
        currentPassword,
      });

      if (!validateResponse.data.isValid) {
        setPasswordUpdateError("Mevcut şifreniz yanlış");
        return;
      }

      const updateResponse = await api.post("/password", {
        currentPassword,
        newPassword,
      });

      if (updateResponse.data.success) {
        setPasswordDialogOpen(false);
        toast.success("Şifre başarıyla güncellendi");

        // Şifre değişikliği aktivitesi kaydet
        await api.post("/activities", {
          type: "PASSWORD_CHANGE",
          details: "Hesap şifreniz başarıyla güncellendi",
        });
      } else {
        setPasswordUpdateError(
          updateResponse.data.message || "Şifre güncellenemedi"
        );
      }
    } catch (error: any) {
      console.error("Hata:", error);
      setPasswordUpdateError(
        error.response?.data?.message ||
          "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (status === "loading" || isLoadingProfile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Grid container spacing={3} maxWidth={1200} px={2}>
          <Grid item xs={12} md={4}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 3 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 3 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="textSecondary">
          Lütfen giriş yapınız.
        </Typography>
      </Box>
    );
  }
  console.log("Join Date:", userData.joinDate);
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${themeColors.background} 0%, #ffffff 100%)`,
          minHeight: "100vh",
          py: 6,
          px: { xs: 2, sm: 4 },
          marginTop: "50px",
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            mb: 4,
            "&.motion-div": {
              width: "100%",
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="motion-div"
          >
            <ProfileContainer elevation={0}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "700",
                    color: theme.palette.text.primary,
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  Profilim
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={userData.role === "ADMIN" ? "Yönetici" : "Müşteri"}
                    color={userData.role === "ADMIN" ? "primary" : "default"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  mb: 3,
                  "& .MuiTabs-indicator": {
                    backgroundColor: themeColors.primary,
                    height: 3,
                  },
                }}
              >
                <Tab
                  label="Genel Bilgiler"
                  icon={<PersonIcon />}
                  iconPosition="start"
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 48,
                  }}
                />
                <Tab
                  label="Aktiviteler"
                  icon={<HistoryIcon />}
                  iconPosition="start"
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 48,
                  }}
                />
                <Tab
                  label="Güvenlik"
                  icon={<LockIcon />}
                  iconPosition="start"
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 48,
                  }}
                  disabled={isOAuthUser}
                />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      textAlign="center"
                      sx={{
                        position: "sticky",
                        top: 20,
                      }}
                    >
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        badgeContent={
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: themeColors.primary,
                              color: "white",
                              "&:hover": {
                                backgroundColor: themeColors.secondary,
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            mb: 3,
                            objectFit: "cover",
                            border: `3px solid ${themeColors.primary}`,
                          }}
                          src={userData.image || "/default-avatar.png"}
                        />
                      </Badge>
                      <Typography variant="h5" gutterBottom>
                        {userData.name || "Adınız"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        {userData.email}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
                        <Grid item xs={6}>
                          <StatCard>
                            <Typography
                              variant="h6"
                              sx={{
                                color: themeColors.primary,
                                fontWeight: 700,
                              }}
                            >
                              {userData.ordersCount || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Sipariş
                            </Typography>
                          </StatCard>
                        </Grid>
                        <Grid item xs={6}>
                          <StatCard>
                            <Typography
                              variant="h6"
                              sx={{
                                color: themeColors.primary,
                                fontWeight: 700,
                              }}
                            >
                              {userData.reviewsCount || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Yorum
                            </Typography>
                          </StatCard>
                        </Grid>
                      </Grid>

                      {!isOAuthUser && (
                        <Button
                          variant="contained"
                          startIcon={<LockIcon />}
                          onClick={() => setPasswordDialogOpen(true)}
                          sx={{
                            backgroundColor: themeColors.primary,
                            borderRadius: "8px",
                            textTransform: "none",
                            width: "100%",
                            "&:hover": {
                              backgroundColor: themeColors.secondary,
                            },
                          }}
                        >
                          Şifre Değiştir
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Card
                      sx={{
                        mb: 4,
                        borderLeft: `4px solid ${themeColors.primary}`,
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
                          }}
                        >
                          <PersonIcon sx={{ mr: 1 }} />
                          Kişisel Bilgiler
                        </Typography>

                        <EditableField
                          label="Tam Ad"
                          value={userData.name}
                          onEdit={handleEditField("name")}
                          icon={<PersonIcon />}
                        />

                        <EditableField
                          label="Email Adresi"
                          value={userData.email}
                          onEdit={handleEditField("email")}
                          editable={false}
                          icon={<EmailIcon />}
                        />

                        <EditableField
                          label="Telefon Numarası"
                          value={userData.phone || ""}
                          onEdit={handleEditField("phone")}
                          icon={<PhoneIcon />}
                        />

                        <EditableField
                          label="Adres"
                          value={userData.address || ""}
                          onEdit={handleEditField("address")}
                          icon={<LocationIcon />}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 2,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Üyelik tarihi:{" "}
                            {dayjs(userData.joinDate).format("DD MMMM YYYY")}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                color: themeColors.primary,
                              }}
                            >
                              <PaymentIcon sx={{ mr: 1 }} />
                              Ödeme Yöntemleri
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mb: 2 }}
                            >
                              {userData.paymentMethods
                                ? `${userData.paymentMethods} kayıtlı kart`
                                : "Kayıtlı ödeme yöntemi bulunmamaktadır"}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                              }}
                            >
                              Kart Ekle
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                color: themeColors.primary,
                              }}
                            >
                              <OrderIcon sx={{ mr: 1 }} />
                              Son Sipariş
                            </Typography>
                            {userData.lastOrderDate ? (
                              <>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{ mb: 1 }}
                                >
                                  {dayjs(userData.lastOrderDate).fromNow()}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                  }}
                                >
                                  Sipariş Geçmişi
                                </Button>
                              </>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Henüz siparişiniz bulunmamaktadır
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && <UserActivities />}

              {activeTab === 2 && !isOAuthUser && (
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
                      <LockIcon sx={{ mr: 1 }} />
                      Hesap Güvenliği
                    </Typography>

                    <Box
                      sx={{
                        backgroundColor: "rgba(124, 58, 237, 0.05)",
                        borderRadius: 2,
                        p: 3,
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        Şifre Değiştir
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        Hesap güvenliğiniz için düzenli aralıklarla şifrenizi
                        güncellemenizi öneririz.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<LockIcon />}
                        onClick={() => setPasswordDialogOpen(true)}
                        sx={{
                          backgroundColor: themeColors.primary,
                          borderRadius: "8px",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: themeColors.secondary,
                          },
                        }}
                      >
                        Şifre Değiştir
                      </Button>
                    </Box>

                    <AccountDeleteButon />
                  </CardContent>
                </Card>
              )}
            </ProfileContainer>
          </motion.div>
        </Box>

        <PasswordDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          onSubmit={handlePasswordUpdate}
          isLoading={isUpdatingPassword}
          error={passwordUpdateError}
        />
      </Box>
    </ThemeProvider>
  );
}
