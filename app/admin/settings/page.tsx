"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  IconButton,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Tab,
  Tabs,
  InputAdornment,
  Switch,
  FormControlLabel,
  FormGroup,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Fade,
  Avatar,
  AlertTitle,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Facebook,
  Instagram,
  YouTube,
  Twitter,
  LinkedIn,
  Image as ImageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  CorporateFare as CorporateFareIcon,
  ContactMail as ContactMailIcon,
  Share as ShareIcon,
  ShoppingCart as ShoppingCartIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/app/store/settingsStore";

// TabPanel bileşeni
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

// Scroll-to-top düğmesi
function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <Fade in={isVisible}>
      <Tooltip title="Yukarı çık" placement="left">
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Tooltip>
    </Fade>
  );
}

// Ana bileşen
const SettingsPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Zustand store'dan state ve metodları al
  const {
    settings,
    loading,
    saving,
    success,
    error,
    fetchSettings,
    updateSettings,
    updateField,
    resetSuccess,
    resetError,
  } = useSettingsStore();

  // Component mount olduğunda ayarları yükle
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Başarı veya hata durumunda snackbar göster
  useEffect(() => {
    if (success || error) {
      setSnackbarOpen(true);
    }
  }, [success, error]);

  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Input değişimlerini yakala
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Boolean, number veya string olarak ayarla
    const fieldValue =
      type === "checkbox"
        ? checked
        : type === "number"
        ? parseFloat(value)
        : value;

    // Zustand store'daki ilgili alanı güncelle
    updateField(name as keyof typeof settings, fieldValue);
  };

  // Ayarları kaydet
  const handleSaveSettings = async () => {
    await updateSettings(settings);
  };

  // Snackbar'ı kapat
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    resetSuccess();
    resetError();
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {settings.maintenanceMode && (
        <Alert
          severity="warning"
          variant="filled"
          icon={<AdminIcon />}
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => updateField("maintenanceMode", false)}
            >
              Bakım Modunu Kapat
            </Button>
          }
        >
          <AlertTitle>Bakım Modu Aktif</AlertTitle>
          Şu anda siteniz bakım modunda. Normal kullanıcılar siteye erişemez.
        </Alert>
      )}

      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <IconButton
          sx={{ mr: 2 }}
          onClick={() => router.push("/admin")}
          aria-label="Geri"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <SettingsIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Site Ayarları
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 0, mb: 4, borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          aria-label="site ayarları sekmeleri"
          sx={{
            bgcolor: theme.palette.background.default,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tab
            icon={<CorporateFareIcon />}
            label={isMobile ? "" : "Genel"}
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab
            icon={<ContactMailIcon />}
            label={isMobile ? "" : "İletişim"}
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab
            icon={<ShareIcon />}
            label={isMobile ? "" : "Sosyal Medya"}
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab
            icon={<ShoppingCartIcon />}
            label={isMobile ? "" : "Ticaret"}
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab
            icon={<SettingsIcon />}
            label={isMobile ? "" : "Sistem"}
            iconPosition={isMobile ? "top" : "start"}
          />
        </Tabs>

        {/* Genel Ayarlar */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Site Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Adı"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site Başlığı"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleInputChange}
                helperText="SEO için önemli"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site Açıklaması"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                multiline
                rows={3}
                helperText="SEO için önemli"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logo URL"
                name="logoUrl"
                value={settings.logoUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Favicon URL"
                name="faviconUrl"
                value={settings.faviconUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* İletişim Bilgileri */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                İletişim Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İletişim E-posta"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="İletişim Telefon"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sosyal Medya */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Sosyal Medya Bağlantıları
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook URL"
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Facebook />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram URL"
                name="instagramUrl"
                value={settings.instagramUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Instagram />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Twitter URL"
                name="twitterUrl"
                value={settings.twitterUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Twitter />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="YouTube URL"
                name="youtubeUrl"
                value={settings.youtubeUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTube />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                name="linkedinUrl"
                value={settings.linkedinUrl}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Ticaret Ayarları */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ticaret ve Ödeme Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kargo Ücreti (₺)"
                name="shippingFee"
                type="number"
                value={settings.shippingFee}
                onChange={handleInputChange}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="KDV Oranı (%)"
                name="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={handleInputChange}
                InputProps={{
                  inputProps: { min: 0, max: 100, step: 1 },
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableGuestCheckout}
                        onChange={handleInputChange}
                        name="enableGuestCheckout"
                        color="primary"
                      />
                    }
                    label="Misafir Ödemeye İzin Ver"
                  />
                </FormGroup>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Sistem Ayarları */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Sistem Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                Bu ayarlar site davranışını önemli ölçüde değiştirebilir.
                Dikkatli kullanınız.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableRegistration}
                        onChange={handleInputChange}
                        name="enableRegistration"
                        color="primary"
                      />
                    }
                    label="Kullanıcı Kayıtları Açık"
                  />
                </FormGroup>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor:
                    theme.palette.mode === "light"
                      ? "rgba(255, 240, 240, 0.5)"
                      : "rgba(80, 0, 0, 0.1)",
                  borderRadius: 2,
                  borderLeft: `4px solid ${theme.palette.error.main}`,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={handleInputChange}
                        name="maintenanceMode"
                        color="error"
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography fontWeight="bold">Bakım Modu</Typography>
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          (Sadece yöneticilere erişim izni verir)
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={saving}
          sx={{
            px: 4,
            py: 1.5,
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {success ? "Ayarlar başarıyla kaydedildi" : error}
        </Alert>
      </Snackbar>

      <ScrollTopButton />
    </Container>
  );
};

export default SettingsPage;
