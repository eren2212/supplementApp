"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { AiOutlineDelete } from "react-icons/ai";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  name?: string;
  price?: number;
  imageUrl?: string;
}

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();
  const total = getTotalPrice();
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch("/api/supplements");
      if (!response.ok) throw new Error("Detaylar getirilemedi.");

      const supplements = await response.json();

      items.forEach((item) => {
        const supplement = supplements.find((s: any) => s.id === item.id);
        if (supplement) {
          item.name = supplement.name;
          item.price = supplement.price;
          item.imageUrl = supplement.imageUrl;
        }
      });

      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Ürün detayları yüklenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const openRemoveDialog = (id: string) => {
    setItemToRemove(id);
    setRemoveDialogOpen(true);
  };

  const closeRemoveDialog = () => {
    setRemoveDialogOpen(false);
    setItemToRemove(null);
  };

  const openClearDialog = () => {
    setClearDialogOpen(true);
  };

  const closeClearDialog = () => {
    setClearDialogOpen(false);
  };

  const handleRemoveItem = () => {
    if (itemToRemove) {
      removeItem(itemToRemove);
      toast.success("Ürün sepetten kaldırıldı.");
      closeRemoveDialog();
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Sepet başarıyla temizlendi.");
    closeClearDialog();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          Yükleniyor...
        </p>
      </div>
    );
  }

  // İsmi bulmak için yardımcı fonksiyon
  const getItemName = (id: string) => {
    const item = items.find((item) => item.id === id);
    return item?.name || "Ürün";
  };

  return (
    <div className="container mx-auto px-4 py-10 mt-25">
      <h1 className="text-4xl font-bold mb-10 text-center text-blue-700">
        Alışveriş Sepetiniz
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-xl text-gray-600 mb-8">
            Sepetinizde henüz ürün bulunmuyor.
          </p>
          <Link href="/supplement">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 cursor-pointer"
            >
              Alışverişe Başla
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Ürün Listesi */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 bg-white shadow-lg rounded-xl p-5"
                >
                  <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0">
                    <Image
                      src={`/SupplementImage/${item.imageUrl
                        ?.split("/")
                        .pop()}`}
                      alt={item.name || "Ürün"}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-grow space-y-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 font-bold text-lg">
                      {item.price?.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </motion.button>
                        <span className="text-lg font-medium">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </motion.button>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openRemoveDialog(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Kaldır
                        <AiOutlineDelete
                          className="inline-block ml-2"
                          size={20}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="text-right mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openClearDialog}
                className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
              >
                Sepeti Temizle
              </motion.button>
            </div>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-xl p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Sipariş Özeti
              </h2>

              <div className="space-y-4 text-gray-700 text-base">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>
                    {total.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span className="text-green-600 font-semibold">Ücretsiz</span>
                </div>

                <hr />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Toplam</span>
                  <span>
                    {total.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 w-full py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition cursor-pointer"
                onClick={() => router.push("/odeme")}
              >
                Siparişi Tamamla
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Silme Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={closeRemoveDialog}
        aria-labelledby="remove-dialog-title"
        aria-describedby="remove-dialog-description"
      >
        <DialogTitle id="remove-dialog-title" sx={{ color: "error.main" }}>
          Ürünü Sepetten Çıkar
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-dialog-description">
            <strong>{getItemName(itemToRemove || "")}</strong> ürününü
            sepetinizden çıkarmak istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeRemoveDialog}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            İptal
          </Button>
          <Button
            onClick={handleRemoveItem}
            color="error"
            variant="contained"
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
          >
            Evet, Çıkar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sepet Temizleme Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={closeClearDialog}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
      >
        <DialogTitle id="clear-dialog-title" sx={{ color: "error.main" }}>
          Sepeti Temizle
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-dialog-description">
            Sepetinizdeki tüm ürünleri kaldırmak istediğinize emin misiniz?
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
              <strong>Uyarı:</strong> Bu işlem geri alınamaz ve sepetinizdeki
              tüm ürünler kaldırılacaktır.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeClearDialog}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            İptal
          </Button>
          <Button
            onClick={handleClearCart}
            color="error"
            variant="contained"
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
          >
            Evet, Temizle
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
