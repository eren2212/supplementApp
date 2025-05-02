"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Map as MapIcon,
  LocationCity as CityIcon,
  MarkunreadMailbox as PostcodeIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { themeColors } from "./ProfilePage";
import { turkishCities } from "@/app/data/cities";

interface Address {
  id: string;
  title: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  postcode: string;
  country: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    isDefault: false,
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postcode: "",
    country: "Türkiye",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profile/addresses");
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Adresler alınırken hata oluştu:", error);
      toast.error("Adresler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Telefon numarası formatlama fonksiyonu
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları tut
    const numbers = value.replace(/\D/g, "");

    // Türkiye GSM formatı: 5XX XXX XX XX
    let formatted = "";

    if (numbers.length > 0) {
      formatted += numbers.substring(0, Math.min(3, numbers.length));
    }
    if (numbers.length > 3) {
      formatted += " " + numbers.substring(3, Math.min(6, numbers.length));
    }
    if (numbers.length > 6) {
      formatted += " " + numbers.substring(6, Math.min(8, numbers.length));
    }
    if (numbers.length > 8) {
      formatted += " " + numbers.substring(8, Math.min(10, numbers.length));
    }

    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "isDefault" ? checked : value,
    });

    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece rakamları al ve 10 karakterle sınırla
    const input = e.target.value.replace(/\D/g, "").substring(0, 10);
    const formatted = formatPhoneNumber(input);

    // Input değerini formatlanmış haliyle güncelle
    e.target.value = formatted;

    // formData'yı sadece rakamlarla güncelle
    setFormData({
      ...formData,
      phone: input,
    });

    // Hata mesajını temizle
    if (formErrors.phone) {
      setFormErrors({
        ...formErrors,
        phone: "",
      });
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece rakamları kabul et ve 5 karakterle sınırla
    const input = e.target.value.replace(/\D/g, "").substring(0, 5);

    // Input değerini güncelle
    e.target.value = input;

    // formData'yı güncelle
    setFormData({
      ...formData,
      postcode: input,
    });

    // Hata mesajını temizle
    if (formErrors.postcode) {
      setFormErrors({
        ...formErrors,
        postcode: "",
      });
    }
  };

  const handleCityChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      city: e.target.value as string,
    });

    // Hata mesajını temizle
    if (formErrors.city) {
      setFormErrors({
        ...formErrors,
        city: "",
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields = [
      "title",
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "postcode",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = "Bu alan zorunludur";
      }
    });

    // Telefon numarası doğrulama
    if (formData.phone) {
      if (formData.phone.length !== 10) {
        errors.phone = "Telefon numarası tam 10 haneli olmalıdır";
      } else if (!/^5[0-9]{9}$/.test(formData.phone)) {
        errors.phone = "Geçerli bir telefon numarası giriniz (5XX XXX XX XX)";
      }
    }

    // Posta kodu doğrulama
    if (formData.postcode && formData.postcode.length !== 5) {
      errors.postcode = "Posta kodu tam 5 haneli olmalıdır";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = () => {
    setIsEditing(false);
    setCurrentAddress(null);
    setFormData({
      title: "",
      isDefault: false,
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      postcode: "",
      country: "Türkiye",
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setIsEditing(true);
    setCurrentAddress(address);
    setFormData({
      title: address.title,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district || "",
      postcode: address.postcode,
      country: address.country,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDeleteClick = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      setSubmitLoading(true);
      const response = await axios.delete(
        `/api/profile/addresses/${addressToDelete}`
      );

      if (response.data.success) {
        toast.success("Adres başarıyla silindi");
        fetchAddresses();
        setDeleteDialogOpen(false);
        setAddressToDelete(null);
      }
    } catch (error) {
      console.error("Adres silinirken hata oluştu:", error);
      toast.error("Adres silinirken bir hata oluştu");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);

      if (isEditing && currentAddress) {
        // Adres güncelleme
        const response = await axios.put(
          `/api/profile/addresses/${currentAddress.id}`,
          formData
        );

        if (response.data.success) {
          toast.success("Adres başarıyla güncellendi");
          fetchAddresses();
          setOpenDialog(false);
        }
      } else {
        // Yeni adres ekleme
        const response = await axios.post("/api/profile/addresses", formData);

        if (response.data.success) {
          toast.success("Adres başarıyla eklendi");
          fetchAddresses();
          setOpenDialog(false);
        }
      }
    } catch (error: any) {
      console.error("Adres kaydedilirken hata oluştu:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Adres kaydedilirken bir hata oluştu");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          Kayıtlı Adreslerim
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
          sx={{
            bgcolor: themeColors.primary,
            "&:hover": { bgcolor: "#6429d8" },
          }}
        >
          Yeni Adres Ekle
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={40} sx={{ color: themeColors.primary }} />
        </Box>
      ) : addresses.length === 0 ? (
        <Card
          sx={{
            border: `1px dashed ${themeColors.secondary}`,
            bgcolor: "rgba(124, 58, 237, 0.04)",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <LocationIcon
              sx={{ fontSize: 48, color: themeColors.secondary, mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Henüz kayıtlı adresiniz bulunmuyor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Siparişlerinizi hızlı bir şekilde tamamlamak için adres
              ekleyebilirsiniz
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
              sx={{
                bgcolor: themeColors.primary,
                "&:hover": { bgcolor: "#6429d8" },
              }}
            >
              Adres Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                    border: address.isDefault
                      ? `1px solid ${themeColors.primary}`
                      : "none",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  {address.isDefault && (
                    <Chip
                      label="Varsayılan"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 16,
                        bgcolor: themeColors.primary,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" component="div">
                        {address.title}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditAddress(address)}
                          sx={{ color: themeColors.info }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(address.id)}
                          sx={{ color: themeColors.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="body2" gutterBottom>
                      <strong>
                        {address.firstName} {address.lastName}
                      </strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {address.address}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {address.district ? `${address.district}, ` : ""}
                      {address.city} / {address.postcode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Adres Ekleme/Düzenleme Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Adresi Düzenle" : "Yeni Adres Ekle"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Adres Başlığı"
                fullWidth
                variant="outlined"
                placeholder="Örn: Evim, İşyerim"
                value={formData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <HomeIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="Ad"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <PersonIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Soyad"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <PersonIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                variant="outlined"
                placeholder="5XX XXX XX XX"
                value={formatPhoneNumber(formData.phone)}
                onChange={handlePhoneChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone || "Örn: 5XX XXX XX XX"}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
                inputProps={{
                  maxLength: 13, // "5XX XXX XX XX" formatı için
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Adres"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <LocationIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                size="small"
                margin="normal"
                error={!!formErrors.city}
              >
                <InputLabel id="city-label">İl</InputLabel>
                <Select
                  labelId="city-label"
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  label="İl"
                  startAdornment={
                    <CityIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  }
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {turkishCities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
                {!!formErrors.city && (
                  <FormHelperText>{formErrors.city}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="district"
                label="İlçe"
                fullWidth
                variant="outlined"
                value={formData.district}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <MapIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="postcode"
                label="Posta Kodu"
                fullWidth
                variant="outlined"
                value={formData.postcode}
                onChange={handlePostcodeChange}
                error={!!formErrors.postcode}
                helperText={formErrors.postcode || "5 haneli olmalıdır"}
                margin="normal"
                size="small"
                InputProps={{
                  startAdornment: (
                    <PostcodeIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
                inputProps={{
                  maxLength: 5,
                  inputMode: "numeric",
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="country"
                label="Ülke"
                fullWidth
                variant="outlined"
                value={formData.country}
                onChange={handleInputChange}
                margin="normal"
                size="small"
                disabled
                InputProps={{
                  startAdornment: (
                    <LocationIcon
                      fontSize="small"
                      sx={{ mr: 1, color: themeColors.secondary }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    sx={{
                      color: themeColors.primary,
                      "&.Mui-checked": {
                        color: themeColors.primary,
                      },
                    }}
                  />
                }
                label="Varsayılan adres olarak ayarla"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={submitLoading}
            sx={{ color: "text.secondary" }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: themeColors.primary,
              "&:hover": { bgcolor: "#6429d8" },
            }}
          >
            {submitLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adres Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Adresi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu adresi silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={submitLoading}
            sx={{ color: "text.secondary" }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteAddress}
            variant="contained"
            color="error"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : null}
          >
            {submitLoading ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
