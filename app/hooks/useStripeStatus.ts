import { useState, useEffect } from "react";
import axios from "axios";

type StripeStatusProps = {
  sessionId?: string | null;
  pollInterval?: number; // milisaniye cinsinden
  maxAttempts?: number;
};

type StripeStatusResult = {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  paymentStatus: string | null;
  orderData: any | null;
};

/**
 * Stripe ödeme durumunu kontrol etmek için hook
 *
 * @param sessionId Stripe session ID
 * @param pollInterval Kontrol aralığı (ms cinsinden, varsayılan: 2000ms)
 * @param maxAttempts Maksimum kontrol sayısı (varsayılan: 10)
 */
export function useStripeStatus({
  sessionId,
  pollInterval = 2000,
  maxAttempts = 10,
}: StripeStatusProps): StripeStatusResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    // Session ID yoksa işlem yapmıyoruz
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        // API'dan ödeme durumunu kontrol et
        const response = await axios.get(
          `/api/checkout?session_id=${sessionId}`
        );

        if (!isMounted) return;

        if (response.data.success) {
          // Başarılı ödeme
          setIsSuccess(true);
          setPaymentStatus(response.data.paymentStatus);
          setOrderData(response.data.order);
          setIsLoading(false);
          clearInterval(intervalId);
        } else if (attempts >= maxAttempts) {
          // Maksimum deneme sayısına ulaşıldı
          setError(
            "Ödeme durumu doğrulanamadı. Lütfen daha sonra tekrar deneyin."
          );
          setIsLoading(false);
          clearInterval(intervalId);
        } else {
          // Deneme sayısını artır
          setAttempts((prev) => prev + 1);
        }
      } catch (error: any) {
        if (!isMounted) return;

        if (attempts >= maxAttempts) {
          setError(
            error.message || "Ödeme durumu kontrol edilirken bir hata oluştu."
          );
          setIsLoading(false);
          clearInterval(intervalId);
        } else {
          // Deneme sayısını artır
          setAttempts((prev) => prev + 1);
        }
      }
    };

    // İlk kontrolü hemen yap
    checkStatus();

    // Belirli aralıklarla kontrol et
    intervalId = setInterval(checkStatus, pollInterval);

    // Temizleme fonksiyonu
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [sessionId, pollInterval, maxAttempts, attempts]);

  return {
    isLoading,
    error,
    isSuccess,
    paymentStatus,
    orderData,
  };
}
