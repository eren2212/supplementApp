import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { themeColors } from "./ProfilePage";

import { useSession } from "next-auth/react";

const DeleteAccount = () => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // app/components/profil/DeleteAccount.tsx
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // API endpoint'i üzerinden aktivite kaydı
      await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "account_deletion",
          details: "User deleted their account",
        }),
      });

      // Hesap silme işlemi
      const response = await axios.delete("/api/profile");

      if (response.data.success) {
        toast.success("Hesabınız silindi.");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(response.data.message || "Hesap silinirken hata oluştu.");
      }
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      toast.error("Hesap silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
      handleClose();
    }
  };

  return (
    <>
      {/* Profil Silme Box */}
      <Box
        sx={{
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          borderRadius: 2,
          p: 3,
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: themeColors.error,
          }}
        >
          Hesabınızı Sil
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Hesabınızı silmek, tüm kişisel bilgilerinizin ve geçmişinizin kalıcı
          olarak silinmesine neden olur.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            },
          }}
          onClick={handleOpen}
        >
          Hesabı Sil
        </Button>
      </Box>

      {/* Hesap Silme Onay Dialogu */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: themeColors.error }}>Hesabı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem
            geri alınamaz!
          </DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="error">
              <strong>Uyarı:</strong> Tüm sipariş geçmişiniz, yorumlarınız ve
              kişisel verileriniz kalıcı olarak silinecektir.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: themeColors.error,
              },
            }}
          >
            {isDeleting ? "Siliniyor..." : "Evet, Hesabımı Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccount;
