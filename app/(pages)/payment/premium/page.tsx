"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { toast } from "react-hot-toast";

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post("/api/checkout-sessions", {
        // price_id göndermiyoruz, varsayılan premium ürünü kullanılacak
        redirectToPaymentSuccess: true, // Premium ödeme success sayfasına yönlendirme için
      });

      // Stripe Checkout sayfasına yönlendir
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Ödeme sayfası açılamadı.");
      }
    } catch (error) {
      console.error("Ödeme işlemi başlatılırken hata oluştu:", error);
      toast.error(
        "Ödeme işlemi başlatılamadı, lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Premium Üyelik</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Premium Üyelik Avantajları
        </h2>

        <ul className="space-y-4 mb-6">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Tüm premium içeriklere sınırsız erişim</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Öncelikli müşteri desteği</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Reklamsız deneyim</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Özel indirimler ve kampanyalar</span>
          </li>
        </ul>

        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Aylık ücret:</span>
            <span className="text-2xl font-bold">299 ₺</span>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {isLoading ? "İşleniyor..." : "Şimdi Satın Al"}
          </Button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Güvenli ödeme için Stripe kullanılmaktadır. İptal etme durumunda
            geri ödeme yapılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}
