"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  TextField,
  Box,
  Button,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import { Save as SaveIcon, ArrowBack, Send } from "@mui/icons-material";
import axios from "axios";
import { adviceCategories } from "@/app/store/doctorAdviceStore";
import { useFormik } from "formik";
import * as yup from "yup";
import dynamic from "next/dynamic";
import Link from "next/link";

// CKEditor dinamik olarak yüklenir (yalnızca istemci tarafında)
const CKEditor = dynamic(() => import("@/app/components/CKEditor"), {
  ssr: false,
  loading: () => <p>Editor yükleniyor...</p>,
});

// Form doğrulama şeması
const validationSchema = yup.object({
  title: yup
    .string()
    .required("Başlık gereklidir")
    .min(5, "Başlık en az 5 karakter olmalıdır")
    .max(100, "Başlık en fazla 100 karakter olmalıdır"),
  content: yup
    .string()
    .required("İçerik gereklidir")
    .min(50, "İçerik en az 50 karakter olmalıdır"),
  category: yup.string().required("Kategori seçimi gereklidir"),
  imageUrl: yup.string().url("Geçerli bir URL girilmelidir").nullable(),
});

export default function CreateAdvicePage() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      category: "",
      imageUrl: "",
      status: "draft", // Varsayılan durum: taslak
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // API'ye yeni tavsiye gönder
        await axios.post("/api/doctor/advices", values);

        // Başarılı olduğunda doktor paneline yönlendir
        router.push("/doctor");
        router.refresh();
      } catch (error: any) {
        console.error("Tavsiye ekleme hatası:", error);
        setError(
          error.response?.data?.error || "Tavsiye eklenirken bir hata oluştu"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Tavsiye durumunu değiştirir (yayınla veya taslak olarak kaydet)
  const handleStatusChange = (status: string) => {
    formik.setFieldValue("status", status);
    formik.handleSubmit();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Link href="/doctor" passHref>
            <Button variant="outlined" startIcon={<ArrowBack />} sx={{ mr: 2 }}>
              Geri Dön
            </Button>
          </Link>
          <Typography variant="h5" component="h1">
            Yeni Tavsiye Ekle
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Tavsiye Başlığı"
                variant="outlined"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
              >
                <InputLabel id="category-label">Kategori</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  label="Kategori"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                >
                  {adviceCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="imageUrl"
                name="imageUrl"
                label="Görsel URL (isteğe bağlı)"
                variant="outlined"
                value={formik.values.imageUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.imageUrl && Boolean(formik.errors.imageUrl)
                }
                helperText={formik.touched.imageUrl && formik.errors.imageUrl}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tavsiye İçeriği
              </Typography>
              <CKEditor
                value={formik.values.content}
                onChange={(content: string) =>
                  formik.setFieldValue("content", content)
                }
                disabled={isSubmitting}
              />
              {formik.touched.content && formik.errors.content && (
                <FormHelperText error>
                  {formik.errors.content as string}
                </FormHelperText>
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => handleStatusChange("draft")}
                disabled={isSubmitting || !formik.isValid}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Taslak Olarak Kaydet"
                )}
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<Send />}
                onClick={() => handleStatusChange("published")}
                disabled={isSubmitting || !formik.isValid}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Yayınla"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
