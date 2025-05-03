"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  FavoriteBorder,
  Favorite,
  Share,
  AccessTime,
  Comment,
} from "@mui/icons-material";
import type { Advice, Doctor } from "@/app/store/doctorAdviceStore";
import { useDoctorAdviceStore } from "@/app/store/doctorAdviceStore";

interface AdviceDetailProps {
  advice: Advice;
  doctor: Doctor;
}

const AdviceDetail = ({ advice, doctor }: AdviceDetailProps) => {
  const { likeAdvice } = useDoctorAdviceStore();
  const [openContact, setOpenContact] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [comment, setComment] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const handleLike = () => {
    likeAdvice(advice.id);
  };

  const handleOpenContact = () => {
    setOpenContact(true);
  };

  const handleCloseContact = () => {
    setOpenContact(false);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
    setShareUrl(window.location.href);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleSubmitContact = () => {
    // Burada form gönderme işlemi gerçekleştirilecek
    console.log("Mesaj gönderildi:", comment);
    setComment("");
    handleCloseContact();
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    handleCloseShare();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "20px",
          background: "linear-gradient(145deg, #ffffff, #f5f7fa)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
          mb: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Kategori etiketi - sağ üst köşede */}
        <Box sx={{ position: "absolute", top: 20, right: 20 }}>
          <Chip
            label={advice.category}
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

        {/* Başlık ve Tarih */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="primary.dark"
            gutterBottom
          >
            {advice.title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.secondary",
              mb: 1,
            }}
          >
            <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">{advice.date}</Typography>
          </Box>
        </Box>

        {/* İçerik */}
        <Typography
          variant="body1"
          sx={{ mb: 4, lineHeight: 1.8, color: "text.primary" }}
          dangerouslySetInnerHTML={{ __html: advice.content }}
        />

        {/* Doktor Bilgisi */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "16px",
            bgcolor: "rgba(236, 240, 255, 0.6)",
            display: "flex",
            alignItems: "center",
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar
            src={doctor.image}
            alt={doctor.name}
            sx={{
              width: 80,
              height: 80,
              border: "4px solid white",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight={600} color="primary.dark">
              {doctor.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {doctor.title} • {doctor.specialty}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doctor.bio}
            </Typography>
          </Box>
        </Paper>

        {/* Etkileşim Bölümü */}
        <Divider sx={{ mb: 2.5 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleLike}
              color={advice.isLiked ? "error" : "default"}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {advice.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography>{advice.likes}</Typography>

            <IconButton
              onClick={handleOpenShare}
              sx={{
                ml: 1,
                transition: "all 0.2s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              <Share />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            startIcon={<Comment />}
            onClick={handleOpenContact}
            sx={{
              borderRadius: "30px",
              px: 3,
              py: 1,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 10px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                boxShadow: "0 5px 15px rgba(33, 150, 243, 0.4)",
              },
            }}
          >
            Doktora Danış
          </Button>
        </Box>
      </Paper>

      {/* İletişim Formu Modalı */}
      <Dialog
        open={openContact}
        onClose={handleCloseContact}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600} color="primary.dark">
            Dr. {doctor.name} ile İletişime Geç
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Sorularınızı yazın, uzmanımız en kısa sürede size yanıt verecektir.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Mesajınız"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button onClick={handleCloseContact} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleSubmitContact}
            variant="contained"
            disabled={!comment.trim()}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Paylaşım Modalı */}
      <Dialog
        open={openShare}
        onClose={handleCloseShare}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Bu tavsiyeyi paylaş
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseShare} color="inherit">
            İptal
          </Button>
          <Button onClick={handleCopyShareLink} variant="contained">
            Linki Kopyala
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdviceDetail;
