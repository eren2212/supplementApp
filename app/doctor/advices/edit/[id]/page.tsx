"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Divider,
  FormHelperText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  useDoctorAdviceStore,
  adviceCategories,
  Advice,
} from "@/app/store/doctorAdviceStore";

const EditAdvicePage = () => {
  const router = useRouter();
  const params = useParams();
  const adviceId = Number(params.id);

  const {
    fetchDoctorAdvices,
    updateAdvice,
    loading,
    error,
    userDoctorId,
    setUserDoctorId,
  } = useDoctorAdviceStore();

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
    status?: "published" | "draft" | "pending";
  }>({
    title: "",
    content: "",
    category: "",
    status: "published",
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    content: "",
    category: "",
  });

  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Sabit doktor kimliği (oturum yönetimi ile değiştirilmeli)
  const currentDoctorId = 1;

  useEffect(() => {
    // Kullanıcı doktor ID'sini ayarla
    setUserDoctorId(currentDoctorId);

    // Tavsiye bilgilerini getir
    const loadAdvice = async () => {
      setLoadingAdvice(true);
      try {
        const doctorAdvices = await fetchDoctorAdvices(currentDoctorId);
        const advice = doctorAdvices.find((a) => a.id === adviceId);

        if (!advice) {
          setNotFound(true);
          setLoadingAdvice(false);
          return;
        }

        setFormData({
          title: advice.title,
          content: advice.content,
          category: advice.category,
          status: advice.status || "published",
        });

        setLoadingAdvice(false);
      } catch (error) {
        console.error("Tavsiye bilgisi yüklenirken hata oluştu:", error);
        setLoadingAdvice(false);
      }
    };

    if (adviceId) {
      loadAdvice();
    }
  }, [adviceId, fetchDoctorAdvices, setUserDoctorId, currentDoctorId]);

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      title: "",
      content: "",
      category: "",
    };

    // Validate title
    if (!formData.title.trim()) {
      errors.title = "Başlık gereklidir";
      isValid = false;
    } else if (formData.title.length < 5) {
      errors.title = "Başlık en az 5 karakter olmalıdır";
      isValid = false;
    }

    // Validate content
    if (!formData.content.trim()) {
      errors.content = "İçerik gereklidir";
      isValid = false;
    } else if (formData.content.length < 50) {
      errors.content = "İçerik en az 50 karakter olmalıdır";
      isValid = false;
    }

    // Validate category
    if (!formData.category) {
      errors.category = "Kategori seçilmelidir";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const updatedAdvice: Partial<Advice> = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
      };

      await updateAdvice(adviceId, updatedAdvice);

      // Başarılı olduktan sonra dashboard'a yönlendir
      router.push("/doctor");
    } catch (error) {
      console.error("Tavsiye güncellenirken hata oluştu:", error);
    }
  };

  const handleReset = () => {
    // Form alanlarını orijinal değerlere sıfırla
    const loadAdvice = async () => {
      try {
        const doctorAdvices = await fetchDoctorAdvices(currentDoctorId);
        const advice = doctorAdvices.find((a) => a.id === adviceId);

        if (advice) {
          setFormData({
            title: advice.title,
            content: advice.content,
            category: advice.category,
            status: advice.status || "published",
          });
        }
      } catch (error) {
        console.error("Tavsiye bilgisi yüklenirken hata oluştu:", error);
      }
    };

    loadAdvice();

    setFormErrors({
      title: "",
      content: "",
      category: "",
    });
  };

  if (loadingAdvice) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (notFound) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
          <Link href="/doctor" passHref>
            <IconButton sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Tavsiye Bulunamadı
          </Typography>
        </Box>

        <Alert severity="error">
          Düzenlemek istediğiniz tavsiye bulunamadı veya bu tavsiyeyi düzenleme
          yetkiniz yok.
        </Alert>

        <Box sx={{ mt: 4 }}>
          <Link href="/doctor" passHref>
            <Button variant="contained">Dashboard'a Dön</Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <Link href="/doctor" passHref>
          <IconButton sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Tavsiye Düzenle
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Tavsiye Başlığı"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.title}
                helperText={formErrors.title}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.category} required>
                <InputLabel id="category-label">Kategori</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  {adviceCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Durum</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  disabled={loading}
                >
                  <MenuItem value="published">Yayınla</MenuItem>
                  <MenuItem value="draft">Taslak Olarak Kaydet</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Tavsiye İçeriği"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={10}
                error={!!formErrors.content}
                helperText={
                  formErrors.content ||
                  `${formData.content.length} karakter (minimum 50 karakter gerekli)`
                }
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleReset}
              disabled={loading}
            >
              Değişiklikleri Sıfırla
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={loading}
              sx={{
                minWidth: 150,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              }}
            >
              {loading ? "Kaydediliyor..." : "Güncelle"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditAdvicePage;
