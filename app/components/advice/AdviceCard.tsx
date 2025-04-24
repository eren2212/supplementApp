"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CardActionArea,
  CardActions,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  FavoriteBorder,
  Favorite,
  BookmarkBorder,
  Bookmark,
} from "@mui/icons-material";
import type { Advice, Doctor } from "@/app/store/doctorAdviceStore";
import { useDoctorAdviceStore } from "@/app/store/doctorAdviceStore";

interface AdviceCardProps {
  advice: Advice;
  doctor: Doctor;
}

const AdviceCard = ({ advice, doctor }: AdviceCardProps) => {
  const router = useRouter();
  const { likeAdvice } = useDoctorAdviceStore();
  const [saved, setSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeAdvice(advice.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  const handleCardClick = () => {
    // Detay sayfasına yönlendirme yapılacak
    router.push(`/advice/${advice.id}`);
  };

  // Küçük bir özet metni oluştur
  const summaryText =
    advice.content.length > 120
      ? advice.content.substring(0, 120) + "..."
      : advice.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        sx={{
          maxWidth: 345,
          minHeight: 380,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <CardActionArea
          onClick={handleCardClick}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 3, width: "100%", flexGrow: 1 }}>
            {/* Kategori Chip */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label={advice.category}
                size="small"
                color={
                  advice.category === "Vitamin"
                    ? "primary"
                    : advice.category === "Mineral"
                    ? "success"
                    : advice.category === "Yağ Asitleri"
                    ? "info"
                    : advice.category === "Antioksidan"
                    ? "secondary"
                    : advice.category === "Sindirim"
                    ? "warning"
                    : "default"
                }
                sx={{
                  borderRadius: "12px",
                  fontWeight: 600,
                  px: 1,
                }}
              />
            </Box>

            {/* Başlık */}
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              fontWeight={700}
              color="primary.dark"
              sx={{ minHeight: 60 }}
            >
              {advice.title}
            </Typography>

            {/* İçerik Özeti */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
              }}
            >
              {summaryText}
            </Typography>

            {/* Tarih */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              {advice.date}
            </Typography>

            {/* Doktor Bilgisi */}
            <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
              <Avatar
                src={doctor.image}
                alt={doctor.name}
                sx={{
                  mr: 1.5,
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {doctor.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {doctor.title}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>

        <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleLike}
              color={advice.isLiked ? "error" : "default"}
            >
              {advice.isLiked ? (
                <Favorite fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {advice.likes}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={handleSave}
            color={saved ? "primary" : "default"}
          >
            {saved ? (
              <Bookmark fontSize="small" />
            ) : (
              <BookmarkBorder fontSize="small" />
            )}
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default AdviceCard;
