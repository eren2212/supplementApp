"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface PaymentDetails {
  amount: number;
  description: string;
  status: string;
  created: number;
}

export default function OdemeBasariliPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL'den payment_intent parametresini al
    const payment_intent = searchParams.get("payment_intent");

    if (!payment_intent) {
      setError("Ödeme bilgisi bulunamadı");
      setLoading(false);
      return;
    }

    setPaymentId(payment_intent);

    // Ödeme detaylarını getir
    const fetchPaymentDetails = async () => {
      try {
        // NOT: Bu API endpoint'i oluşturmanız gerekecek
        const response = await axios.get(
          `/api/stripe/payment-details?payment_intent=${payment_intent}`
        );
        setPaymentDetails(response.data);
      } catch (err) {
        console.error("Ödeme detayları alınamadı:", err);
        // Hata olsa bile sayfayı göstermeye devam ediyoruz
        // setError("Ödeme detayları alınamadı");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    // API endpoint henüz yoksa, direkt başarılı göster
    // setLoading(false);
  }, [searchParams]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 mb-4">
            <p>{error}</p>
            <div className="mt-8">
              <Link
                href="/"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Siparişiniz Tamamlandı!
            </h1>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              {paymentId && (
                <p className="mb-2 text-gray-700">
                  <span className="font-semibold">Sipariş No:</span>{" "}
                  <span className="font-mono text-sm bg-gray-100 p-1 rounded">
                    {paymentId}
                  </span>
                </p>
              )}

              {paymentDetails && (
                <>
                  <p className="mb-2 text-gray-700">
                    <span className="font-semibold">Tutar:</span>{" "}
                    {(paymentDetails.amount / 100).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </p>
                  <p className="mb-2 text-gray-700">
                    <span className="font-semibold">Tarih:</span>{" "}
                    {formatDate(paymentDetails.created)}
                  </p>
                </>
              )}
            </div>

            <p className="mb-8 text-gray-600">
              Ödemeniz başarıyla tamamlanmıştır. Siparişiniz en kısa sürede
              hazırlanacak. Teşekkür ederiz.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/profile/orders"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Siparişlerime Git
              </Link>

              <button
                onClick={() => router.push("/supplement")}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Alışverişe Devam Et
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
