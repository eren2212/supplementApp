"use client";

import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline, ArrowBack, ShoppingCart } from "@mui/icons-material";
import Link from "next/link";

export default function CancelPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <ErrorOutline sx={{ fontSize: 80, color: "error.main", mb: 3 }} />

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ödeme İptal Edildi
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "500px" }}
          >
            Ödeme işleminiz iptal edildi veya tamamlanamadı. Endişelenmeyin,
            hesabınızdan herhangi bir ücret alınmadı.
          </Typography>

          <Box
            sx={{
              width: "100%",
              mb: 4,
              p: 3,
              backgroundColor: "rgba(229, 57, 53, 0.05)",
              borderRadius: "12px",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Ödeme işlemi sırasında bir sorun mu yaşadınız? Destek ekibimizle
              iletişime geçebilir veya tekrar deneyebilirsiniz.
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              component={Link}
              href="/cart"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ borderRadius: "8px", py: 1.5, px: 3 }}
            >
              Sepete Dön
            </Button>

            <Button
              component={Link}
              href="/supplement"
              variant="contained"
              startIcon={<ShoppingCart />}
              sx={{ borderRadius: "8px", py: 1.5, px: 3 }}
            >
              Alışverişe Devam Et
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
