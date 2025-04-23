"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  FormHelperText,
  InputAdornment,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack,
  Image as ImageIcon,
  KeyboardArrowUp,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { SelectChangeEvent } from "@mui/material/Select";
import { useSupplementStore } from "@/app/store/supplementStore";
import { toast } from "react-hot-toast";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "100%",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)",
  borderRadius: 50,
  color: "white",
  padding: "12px 32px",
  fontWeight: "bold",
  "&:hover": {
    background: "linear-gradient(45deg, #5253D3 30%, #7A4BE0 90%)",
    boxShadow: "0 3px 5px 2px rgba(99, 102, 241, .3)",
  },
}));

const categories = [
  "VITAMIN",
  "MINERAL",
  "PROTEIN",
  "OMEGA",
  "AMINO_ACID",
  "HERB",
  "PROBIOTIC",
  "JOINT",
  "SLEEP",
  "ENERGY",
  "OTHER",
];

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  featured?: boolean;
}

const NewSupplementPage = () => {
  const router = useRouter();
  const { createSupplement, isLoading, error } = useSupplementStore();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    featured: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, featured: e.target.checked });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Takviye adı gereklidir";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Açıklama gereklidir";
      isValid = false;
    }

    if (!formData.price.trim()) {
      newErrors.price = "Fiyat gereklidir";
      isValid = false;
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Geçerli bir fiyat giriniz";
      isValid = false;
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stok miktarı gereklidir";
      isValid = false;
    } else if (
      isNaN(parseInt(formData.stock)) ||
      parseInt(formData.stock) < 0
    ) {
      newErrors.stock = "Geçerli bir stok miktarı giriniz";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Kategori seçimi gereklidir";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImagePreview = () => {
    if (formData.imageUrl && formData.imageUrl.startsWith("http")) {
      setPreviewImage(formData.imageUrl);
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createSupplement({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl:
          formData.imageUrl ||
          "https://via.placeholder.com/400x400?text=Supplement",
        featured: formData.featured,
      });

      // Show success message
      toast.success("Takviye başarıyla eklendi");

      // Redirect back to supplements list
      router.push("/admin/supplements");
    } catch (error) {
      console.error("Error saving supplement:", error);
      toast.error(
        (error as any).response?.data?.error ||
          "Takviye eklenirken bir hata oluştu."
      );
    }
  };

  const goBack = () => {
    router.back();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box className="flex justify-between items-center mb-4">
            <Box className="flex items-center">
              <IconButton onClick={goBack} className="mr-2">
                <ArrowBack />
              </IconButton>
              <Typography variant="h4" className="font-serif">
                Yeni Takviye Ekle
              </Typography>
            </Box>
            <Box>
              <GradientButton
                className="mr-3"
                onClick={goBack}
                startIcon={<ArrowBack />}
                sx={{
                  background: "transparent",
                  border: "1px solid #6366F1",
                  color: "#6366F1",
                  "&:hover": {
                    background: "rgba(99, 102, 241, 0.05)",
                    boxShadow: "none",
                  },
                  marginRight: "10px",
                }}
              >
                İptal
              </GradientButton>
              <GradientButton
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Kaydet
              </GradientButton>
            </Box>
          </Box>
        </Grid>

        {/* Form */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" className="mb-4">
                  Takviye Bilgileri
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Takviye Adı"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Fiyat"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.price}
                      helperText={errors.price}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₺</InputAdornment>
                        ),
                        inputProps: { min: 0, step: 0.01 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Stok Miktarı"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.stock}
                      helperText={errors.stock}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">adet</InputAdornment>
                        ),
                        inputProps: { min: 0 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.category}>
                      <InputLabel>Kategori</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label="Kategori"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.replace("_", " ")}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <FormHelperText>{errors.category}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.featured}
                          onChange={handleSwitchChange}
                          name="featured"
                          color="primary"
                        />
                      }
                      label="Öne Çıkan Ürün"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Resim URL"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      fullWidth
                      error={!!errors.imageUrl}
                      helperText={
                        errors.imageUrl ||
                        "Boş bırakılırsa varsayılan resim kullanılır"
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleImagePreview}
                              disabled={
                                !formData.imageUrl ||
                                !formData.imageUrl.startsWith("http")
                              }
                              edge="end"
                            >
                              <ImageIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Açıklama"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      multiline
                      rows={6}
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Önizleme
              </Typography>
              <Paper
                elevation={0}
                className="bg-gray-100 rounded-lg p-4 flex flex-col items-center"
              >
                <Box className="w-full h-48 mb-3 rounded-lg overflow-hidden bg-white">
                  {formData.imageUrl ? (
                    <img
                      src={`/SupplementImage/${formData.imageUrl}`}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x400?text=Görsel+Yüklenemedi";
                      }}
                    />
                  ) : (
                    <Box className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon style={{ fontSize: 48, color: "#9CA3AF" }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="h6" className="font-bold text-center">
                  {formData.name || "Takviye Adı"}
                </Typography>
                {formData.category && (
                  <Chip
                    label={formData.category.replace("_", " ")}
                    size="small"
                    color="primary"
                    className="my-2"
                  />
                )}
                <Typography
                  variant="body1"
                  className="font-bold text-center text-indigo-600 my-2"
                >
                  {formData.price
                    ? `${parseFloat(formData.price).toLocaleString("tr-TR")} ₺`
                    : "0.00 ₺"}
                </Typography>
                <Divider className="w-full my-2" />
                <Typography
                  variant="body2"
                  className="text-gray-600 text-center line-clamp-3"
                  title={formData.description}
                >
                  {formData.description || "Ürün açıklaması burada görünecek"}
                </Typography>
              </Paper>

              <Box className="mt-4">
                <Typography variant="subtitle2" className="mb-2">
                  Önizleme Notları
                </Typography>
                <ul className="text-gray-600 pl-5">
                  <li className="text-sm mb-1">
                    Ürün bilgileri kaydedilmeden önce önizleme yapılabilir
                  </li>
                  <li className="text-sm mb-1">
                    Önizleme, gerçek ürün sayfasından farklı olabilir
                  </li>
                  <li className="text-sm">
                    Resim URL'si için geçerli bir web adresi girilmelidir
                  </li>
                </ul>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Image Preview Dialog */}
      {previewImage && (
        <Box
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleClosePreview}
        >
          <Box className="relative">
            <IconButton
              className="absolute top-2 right-2 bg-white hover:bg-gray-200"
              onClick={handleClosePreview}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={`/SupplementImage/${previewImage}`}
              alt="Image Preview"
              className="max-w-full max-h-[80vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/400x400?text=Görsel+Yüklenemedi";
              }}
            />
          </Box>
        </Box>
      )}

      {/* Scroll to top button */}
      <Box
        className="fixed bottom-6 right-6 z-10"
        sx={{ display: "flex", justifyContent: "flex-end" }}
      >
        <IconButton
          color="primary"
          onClick={scrollToTop}
          sx={{
            backgroundColor: "white",
            boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      </Box>
    </div>
  );
};

export default NewSupplementPage;
