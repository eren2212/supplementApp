"use client";

import { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack,
  Image as ImageIcon,
  KeyboardArrowUp,
  Close as CloseIcon,
  Backspace,
  PhotoCamera,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { SelectChangeEvent } from "@mui/material/Select";
import { useSupplementStore } from "@/app/store/supplementStore";
import { toast } from "react-hot-toast";
import { use } from "react";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.07)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "100%",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.09)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)",
  borderRadius: 50,
  color: "white",
  padding: "12px 32px",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #5253D3 30%, #7A4BE0 90%)",
    boxShadow: "0 6px 12px rgba(99, 102, 241, 0.25)",
    transform: "translateY(-2px)",
  },
}));

const categories = [
  "BRAIN",
  "WOMEN_HEALTH",
  "MENS_HEALTH",
  "HEART",
  "SLEEP",
  "ENERGY",
];

// Map kategori isimleri: İngilizce enum değeri -> Türkçe görünen adı
const categoryMap = {
  BRAIN: "Beyin Sağlığı",
  WOMEN_HEALTH: "Kadın Sağlığı",
  MENS_HEALTH: "Erkek Sağlığı",
  HEART: "Kalp Sağlığı",
  SLEEP: "Uyku Düzeni",
  ENERGY: "Enerji",
};

interface FormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  featured?: boolean;
}

interface Supplement extends Omit<FormData, "price" | "stock"> {
  id: string;
  price: number;
  stock: number;
}

interface PageParams {
  params: {
    id: string;
  };
}

const EditSupplementPage = ({ params }: PageParams) => {
  const router = useRouter();
  // @ts-ignore - TypeScript hatasını gidermek için
  const supplementId = use(params).id;

  const {
    supplements,
    isLoading,
    error: storeError,
    fetchSupplements,
    updateSupplement,
  } = useSupplementStore();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    featured: false,
  });
  const [originalData, setOriginalData] = useState<Supplement | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplement = async () => {
      try {
        setPageLoading(true);
        // First try to find the supplement in our store
        const storedSupplement = supplements.find((s) => s.id === supplementId);

        if (storedSupplement) {
          setOriginalData(storedSupplement as any);
          // Fill the form with the stored data
          setFormData({
            name: storedSupplement.name,
            description: storedSupplement.description,
            price: storedSupplement.price.toString(),
            stock: storedSupplement.stock.toString(),
            category: storedSupplement.category,
            imageUrl: storedSupplement.imageUrl,
            featured: storedSupplement.featured || false,
          });
          setPageLoading(false);
        } else {
          // If not found in store, fetch from API
          const response = await axios.get(
            `/api/admin/supplements/${supplementId}`
          );
          setOriginalData(response.data);

          // Fill the form with the fetched data
          setFormData({
            name: response.data.name,
            description: response.data.description,
            price: response.data.price.toString(),
            stock: response.data.stock.toString(),
            category: response.data.category,
            imageUrl: response.data.imageUrl,
            featured: response.data.featured || false,
          });
          setPageLoading(false);
        }
      } catch (error) {
        setFetchError(
          (error as any).response?.data?.error ||
            "Takviye bilgileri yüklenirken bir hata oluştu"
        );
        console.error("Error fetching supplement:", error);
        setPageLoading(false);
      }
    };

    // If supplements is empty, fetch them first
    if (supplements.length === 0) {
      fetchSupplements().then(() => fetchSupplement());
    } else {
      fetchSupplement();
    }
  }, [supplementId, supplements, fetchSupplements]);

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
    if (formData.imageUrl) {
      setPreviewImage(`/SupplementImage/${formData.imageUrl}`);
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
      await updateSupplement(supplementId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl,
        featured: formData.featured,
      });

      // Show success message
      toast.success("Takviye başarıyla güncellendi");

      // Redirect back to supplements list
      router.push("/admin/supplements");
    } catch (error) {
      console.error("Error updating supplement:", error);
      toast.error(
        (error as any).response?.data?.error ||
          "Takviye güncellenirken bir hata oluştu."
      );
    }
  };

  const goBack = () => {
    router.back();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pageLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box className="p-6">
        <Alert severity="error" className="mb-4">
          {fetchError}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={goBack}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Grid container spacing={4}>
        {/* Header */}
        <Grid item xs={12}>
          <Box className="flex justify-between items-center mb-6">
            <Box className="flex items-center">
              <IconButton
                onClick={goBack}
                className="mr-2"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  mr: 2,
                  "&:hover": {
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h4"
                className="font-serif"
                sx={{
                  fontWeight: 700,
                  color: "#2D3748",
                  position: "relative",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    width: "30%",
                    height: "4px",
                    bottom: "-10px",
                    left: "0",
                    background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                    borderRadius: "2px",
                  },
                }}
              >
                Takviye Düzenle: {originalData?.name}
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                onClick={goBack}
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: "30px",
                  borderColor: "#6366F1",
                  color: "#6366F1",
                  mr: 2,
                  px: 3,
                  py: 1,
                  "&:hover": {
                    borderColor: "#5253D3",
                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                  },
                }}
              >
                İptal
              </Button>
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
                {isLoading ? "Güncelleniyor..." : "Güncelle"}
              </GradientButton>
            </Box>
          </Box>
        </Grid>

        {/* Form */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    fontWeight: 600,
                    color: "#4A5568",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#6366F1",
                      display: "inline-block",
                      mr: 2,
                    }}
                  />
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.category}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    >
                      <InputLabel>Kategori</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label="Kategori"
                      >
                        {Object.keys(categoryMap).map((category) => (
                          <MenuItem key={category} value={category}>
                            {categoryMap[category as keyof typeof categoryMap]}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <FormHelperText>{errors.category}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                        border: "1px solid rgba(229, 231, 235, 0.5)",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.featured}
                            onChange={handleSwitchChange}
                            name="featured"
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 500 }}>
                            Öne Çıkan Ürün
                          </Typography>
                        }
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        border: "1px dashed #CBD5E0",
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, color: "#4A5568", fontWeight: 600 }}
                      >
                        Ürün Görseli
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
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
                          variant="outlined"
                          sx={{
                            mr: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleImagePreview}
                                  disabled={!formData.imageUrl}
                                  edge="end"
                                >
                                  <ImageIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          variant="contained"
                          component="label"
                          sx={{
                            borderRadius: "12px",
                            backgroundColor: "#6366F1",
                            "&:hover": {
                              backgroundColor: "#5253D3",
                            },
                            minWidth: "auto",
                            width: "48px",
                            height: "48px",
                            p: 0,
                          }}
                        >
                          <PhotoCamera />
                          <input type="file" hidden />
                        </Button>
                      </Box>
                    </Box>
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ position: "sticky", top: "20px" }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: "#6366F1",
                color: "white",
                borderTopLeftRadius: "inherit",
                borderTopRightRadius: "inherit",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Önizleme
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: "rgba(249, 250, 251, 0.8)",
                  borderRadius: "16px",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "200px",
                    mb: 3,
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "white",
                    border: "1px solid rgba(229, 231, 235, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {formData.imageUrl ? (
                    <img
                      src={`/SupplementImage/${formData.imageUrl}`}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.png";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F7FAFC",
                        flexDirection: "column",
                        p: 3,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 48, color: "#CBD5E0" }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#718096",
                          mt: 1,
                          textAlign: "center",
                        }}
                      >
                        Ürün görseli eklendiğinde burada görünecek
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#2D3748",
                  }}
                >
                  {formData.name || "Takviye Adı"}
                </Typography>
                {formData.category && (
                  <Chip
                    label={
                      categoryMap[formData.category as keyof typeof categoryMap]
                    }
                    size="small"
                    sx={{
                      my: 2,
                      backgroundColor: "#EBF4FF",
                      color: "#3182CE",
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                  />
                )}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#5A67D8",
                    my: 2,
                    fontSize: "1.25rem",
                  }}
                >
                  {formData.price
                    ? `${parseFloat(formData.price).toLocaleString("tr-TR")} ₺`
                    : "0.00 ₺"}
                </Typography>
                <Divider sx={{ width: "100%", my: 2 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#718096",
                    textAlign: "center",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={formData.description}
                >
                  {formData.description || "Ürün açıklaması burada görünecek"}
                </Typography>
              </Paper>

              {originalData && originalData.id && (
                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      color: "#4A5568",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#6366F1",
                        display: "inline-block",
                        mr: 1,
                      }}
                    />
                    Ürün Bilgileri
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "#EDF2F7",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Typography variant="body2" sx={{ color: "#718096" }}>
                          Ürün ID:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", color: "#4A5568" }}
                        >
                          {originalData.id.substring(0, 8)}...
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography variant="body2" sx={{ color: "#718096" }}>
                          Kategori:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#4A5568" }}>
                          {
                            categoryMap[
                              originalData.category as keyof typeof categoryMap
                            ]
                          }
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography variant="body2" sx={{ color: "#718096" }}>
                          Mevcut Stok:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              originalData.stock < 10 ? "#E53E3E" : "#4A5568",
                            fontWeight: originalData.stock < 10 ? 700 : 400,
                          }}
                        >
                          {originalData.stock} adet
                        </Typography>
                      </div>
                      <div className="flex justify-between items-center">
                        <Typography variant="body2" sx={{ color: "#718096" }}>
                          Güncel Fiyat:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#4A5568" }}>
                          {originalData.price.toLocaleString("tr-TR")} ₺
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Image Preview Dialog */}
      {previewImage && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          }}
          onClick={handleClosePreview}
        >
          <Box sx={{ position: "relative", maxWidth: "90%" }}>
            <IconButton
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "white",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
                zIndex: 1,
              }}
              onClick={handleClosePreview}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={previewImage}
              alt="Image Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
              }}
            />
          </Box>
        </Box>
      )}

      {/* Scroll to top button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            backgroundColor: "white",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            width: 48,
            height: 48,
            "&:hover": {
              backgroundColor: "#f9fafb",
              transform: "translateY(-2px)",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      </Box>
    </div>
  );
};

export default EditSupplementPage;
