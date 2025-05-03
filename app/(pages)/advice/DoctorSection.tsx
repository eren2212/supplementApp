"use client";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { Email, Phone, VerifiedUser } from "@mui/icons-material";
import type { Doctor } from "@/app/store/doctorAdviceStore";

interface DoctorSectionProps {
  doctors: Doctor[];
}

const DoctorSection = ({ doctors }: DoctorSectionProps) => {
  const handleContactDoctor = (doctor: Doctor) => {
    if (doctor.email) {
      window.location.href = `mailto:${doctor.email}?subject=Sağlık Danışmanlığı Hakkında&body=Merhaba Dr. ${doctor.name}, `;
    } else {
      // E-posta yoksa bilgi mesajı gösterilebilir ya da varsayılan bir e-posta kullanılabilir
      window.location.href = `mailto:info@supplementapp.com?subject=Sağlık Danışmanlığı - ${doctor.name} İçin&body=Merhaba, Dr. ${doctor.name} ile iletişime geçmek istiyorum.`;
    }
  };

  if (doctors.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Doktor listesi yüklenemedi.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {doctors.map((doctor, index) => (
          <Grid item xs={12} md={6} key={doctor.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    height: "100%",
                  }}
                >
                  {/* Doktor avatar alanı */}
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 180 },
                      minHeight: { xs: 200, sm: "auto" },
                      bgcolor: "primary.light",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                    }}
                  >
                    <Avatar
                      src={doctor.image}
                      alt={doctor.name}
                      sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid white",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        icon={<VerifiedUser sx={{ fontSize: 14 }} />}
                        label="Uzman"
                        color="primary"
                        sx={{
                          borderRadius: "12px",
                          fontWeight: 600,
                          bgcolor: "white",
                          color: "primary.main",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Doktor bilgileri */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary.dark"
                      gutterBottom
                    >
                      {doctor.name}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      fontWeight={600}
                      gutterBottom
                    >
                      {doctor.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ mb: 2 }}
                    >
                      <strong>Uzmanlık:</strong> {doctor.specialty}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      {doctor.bio}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Phone
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                        <Email
                          fontSize="small"
                          color="action"
                          sx={{ opacity: 0.6 }}
                        />
                      </Box>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleContactDoctor(doctor)}
                        sx={{
                          borderRadius: "30px",
                          textTransform: "none",
                          px: 3,
                          boxShadow: "0 4px 14px rgba(33, 150, 243, 0.2)",
                          "&:hover": {
                            boxShadow: "0 6px 20px rgba(33, 150, 243, 0.3)",
                          },
                        }}
                      >
                        İletişime Geç
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorSection;
