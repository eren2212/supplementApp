"use client";
import { useSession } from "next-auth/react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const themeColors = {
  primary: "#7c3aed",
  secondary: "#a78bfa",
  background: "#f3f0ff",
  text: "#373062",
  accent: "#facc15",
};

const theme = createTheme({
  palette: {
    primary: { main: themeColors.primary },
    secondary: { main: themeColors.secondary },
    text: { primary: themeColors.text, secondary: "#7171a7" },
    background: { default: themeColors.background },
  },
  typography: {
    fontFamily: "Playfair Display, serif",
    h4: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
    h6: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3 },
  },
});

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  maxWidth: 800,
  borderRadius: "24px",
  boxShadow: "0px 20px 60px rgba(124, 58, 237, 0.15)",
  background: `linear-gradient(145deg, #ffffff 0%, ${themeColors.background} 100%)`,
  position: "relative",
}));

interface UserData {
  name: string;
  email: string;
  address: string | null;
  image?: string | null;
  role?: string;
}

interface EditableFieldProps {
  label: string;
  value: string;
  onEdit: (value: string) => Promise<void>;
  editable?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onEdit,
  editable = true,
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
    } catch (error: any) {
      console.error("Error saving field:", error);
      setFieldError(error.message || "Alan güncellenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
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
          />
          <Button
            onClick={handleSave}
            size="small"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            <strong>{label}:</strong> {value || "Belirtilmemiş"}
          </Typography>
          {editable && (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const theme = useTheme();
  const [userData, setUserData] = useState<UserData>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    address: session?.user?.address || null,
    image: session?.user?.image || null,
    role: session?.user?.role || "CUSTOMER",
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(
    null
  );
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(
    null
  );

  // Create Axios instance with base config
  const api = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const handleEditField = (field: keyof UserData) => async (value: string) => {
    setProfileUpdateError(null);
    try {
      const { data } = await api.post("/profile", { [field]: value });
      setUserData((prev: UserData) => ({ ...prev, ...data.data }));
      await update(data.data);
      return data; // Return the response data
    } catch (error: any) {
      console.error("Update error:", error);
      setProfileUpdateError(
        error.response?.data?.message ||
          "Profil güncelleme sırasında bir hata oluştu."
      );
      throw error;
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordUpdateError("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordUpdateError(null);

    try {
      const response = await api.post("/api/profile/password", {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        setPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        // Başarı mesajı gösterebilirsiniz
      } else {
        setPasswordUpdateError(
          response.data.message || "Şifre güncellenemedi."
        );
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      setPasswordUpdateError(
        error.response?.data?.message || "Şifre güncellenemedi."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Skeleton variant="rectangular" width={300} height={400} />
      </Box>
    );
  }

  if (!session) {
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

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileContainer elevation={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "700", color: theme.palette.text.primary }}
              >
                Profilim
              </Typography>
              <IconButton onClick={() => setPasswordDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mb: 2,
                      objectFit: "cover",
                    }}
                    src={userData.image || ""}
                  />
                  <Typography variant="h6" gutterBottom>
                    {userData.name || "Adınız"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {userData.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box>
                  <EditableField
                    label="Ad"
                    value={userData.name}
                    onEdit={handleEditField("name")}
                  />
                  <EditableField
                    label="Email"
                    value={userData.email}
                    onEdit={handleEditField("email")}
                    editable={false}
                  />
                  <EditableField
                    label="Adres"
                    value={userData.address || "Adres belirtilmemiş"}
                    onEdit={handleEditField("address")}
                  />
                  {profileUpdateError && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {profileUpdateError}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Dialog
              open={passwordDialogOpen}
              onClose={() => setPasswordDialogOpen(false)}
            >
              <DialogTitle>Şifre Güncelle</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  type="password"
                  margin="normal"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  type="password"
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {passwordUpdateError && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {passwordUpdateError}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPasswordDialogOpen(false)}>
                  İptal
                </Button>
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </DialogActions>
            </Dialog>
          </ProfileContainer>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
}
