"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  NewAdvice,
} from "@/app/store/doctorAdviceStore";

const CreateAdvicePage = () => {
  const router = useRouter();
  const { addAdvice, loading, error, userDoctorId } = useDoctorAdviceStore();

  const [formData, setFormData] = useState<Omit<NewAdvice, "doctorId">>({
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

    if (!userDoctorId) {
      alert("Oturum açan doktor bilgisi bulunamadı!");
      return;
    }

    try {
      const newAdvice: NewAdvice = {
        ...formData,
        doctorId: userDoctorId,
      };

      await addAdvice(newAdvice);

      // Başarılı olduktan sonra dashboard'a yönlendir
      router.push("/doctor");
    } catch (error) {
      console.error("Tavsiye eklenirken hata oluştu:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "published",
    });
    setFormErrors({
      title: "",
      content: "",
      category: "",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <Link href="/doctor" passHref>
          <IconButton sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Yeni Tavsiye Ekle
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
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClear}
              disabled={loading}
            >
              Temizle
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
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateAdvicePage;
