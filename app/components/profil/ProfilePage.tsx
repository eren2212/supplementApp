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
  InputAdornment,
  Tooltip,
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
  Info as InfoIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UserActivities from "./UserActivities";
import { useRouter } from "next/navigation";

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
  accountType?: "credentials" | "oauth"; // Hesap tipi
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
  type?: "text" | "phone" | "email" | "address";
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onEdit,
  editable = true,
  icon,
  type = "text",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  const handleSave = async () => {
    setIsLoading(true);
    setFieldError(null);
    try {
      // Telefon numarası doğrulama
      if (type === "phone") {
        const cleaned = fieldValue.replace(/\D/g, "");
        if (cleaned && (cleaned.length < 10 || cleaned.length > 11)) {
          setFieldError("Geçerli bir telefon numarası giriniz");
          setIsLoading(false);
          return;
        }
      }

      await onEdit(fieldValue);
      setIsEditing(false);
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
          {type === "phone" ? (
            <PhoneInput
              value={fieldValue}
              onChange={setFieldValue}
              error={fieldError || undefined}
            />
          ) : (
            <TextField
              size="small"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!fieldError}
              helperText={fieldError}
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          )}
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
              {type === "phone" && value
                ? formatPhoneNumber(value)
                : value || "Belirtilmemiş"}
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string): boolean => {
    // En az 8 karakter
    if (password.length < 8) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: "Şifre en az 8 karakter olmalıdır",
      }));
      return false;
    }

    // En az bir büyük harf
    if (!/[A-Z]/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: "Şifre en az bir büyük harf içermelidir",
      }));
      return false;
    }

    // En az bir küçük harf
    if (!/[a-z]/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: "Şifre en az bir küçük harf içermelidir",
      }));
      return false;
    }

    // En az bir rakam
    if (!/\d/.test(password)) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: "Şifre en az bir rakam içermelidir",
      }));
      return false;
    }

    // Şifre geçerli
    setValidationErrors((prev) => ({ ...prev, newPassword: undefined }));
    return true;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== newPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Şifreler eşleşmiyor",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = () => {
    // Mevcut şifre kontrolü
    if (!currentPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        currentPassword: "Mevcut şifrenizi giriniz",
      }));
      return;
    }

    // Yeni şifre doğrulama
    if (!validatePassword(newPassword)) {
      return;
    }

    // Şifre eşleşme kontrolü
    if (newPassword !== confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Şifreler eşleşmiyor",
      }));
      return;
    }

    // Tüm validasyonlar geçti
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
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (e.target.value) {
              setValidationErrors((prev) => ({
                ...prev,
                currentPassword: undefined,
              }));
            }
          }}
          error={!!validationErrors.currentPassword}
          helperText={validationErrors.currentPassword}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Yeni Şifre"
          type="password"
          margin="normal"
          value={newPassword}
          onChange={handleNewPasswordChange}
          error={!!validationErrors.newPassword}
          helperText={validationErrors.newPassword}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight={500} gutterBottom>
                      Şifreniz aşağıdaki gereksinimleri karşılamalıdır:
                    </Typography>
                    <ul style={{ paddingLeft: "16px", margin: "8px 0" }}>
                      <li>En az 8 karakter uzunluğunda</li>
                      <li>En az bir büyük harf</li>
                      <li>En az bir küçük harf</li>
                      <li>En az bir rakam</li>
                    </ul>
                  </Box>
                }
                placement="right"
                arrow
              >
                <IconButton edge="end" tabIndex={-1} size="small">
                  <InfoIcon fontSize="small" sx={{ color: "action.active" }} />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Yeni Şifre Tekrar"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
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
          disabled={
            isLoading ||
            !!validationErrors.newPassword ||
            !!validationErrors.confirmPassword ||
            !!validationErrors.currentPassword
          }
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

// Telefon numarası formatlama fonksiyonu
const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";

  // Sadece rakamları al
  const cleaned = phone.replace(/\D/g, "");

  // Eğer 10 haneden az ise (başında 0 olmadan), başına 0 ekle
  const tenDigit =
    cleaned.length === 10
      ? cleaned
      : cleaned.length > 10
      ? cleaned.substring(cleaned.length - 10)
      : "0".repeat(10 - cleaned.length) + cleaned;

  // 0544 337 66 15 formatında düzenle
  const formatted = `${tenDigit.slice(0, 4)} ${tenDigit.slice(
    4,
    7
  )} ${tenDigit.slice(7, 9)} ${tenDigit.slice(9)}`;

  return formatted;
};

// PhoneInput bileşeni
const PhoneInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [formattedValue, setFormattedValue] = useState(
    formatPhoneNumber(value)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Girilen değeri formatla
    setFormattedValue(input);

    // onChange'e sadece rakamları gönder
    const cleaned = input.replace(/\D/g, "");
    onChange(cleaned);
  };

  return (
    <TextField
      label="Telefon Numarası"
      value={formattedValue}
      onChange={handleChange}
      fullWidth
      placeholder="0544 337 66 15"
      error={!!error}
      helperText={error || "Örnek: 0544 337 66 15"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <PhoneIcon color="primary" />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />
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
  const router = useRouter();

  const api = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Google, GitHub gibi harici sağlayıcılarla mı giriş yapıldı kontrolü
  const isOAuthUser = useMemo(() => {
    // 1. UserData'dan gelen account type bilgisini kontrol et
    if (userData.accountType === "oauth") {
      return true;
    }

    // 2. Oturum varsa provider bilgisini kontrol et
    if (session?.user) {
      // Provider doğrudan 'google', 'github' gibi bir değer olabilir
      if (session.user.provider && session.user.provider !== "credentials") {
        return true;
      }

      // Email kontrolü - Google hesapları genelde gmail uzantılı olur
      if (
        session.user.email?.endsWith("@gmail.com") &&
        session.user.image?.includes("googleusercontent.com")
      ) {
        return true;
      }

      // Image URL kontrolü - OAuth sağlayıcıları genelde kendi resim URL'lerini kullanır
      if (
        session.user.image &&
        (session.user.image.includes("googleusercontent.com") ||
          session.user.image.includes("github") ||
          session.user.image.includes("facebook"))
      ) {
        return true;
      }
    }
    return false;
  }, [session, userData]);

  console.log(
    "isOAuthUser:",
    isOAuthUser,
    "accountType:",
    userData.accountType,
    "provider:",
    session?.user?.provider,
    "email:",
    session?.user?.email,
    "image:",
    session?.user?.image
  );
  const fetchProfile = async () => {
    // Oturum açık değilse API çağrılarını yapma
    if (status !== "authenticated" || !session?.user) {
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    try {
      // Hesap tipini belirle
      let currentAccountType: "credentials" | "oauth" = "credentials";

      // Provider bilgisine göre hesap tipini belirle
      if (session?.user?.provider && session.user.provider !== "credentials") {
        currentAccountType = "oauth";
      } else if (
        session?.user?.image &&
        (session.user.image.includes("googleusercontent.com") ||
          session.user.image.includes("github"))
      ) {
        currentAccountType = "oauth";
      }

      // Session'dan temel bilgileri al
      setUserData({
        id: session.user?.id || " ",
        name: session.user?.name || "",
        email: session.user?.email || "",
        address: session.user?.address || null,
        phone:
          session.user && "phone" in session.user
            ? (session.user.phone as string)
            : null,
        image: session.user?.image || null,
        role: session.user?.role || "CUSTOMER",
        joinDate: session.user?.joinDate || new Date().toISOString(),
        accountType: currentAccountType, // Hesap tipini ekle
      });

      // Ek bilgiler için API'ye istek at - hata yönetimini geliştir
      try {
        // Ek bilgiler için API'ye istek at
        const response = await api.get("/profile");
        if (response.data?.data) {
          try {
            // Kullanıcının yorum sayısını ayrı bir try-catch bloğunda al
            const commentsResponse = await api.get(
              `/comments/user/${session.user?.id}`
            );
            const reviewsCount = commentsResponse.data?.count || 0;

            // Tüm verileri güncelle
            setUserData((prev) => ({
              ...prev,
              ...response.data.data,
              reviewsCount,
              accountType: response.data.data.accountType || prev.accountType,
            }));
          } catch (commentsError) {
            console.error("Yorum sayısı alınırken hata:", commentsError);
            // Yorum alınamazsa yorumsuz veriyi güncelle
            setUserData((prev) => ({
              ...prev,
              ...response.data.data,
              accountType: response.data.data.accountType || prev.accountType,
            }));
          }
        }
      } catch (apiError) {
        console.error("API isteklerinde hata:", apiError);
        // Session verilerini kullanmaya devam et, API çağrısı başarısız olsa bile
      }
    } catch (error: any) {
      console.error("Profil bilgileri alınırken hata:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [status, session]);

  const handleEditField = (field: keyof UserData) => async (value: string) => {
    // Oturum açık değilse API çağrısı yapma
    if (status !== "authenticated" || !session?.user) {
      toast.error("Oturum açık değil, lütfen tekrar giriş yapınız.");
      return;
    }

    setProfileUpdateError(null);
    try {
      // Telefon numarası için özel doğrulama
      if (field === "phone" && value && !/^\d{10,11}$/.test(value)) {
        setProfileUpdateError(
          "Telefon numarası 10-11 hane arasında olmalıdır."
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
    // Oturum açık değilse API çağrısı yapma
    if (status !== "authenticated" || !session?.user) {
      toast.error("Oturum açık değil, lütfen tekrar giriş yapınız.");
      return;
    }

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
                  Hesabım
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
                    borderRadius: "3px 3px 0 0",
                  },
                  "& .MuiTab-root": {
                    minHeight: 56,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    opacity: 0.7,
                    "&.Mui-selected": {
                      opacity: 1,
                      color: themeColors.primary,
                    },
                  },
                }}
              >
                <Tab
                  label="Bilgilerim"
                  icon={<PersonIcon />}
                  iconPosition="start"
                  sx={{
                    borderRadius: "12px 12px 0 0",
                    textTransform: "none",
                  }}
                />
                <Tab
                  label="Aktiviteler"
                  icon={<HistoryIcon />}
                  iconPosition="start"
                  sx={{
                    borderRadius: "12px 12px 0 0",
                    textTransform: "none",
                  }}
                />
                <Tab
                  label="Güvenlik"
                  icon={<LockIcon />}
                  iconPosition="start"
                  sx={{
                    borderRadius: "12px 12px 0 0",
                    textTransform: "none",
                  }}
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
                      component={Card}
                      sx={{
                        position: "sticky",
                        top: 20,
                        p: 4,
                        borderRadius: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        background: "linear-gradient(145deg, white, #f9f9ff)",
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
                              width: 36,
                              height: 36,
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <Avatar
                          sx={{
                            width: 140,
                            height: 140,
                            mb: 3,
                            border: `4px solid white`,
                            boxShadow: "0 8px 20px rgba(124, 58, 237, 0.15)",
                          }}
                          src={userData.image || "/default-avatar.png"}
                        />
                      </Badge>
                      <Typography variant="h5" gutterBottom fontWeight={700}>
                        {userData.name || "Adınız"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 3 }}
                      >
                        {userData.email}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "16px",
                              bgcolor: "rgba(124, 58, 237, 0.1)",
                              color: themeColors.primary,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color="inherit"
                            >
                              {userData.ordersCount || 0}
                            </Typography>
                            <Typography variant="body2">Sipariş</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "16px",
                              bgcolor: "rgba(124, 58, 237, 0.1)",
                              color: themeColors.primary,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color="inherit"
                            >
                              {userData.reviewsCount || 0}
                            </Typography>
                            <Typography variant="body2">Yorum</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {!isOAuthUser ? (
                        <Button
                          variant="outlined"
                          startIcon={<LockIcon />}
                          onClick={() => setPasswordDialogOpen(true)}
                          sx={{
                            borderColor: themeColors.primary,
                            color: themeColors.primary,
                            borderRadius: "12px",
                            textTransform: "none",
                            width: "100%",
                            py: 1.5,
                            "&:hover": {
                              borderColor: themeColors.secondary,
                              backgroundColor: "rgba(124, 58, 237, 0.05)",
                            },
                          }}
                        >
                          Şifre Değiştir
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            backgroundColor: "rgba(124, 58, 237, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            textAlign="center"
                          >
                            Google hesabıyla giriş yaptınız
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Card
                      sx={{
                        mb: 4,
                        borderRadius: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          bgcolor: "rgba(124, 58, 237, 0.03)",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            fontWeight: 600,
                          }}
                        >
                          <PersonIcon
                            sx={{ mr: 1.5, color: themeColors.primary }}
                          />
                          Kişisel Bilgiler
                        </Typography>
                      </Box>

                      <CardContent sx={{ p: 4 }}>
                        <EditableField
                          label="Ad Soyad"
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
                          type="email"
                        />

                        <EditableField
                          label="Telefon Numarası"
                          value={userData.phone || ""}
                          onEdit={handleEditField("phone")}
                          icon={<PhoneIcon />}
                          type="phone"
                        />

                        <EditableField
                          label="Adres"
                          value={userData.address || ""}
                          onEdit={handleEditField("address")}
                          icon={<LocationIcon />}
                          type="address"
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 3,
                            p: 2,
                            borderRadius: "12px",
                            bgcolor: "rgba(124, 58, 237, 0.05)",
                          }}
                        >
                          <CalendarIcon
                            sx={{ mr: 1.5, color: themeColors.primary }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Üyelik tarihi
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {dayjs(userData.joinDate).format("DD MMMM YYYY")}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: "100%",
                            borderRadius: "20px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                color: themeColors.primary,
                                fontWeight: 600,
                              }}
                            >
                              <PaymentIcon sx={{ mr: 1.5 }} />
                              Ödeme Yöntemleri
                            </Typography>

                            <Box
                              sx={{
                                borderRadius: "10px",
                                p: 2,
                                bgcolor: "rgba(124, 58, 237, 0.05)",
                                mb: 2,
                              }}
                            >
                              <Typography variant="body1" fontWeight={500}>
                                {userData.paymentMethods
                                  ? `${userData.paymentMethods} kayıtlı kart`
                                  : "Kayıtlı ödeme yönteminiz yok"}
                              </Typography>
                            </Box>

                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              sx={{
                                borderRadius: "12px",
                                textTransform: "none",
                                py: 1.5,
                              }}
                            >
                              Ödeme Yöntemi Ekle
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            height: "100%",
                            borderRadius: "20px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                color: themeColors.primary,
                                fontWeight: 600,
                              }}
                            >
                              <OrderIcon sx={{ mr: 1.5 }} />
                              Son Siparişler
                            </Typography>

                            <Box
                              sx={{
                                borderRadius: "10px",
                                p: 2,
                                bgcolor: "rgba(124, 58, 237, 0.05)",
                                mb: 2,
                              }}
                            >
                              {userData.lastOrderDate ? (
                                <Typography variant="body1" fontWeight={500}>
                                  Son sipariş:{" "}
                                  {dayjs(userData.lastOrderDate).fromNow()}
                                </Typography>
                              ) : (
                                <Typography variant="body1" fontWeight={500}>
                                  Henüz siparişiniz bulunmuyor
                                </Typography>
                              )}
                            </Box>

                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => router.push("/profile/orders")}
                              sx={{
                                borderRadius: "12px",
                                textTransform: "none",
                                py: 1.5,
                              }}
                            >
                              Tüm Siparişler
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && <UserActivities />}

              {activeTab === 2 && (
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(124, 58, 237, 0.03)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 600,
                      }}
                    >
                      <LockIcon sx={{ mr: 1.5, color: themeColors.primary }} />
                      Hesap Güvenliği
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: 4 }}>
                    {!isOAuthUser ? (
                      <Box
                        sx={{
                          backgroundColor: "rgba(124, 58, 237, 0.05)",
                          borderRadius: "16px",
                          p: 3,
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LockIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
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
                          onClick={() => setPasswordDialogOpen(true)}
                          fullWidth
                          sx={{
                            backgroundColor: themeColors.primary,
                            borderRadius: "12px",
                            textTransform: "none",
                            py: 1.5,
                            "&:hover": {
                              backgroundColor: themeColors.secondary,
                            },
                          }}
                        >
                          Şifre Değiştir
                        </Button>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          backgroundColor: "rgba(124, 58, 237, 0.05)",
                          borderRadius: "16px",
                          p: 3,
                          mb: 3,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LockIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                          Google Hesabı
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 2 }}
                        >
                          Google hesabınızla giriş yaptığınız için uygulama
                          içinde şifre değiştirmeniz mümkün değildir. Şifrenizi
                          değiştirmek için Google hesap ayarlarınızı
                          kullanmalısınız.
                        </Typography>
                      </Box>
                    )}

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
