"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Fade,
  Slide,
  Badge,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  InputLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import {
  PaymentOutlined,
  LocalShippingOutlined,
  SecurityOutlined,
  ArrowBackIosNew,
  ShoppingBag,
  CreditCard,
  AccountCircleOutlined,
  CheckCircleOutline,
  LocationOnOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import { turkishCities } from "@/app/data/cities";

export default function CheckoutPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const steps = ["Kişisel Bilgiler", "Adres Bilgileri", "Ödeme Bilgileri"];

  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "Ad alanı zorunludur";
    if (!formData.lastName.trim()) errors.lastName = "Soyad alanı zorunludur";
    if (!formData.email.trim()) errors.email = "E-posta alanı zorunludur";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Geçerli bir e-posta adresi giriniz";

    if (!formData.phone.trim()) errors.phone = "Telefon alanı zorunludur";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      errors.phone = "Telefon numarası 10 haneli olmalıdır (Örn: 5XX1234567)";

    if (!formData.address.trim()) errors.address = "Adres alanı zorunludur";
    if (!formData.city.trim()) errors.city = "Şehir alanı zorunludur";

    if (!formData.postcode.trim())
      errors.postcode = "Posta kodu alanı zorunludur";
    else if (!/^[0-9]{5}$/.test(formData.postcode))
      errors.postcode = "Posta kodu 5 haneli sayı olmalıdır";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sepet boşsa ana sayfaya yönlendir
  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
      toast.error("Sepetinizde ürün bulunmuyor");
    }
  }, [items, router]);

  // Session'dan kullanıcı bilgilerini formda doldur
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        firstName: session.user.name?.split(" ")[0] || "",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        address: session.user.address || "",
      }));
    }
  }, [session]);

  // Form alanı değişikliği
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!name) return;

    // Telefon numarası için özel kontrol
    if (name === "phone") {
      // Sadece sayıları kabul et ve 10 haneden fazla olmasını engelle
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: phoneValue,
      });
    }
    // Posta kodu için özel kontrol
    else if (name === "postcode") {
      // Sadece sayıları kabul et ve 5 haneden fazla olmasını engelle
      const postcodeValue = value.replace(/\D/g, "").slice(0, 5);
      setFormData({
        ...formData,
        [name]: postcodeValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Select alanı değişikliği
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Adım kontrolü
  const handleNext = () => {
    if (activeStep === 0) {
      // Kişisel bilgiler adımında email ve isimleri kontrol et
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.email.trim() ||
        !/^\S+@\S+\.\S+$/.test(formData.email) ||
        !formData.phone.trim()
      ) {
        validateForm();
        return;
      }
    } else if (activeStep === 1) {
      // Adres adımında adres alanlarını kontrol et
      if (
        !formData.address.trim() ||
        !formData.city.trim() ||
        !formData.postcode.trim()
      ) {
        validateForm();
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Ödeme işlemi
  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Lütfen tüm alanları doğru şekilde doldurun");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Form verilerini hazırla
      const shippingInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
      };

      // Bilgileri localStorage'a kaydet (isteğe bağlı)
      localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));

      // Stripe ödeme sayfasına yönlendir
      const amount = getTotalPrice();
      // Router yerine window.location kullanarak yönlendir
      window.location.href = `/payment?amount=${amount}&description=Sipariş ödemesi&returnUrl=/checkout/success`;
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      setError(error.message || "Ödeme işlemi sırasında bir hata oluştu");
      toast.error(error.message || "Ödeme işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha(
                theme.palette.background.default,
                0.9
              )}, ${alpha(theme.palette.primary.dark, 0.2)})`
            : `linear-gradient(145deg, ${alpha("#f7f9fc", 0.9)}, ${alpha(
                theme.palette.primary.light,
                0.2
              )})`,
        minHeight: "calc(100vh - 80px)",
        py: 6,
      }}
    >
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Fade in={true} timeout={800}>
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight={700}
              textAlign="center"
              sx={{ mb: 4 }}
            >
              <ShoppingBag
                sx={{
                  mr: 1,
                  verticalAlign: "sub",
                  color: theme.palette.primary.main,
                }}
              />
              Ödeme Sayfası
            </Typography>

            <Box sx={{ mb: 5, width: "80%", mx: "auto" }}>
              <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Grid container spacing={4}>
              {/* Sol Bölüm - Teslimat Bilgileri */}
              <Grid item xs={12} md={7}>
                <Slide direction="up" in={true} timeout={500}>
                  <Box>
                    {activeStep === 0 && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "16px",
                          mb: 3,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                          background: alpha(
                            theme.palette.background.paper,
                            0.8
                          ),
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          <AccountCircleOutlined sx={{ mr: 1 }} />
                          Kişisel Bilgiler
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Ad"
                              variant="outlined"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              error={!!formErrors.firstName}
                              helperText={formErrors.firstName}
                              required
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Soyad"
                              variant="outlined"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              error={!!formErrors.lastName}
                              helperText={formErrors.lastName}
                              required
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="E-posta"
                              variant="outlined"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              error={!!formErrors.email}
                              helperText={formErrors.email}
                              required
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Telefon"
                              variant="outlined"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              error={!!formErrors.phone}
                              helperText={formErrors.phone}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    +90
                                  </InputAdornment>
                                ),
                              }}
                              placeholder="5XX1234567"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                    {activeStep === 1 && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "16px",
                          mb: 3,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                          background: alpha(
                            theme.palette.background.paper,
                            0.8
                          ),
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          <LocationOnOutlined sx={{ mr: 1 }} />
                          Teslimat Adresi
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Adres"
                              variant="outlined"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              error={!!formErrors.address}
                              helperText={formErrors.address}
                              multiline
                              rows={3}
                              required
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl
                              fullWidth
                              error={!!formErrors.city}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            >
                              <InputLabel id="city-select-label">
                                Şehir
                              </InputLabel>
                              <Select
                                labelId="city-select-label"
                                id="city-select"
                                name="city"
                                value={formData.city}
                                label="Şehir"
                                onChange={handleSelectChange}
                                required
                              >
                                {turkishCities.map((city) => (
                                  <MenuItem key={city} value={city}>
                                    {city}
                                  </MenuItem>
                                ))}
                              </Select>
                              {formErrors.city && (
                                <FormHelperText>
                                  {formErrors.city}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Posta Kodu"
                              variant="outlined"
                              name="postcode"
                              value={formData.postcode}
                              onChange={handleInputChange}
                              error={!!formErrors.postcode}
                              helperText={formErrors.postcode}
                              required
                              inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              }}
                              placeholder="12345"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                    {activeStep === 2 && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "16px",
                          mb: 3,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                          background: alpha(
                            theme.palette.background.paper,
                            0.8
                          ),
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          <CreditCard sx={{ mr: 1 }} />
                          Ödeme Bilgileri
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Typography
                          variant="body1"
                          sx={{
                            mb: 3,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Güvenli ödeme için Stripe ödeme sayfasına
                          yönlendirileceksiniz. Tüm ödeme bilgileriniz
                          şifrelenerek işlenir.
                        </Typography>

                        <Box
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                          }}
                        >
                          <CreditCard
                            sx={{
                              fontSize: 60,
                              mb: 2,
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Typography variant="body1" fontWeight={500}>
                            Visa, Mastercard, American Express
                            <br />
                            ve diğer tüm kredi kartları ile güvenli ödeme
                          </Typography>

                          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                            {/* Görsel dosyaları bulunamadı, o yüzden kaldırıldı */}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <SecurityOutlined color="success" sx={{ mt: 0.5 }} />
                          <Typography variant="body2">
                            Tüm ödemeler güvenli şekilde işlenir. Kişisel
                            bilgileriniz SSL sertifikası ile korunur.
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 3,
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIosNew />}
                        onClick={
                          activeStep === 0
                            ? () => router.push("/cart")
                            : handleBack
                        }
                        sx={{
                          textTransform: "none",
                          borderRadius: "10px",
                          px: 3,
                        }}
                        size="large"
                      >
                        {activeStep === 0 ? "Sepete Dön" : "Geri"}
                      </Button>

                      {activeStep < 2 ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          size="large"
                          sx={{
                            textTransform: "none",
                            px: 4,
                            py: 1.5,
                            borderRadius: "10px",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                          }}
                        >
                          Devam Et
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={loading}
                          onClick={handlePayment}
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <PaymentOutlined />
                            )
                          }
                          sx={{
                            textTransform: "none",
                            px: 4,
                            py: 1.5,
                            borderRadius: "10px",
                            background: theme.palette.success.main,
                            boxShadow: `0 4px 14px ${alpha(
                              theme.palette.success.main,
                              0.4
                            )}`,
                            "&:hover": {
                              background: theme.palette.success.dark,
                            },
                          }}
                        >
                          {loading ? "İşleniyor..." : "Ödemeyi Tamamla"}
                        </Button>
                      )}
                    </Box>

                    {error && (
                      <Typography
                        color="error"
                        sx={{ mt: 2, textAlign: "center" }}
                      >
                        {error}
                      </Typography>
                    )}
                  </Box>
                </Slide>
              </Grid>

              {/* Sağ Bölüm - Sipariş Özeti */}
              <Grid item xs={12} md={5}>
                <Slide direction="down" in={true} timeout={700}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "16px",
                      position: "sticky",
                      top: "20px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        <ReceiptOutlined sx={{ mr: 1 }} />
                        Sipariş Özeti
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={2.5} sx={{ mb: 3 }}>
                        {items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                              }}
                            >
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {item.name}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 0.5,
                                  }}
                                >
                                  <Chip
                                    label={`${item.quantity} adet`}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                      color: theme.palette.primary.main,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                            <Typography variant="body1" fontWeight={600}>
                              {(
                                (item.price || 0) * item.quantity
                              ).toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY",
                              })}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          Ara Toplam
                        </Typography>
                        <Typography variant="body1">
                          {getTotalPrice().toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          Kargo
                        </Typography>
                        <Typography
                          variant="body1"
                          color="success.main"
                          fontWeight={500}
                        >
                          Ücretsiz
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          py: 1,
                        }}
                      >
                        <Typography variant="h6">Toplam</Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight={700}
                          sx={{
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            textFillColor: "transparent",
                          }}
                        >
                          {getTotalPrice().toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: "center",
                          mt: 3,
                        }}
                      >
                        <Chip
                          icon={<CheckCircleOutline />}
                          label="Ücretsiz Kargo"
                          color="success"
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        />
                        <Chip
                          icon={<SecurityOutlined />}
                          label="Güvenli Ödeme"
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        />
                        <Chip
                          icon={<LocalShippingOutlined />}
                          label="Hızlı Teslimat"
                          color="info"
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
