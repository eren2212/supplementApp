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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { motion } from "framer-motion";

// Kullanıcı verileri için tip tanımı (Prisma modeline göre)
interface UserData {
  name: string;
  email: string;
  address: string | null;
  image?: string | null;
}

// EditableField props için tip tanımı
interface EditableFieldProps {
  label: string;
  value: string;
  onEdit: (value: string) => void;
  editable?: boolean;
}

// Özelleştirilebilir tema renkleri
const themeColors = {
  primary: "#7c3aed", // Daha canlı bir mor
  secondary: "#a78bfa",
  background: "#f3f0ff", // Daha açık bir lavanta
  text: "#373062", // Daha koyu bir mor
  accent: "#facc15", // Altın sarısı bir vurgu rengi
};

const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    text: {
      primary: themeColors.text,
      secondary: "#7171a7", // Daha açık bir metin rengi
    },
    background: {
      default: themeColors.background,
    },
  },
  typography: {
    fontFamily: "Playfair Display, serif",
    h4: {
      fontFamily: "",
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
    },
    h6: {
      fontFamily: "Playfair Display, serif",
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.3,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1rem",
    },
    overline: {
      fontSize: "0.8rem",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    button: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 600,
      fontSize: "0.9rem",
      textTransform: "none",
    },
  },
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderColor: themeColors.secondary, // Avatar çerçevesi için
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Daha yumuşak köşeler
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px", // Daha yuvarlak textfield kenarları
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: themeColors.secondary + "40", // Daha hafif bir ayırıcı
        },
      },
    },
  },
});

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  maxWidth: 800,
  borderRadius: "24px",
  boxShadow: "0px 20px 60px rgba(124, 58, 237, 0.15)", // Daha yumuşak ve belirgin gölge
  background: `linear-gradient(145deg, #ffffff 0%, ${themeColors.background} 100%)`,
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${themeColors.secondary}20`, // İnce bir kenarlık
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "40%", // Biraz daha geniş alan
    height: "100%",
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    clipPath: "polygon(100% 0, 100% 100%, 0 0)",
    opacity: 0.08, // Biraz daha belirgin
    zIndex: 0,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: "10px",
  boxShadow: `0px 12px 35px ${themeColors.primary}30`, // Daha incelikli gölge
  border: `6px solid ${themeColors.secondary}80`, // Daha belirgin çerçeve
  transition: "all 0.4s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0px 15px 45px ${themeColors.primary}40`,
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px", // Daha modern köşeler
  textTransform: "none",

  padding: "10px 22px",
  fontSize: "0.9rem",
  fontWeight: 600,
  letterSpacing: "0.6px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  minWidth: "160px",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0px 6px 15px ${themeColors.primary}25`,
  },
}));

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onEdit,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  const handleSave = () => {
    onEdit(fieldValue);
    setIsEditing(false);
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
          />
          <Button onClick={handleSave} size="small" color="primary">
            Kaydet
          </Button>
        </>
      ) : (
        <>
          <Typography
            variant="subtitle1"
            sx={{ flexGrow: 1, color: theme.palette.text.primary }}
          >
            <strong>{label}:</strong> {value || "Belirtilmemiş"}
          </Typography>
          {editable && (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{ color: theme.palette.primary.main }}
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
  const { data: session, status } = useSession();
  const theme = useTheme();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    address: null,
  });

  // Kullanıcı verilerini güncelle
  const handleEditField = (field: keyof UserData) => (value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: theme.palette.background.default }}
      >
        <ProfileContainer>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={250}
            sx={{ borderRadius: 3 }}
          />
          <Box sx={{ pt: 4 }}>
            <Skeleton variant="text" width="60%" height={50} />
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="80%" height={30} />
          </Box>
        </ProfileContainer>
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
        sx={{ background: theme.palette.background.default }}
      >
        <Typography variant="h6" color="textSecondary">
          Lütfen giriş yapınız.
        </Typography>
      </Box>
    );
  }

  // Session'dan gelen verileri kullan
  if (!userData.name && session.user) {
    setUserData({
      name: session.user.name || "",
      email: session.user.email || "",
      address: session.user.address || null,
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: theme.palette.background.default, p: 3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <ProfileContainer elevation={0}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 5,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: "700",
                  color: theme.palette.text.primary,
                  position: "relative",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: -10,
                    left: 0,
                    width: "60px",
                    height: "5px",
                    background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    borderRadius: 3,
                  },
                }}
              >
                Profilim
              </Typography>
              <IconButton
                sx={{
                  background: `${themeColors.secondary}15`,
                  color: themeColors.primary,
                  "&:hover": {
                    background: `${themeColors.secondary}25`,
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>

            <Grid container spacing={6}>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <ProfileAvatar
                  alt="Profil Resmi"
                  src={session.user?.image || "/default-avatar.png"}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mt: 3,
                    fontWeight: "600",
                    color: theme.palette.text.primary,
                    textAlign: "center",
                  }}
                >
                  {userData.name}
                </Typography>

                <ProfileButton
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                    color: "white",
                    mt: 3,
                    padding: "8px 18px",
                    fontSize: "0.85rem",
                  }}
                >
                  Fotoğrafı Güncelle
                </ProfileButton>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: "700",
                      letterSpacing: "0.15em",
                    }}
                  >
                    Kişisel Bilgiler
                  </Typography>
                  <Divider
                    sx={{
                      my: 2,
                      background: `linear-gradient(90deg, ${themeColors.secondary}30, ${themeColors.primary}70)`,
                      height: "1.5px",
                      borderRadius: "1px",
                    }}
                  />
                  <Box sx={{ mt: 3 }}>
                    <EditableField
                      label="İsim"
                      value={userData.name}
                      onEdit={handleEditField("name")}
                    />
                    <EditableField
                      label="Email"
                      value={userData.email}
                      onEdit={handleEditField("email")}
                      editable={false}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: "700",
                      letterSpacing: "0.15em",
                    }}
                  >
                    İletişim Bilgileri
                  </Typography>
                  <Divider
                    sx={{
                      my: 2,
                      background: `linear-gradient(90deg, ${themeColors.secondary}30, ${themeColors.primary}70)`,
                      height: "1.5px",
                      borderRadius: "1px",
                    }}
                  />
                  <Box sx={{ mt: 3 }}>
                    <EditableField
                      label="Adres"
                      value={userData.address || ""}
                      onEdit={handleEditField("address")}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                  }}
                >
                  <ProfileButton
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                      color: "white",
                    }}
                  >
                    Profili Güncelle
                  </ProfileButton>
                </Box>
              </Grid>
            </Grid>
          </ProfileContainer>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
}
