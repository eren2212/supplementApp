"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  StripeCardElementChangeEvent,
  PaymentIntentResult,
} from "@stripe/stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

// Stripe dışarıdan yükle (Stripe Publishable Key gerekli)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Card Element stil seçenekleri
const cardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: Error) => void;
  buttonText?: string;
}

// Ödeme formu bileşeni
const PaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  buttonText = "Ödeme Yap",
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Ödeme intent oluştur
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        console.log("Ödeme isteği gönderiliyor:", amount);

        const response = await fetch("/api/stripe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            description: "Ürün satın alma",
            saveCard: saveCard,
          }),
        });

        console.log("Ödeme yanıtı:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Ödeme hatası:", errorData);
          throw new Error(errorData.error || "Ödeme hazırlığı başarısız oldu");
        }

        const data = await response.json();
        console.log("Ödeme client secret alındı:", !!data.clientSecret);
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error("Ödeme fetch hatası:", error);
        setError(error.message);
        if (onPaymentError) onPaymentError(error);
        toast.error("Ödeme hazırlanırken bir hata oluştu!");
      }
    };

    if (amount > 0) {
      fetchPaymentIntent();
    }
  }, [amount, onPaymentError, saveCard]);

  // Ödeme işlemi
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Kart bilgileri bulunamadı");
      }

      // Stripe ile ödemeyi tamamla
      const paymentMethodOptions = {
        card: cardElement,
        billing_details: {
          // İsteğe bağlı müşteri bilgileri
        },
      };

      // Kartı kaydetme seçeneği varsa ayrı bir işlem yap
      if (saveCard) {
        // Önce ödeme yöntemi oluştur
        const { error: paymentMethodError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
          });

        if (paymentMethodError) {
          // Hatayı Türkçeleştirerek fırlat
          let turkceHataMesaji =
            "Kart işlenirken bir hata oluştu. Lütfen tekrar deneyin.";
          console.log("Ödeme yöntemi hatası:", paymentMethodError);
          throw new Error(turkceHataMesaji);
        }

        console.log("Ödeme yöntemi oluşturuldu:", paymentMethod.id);
      }

      // Ödeme işlemini gerçekleştir
      console.log("Ödeme işlemi başlatılıyor...");
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodOptions,
      });

      console.log("Ödeme sonucu:", result);

      const { error, paymentIntent } = result;

      if (error) {
        // Hata mesajını Türkçeleştir
        let turkceHataMesaji = "Ödeme işlemi sırasında bir hata oluştu.";

        if (error.code === "card_declined") {
          if (error.decline_code === "insufficient_funds") {
            turkceHataMesaji =
              "Kartınızda yeterli bakiye bulunmuyor. Lütfen başka bir kart ile ödeme yapmayı deneyin.";
          } else if (error.decline_code === "lost_card") {
            turkceHataMesaji = "Bu kart kayıp olarak bildirilmiş.";
          } else if (error.decline_code === "stolen_card") {
            turkceHataMesaji = "Bu kart çalıntı olarak bildirilmiş.";
          } else {
            turkceHataMesaji =
              "Kartınız reddedildi. Lütfen başka bir kart ile ödeme yapmayı deneyin.";
          }
        } else if (error.type === "validation_error") {
          turkceHataMesaji =
            "Kart bilgilerinde hata var. Lütfen kontrol edip tekrar deneyin.";
        }

        console.log("Ödeme hatası detayları:", {
          code: error.code,
          type: error.type,
          decline_code: error.decline_code,
          message: error.message,
        });

        throw new Error(turkceHataMesaji);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Ödeme başarıyla tamamlandı!");
        if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
      } else {
        throw new Error(
          "Ödeme işlemi tamamlanamadı. Daha sonra tekrar deneyin."
        );
      }
    } catch (error: any) {
      // Hata detaylarını kontrol et ve güvenli bir şekilde logla
      const errorMessage =
        error.message || "Ödeme işlemi sırasında bir hata oluştu!";
      console.log("İşlenen hata:", errorMessage);

      setError(errorMessage);
      if (onPaymentError) onPaymentError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Kart Bilgileri
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
          }}
        >
          <CardElement options={cardElementOptions} />
        </Paper>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            color="primary"
          />
        }
        label="Kartımı gelecekteki ödemeler için kaydet"
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          disabled={loading}
        >
          Geri Dön
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!stripe || loading || !clientSecret}
          startIcon={
            loading ? <CircularProgress size={20} /> : <LockOutlined />
          }
          sx={{ minWidth: 200 }}
        >
          {loading ? "İşleniyor..." : buttonText}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Ödemeniz 256-bit SSL ile korunmaktadır.
        </Typography>
      </Box>
    </Box>
  );
};

interface StripePaymentFormProps extends PaymentFormProps {}

// Stripe Elements ile sarmalayan ana bileşen
const StripePaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  buttonText,
}: StripePaymentFormProps) => {
  return (
    <Container maxWidth="sm">
      <Elements stripe={stripePromise}>
        <PaymentForm
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          buttonText={buttonText}
        />
      </Elements>
    </Container>
  );
};

export default StripePaymentForm;
