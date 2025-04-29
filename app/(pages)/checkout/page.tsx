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
} from "@mui/material";
import {
  PaymentOutlined,
  LocalShippingOutlined,
  SecurityOutlined,
  ArrowBackIosNew,
  ShoppingBag,
  CreditCard,
} from "@mui/icons-material";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Form doğrulama
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "Ad alanı zorunludur";
    if (!formData.lastName.trim()) errors.lastName = "Soyad alanı zorunludur";
    if (!formData.email.trim()) errors.email = "E-posta alanı zorunludur";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Geçerli bir e-posta adresi giriniz";

    if (!formData.phone.trim()) errors.phone = "Telefon alanı zorunludur";
    if (!formData.address.trim()) errors.address = "Adres alanı zorunludur";
    if (!formData.city.trim()) errors.city = "Şehir alanı zorunludur";
    if (!formData.postcode.trim())
      errors.postcode = "Posta kodu alanı zorunludur";

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

  // Ödeme işlemi
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen tüm alanları doğru şekilde doldurun");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={700}
        textAlign="center"
        sx={{ mb: 5 }}
      >
        Ödeme
      </Typography>

      <form onSubmit={handlePayment}>
        <Grid container spacing={4}>
          {/* Sol Bölüm - Teslimat Bilgileri */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <LocalShippingOutlined sx={{ mr: 1 }} />
                Teslimat Bilgileri
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
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
                  />
                </Grid>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Şehir"
                    variant="outlined"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                    required
                  />
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
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CreditCard sx={{ mr: 1 }} />
                Ödeme Bilgileri
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Güvenli ödeme için Stripe ödeme sayfasına yönlendirileceksiniz.
                Tüm ödeme bilgileriniz şifrelenerek işlenir.
              </Typography>

              <Box
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  <CreditCard
                    sx={{ fontSize: 40, mb: 1, color: "primary.main" }}
                  />
                  <br />
                  Visa, Mastercard, American Express ve diğer tüm kredi kartları
                  ile güvenli ödeme
                </Typography>
              </Box>
            </Paper>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                startIcon={<ArrowBackIosNew />}
                onClick={() => router.push("/cart")}
                sx={{ textTransform: "none" }}
              >
                Sepete Dön
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
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
                  borderRadius: "8px",
                }}
              >
                {loading ? "İşleniyor..." : "Ödemeyi Tamamla"}
              </Button>
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </Grid>

          {/* Sağ Bölüm - Sipariş Özeti */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                position: "sticky",
                top: "20px",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ShoppingBag sx={{ mr: 1 }} />
                  Sipariş Özeti
                </Typography>

                <Divider sx={{ my: 2 }} />

                {items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} adet
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {((item.price || 0) * item.quantity).toLocaleString(
                        "tr-TR",
                        {
                          style: "currency",
                          currency: "TRY",
                        }
                      )}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Ara Toplam</Typography>
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
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Kargo</Typography>
                  <Typography variant="body1" color="success.main">
                    Ücretsiz
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6">Toplam</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {getTotalPrice().toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <SecurityOutlined color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Tüm ödemeler güvenli şekilde işlenir. Kişisel bilgileriniz
                    SSL sertifikası ile korunur.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
