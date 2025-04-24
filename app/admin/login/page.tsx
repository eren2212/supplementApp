"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { AdminPanelSettings as AdminIcon } from "@mui/icons-material";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Lütfen e-posta ve şifre giriniz");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Giriş başarısız. E-posta veya şifre yanlış.");
        setLoading(false);
        return;
      }

      // Redirect to admin settings page after successful login
      toast.success("Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz.");
      router.push("/admin/settings");
    } catch (error) {
      setError("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Card
        sx={{
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        {loading && <LinearProgress />}

        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "primary.main",
                width: 64,
                height: 64,
              }}
            >
              <AdminIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              Yönetici Girişi
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              Bakım modunu yönetmek için giriş yapın
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 2,
                fontWeight: "medium",
              }}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
