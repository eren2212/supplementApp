"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const RecommendationCard = ({ doctor }: any) => {
  const [open, setOpen] = useState(false); // Formu açıp kapatmak için durum
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    message: "",
  });

  // Modal açma ve kapama işlevleri
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Form verilerini güncelleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Mesaj formunu gönderme işlevi
  const handleSubmit = () => {
    console.log("Mesaj Gönderildi:", formData);
    setFormData({
      firstName: "",
      lastName: "",
      date: "",
      message: "",
    }); // Formu temizle
    handleClose(); // Modalı kapat
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-3xl p-6 flex flex-col items-center text-center w-full sm:w-[400px] mx-3.5 transition-transform duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={doctor.image}
        alt={doctor.name}
        className="w-24 h-24 rounded-full object-cover border-4 border-blue-400"
      />
      <h3 className="mt-4 text-xl font-semibold">{doctor.name}</h3>
      <p className="text-gray-500 text-sm">{doctor.date}</p>
      <p className="mt-2 font-medium text-blue-600">{doctor.vitamin}</p>
      <p className="mt-3 text-gray-700 text-sm">{doctor.advice}</p>

      {/* İletişime Geç Butonu */}
      <button
        onClick={handleOpen}
        className="mt-4 py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        İletişime Geç
      </button>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <DialogTitle className="text-2xl font-semibold text-center text-blue-700">
            Doktor ile İletişime Geç
          </DialogTitle>
          <DialogContent>
            {/* Form Alanları */}
            <div className="space-y-4">
              <TextField
                autoFocus
                margin="dense"
                id="firstName"
                label="İsim"
                name="firstName"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="rounded-xl"
              />
              <TextField
                margin="dense"
                id="lastName"
                label="Soyisim"
                name="lastName"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="rounded-xl"
              />
              <TextField
                margin="dense"
                id="date"
                label="Tarih"
                name="date"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.date}
                onChange={handleChange}
                required
                className="rounded-xl"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="dense"
                id="message"
                label="Mesajınız"
                name="message"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={4}
                required
                className="rounded-xl"
              />
            </div>
          </DialogContent>
          <DialogActions className="justify-between mt-4">
            <Button
              onClick={handleClose}
              color="secondary"
              className="py-2 px-6 text-sm font-semibold rounded-lg hover:bg-gray-300"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              className="py-2 px-6 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Gönder
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </motion.div>
  );
};

export default RecommendationCard;
