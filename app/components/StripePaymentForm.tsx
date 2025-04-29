"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  alpha,
  useTheme,
  Card,
  Stack,
  Fade,
  Chip,
  IconButton,
} from "@mui/material";
import {
  LockOutlined,
  SecurityOutlined,
  CreditCardOutlined,
  ArrowBackIosNew,
  InfoOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import axios from "axios";

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
      iconColor: "#2563eb",
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

// Ödeme intent'i başlatıldı mı kontrolü için
const PAYMENT_INTENT_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
};

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: Error) => void;
  buttonText?: string;
  additionalData?: { description?: string };
}

// Ödeme formu bileşeni
const PaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  buttonText = "Ödeme Yap",
  additionalData,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentIntentStatus, setPaymentIntentStatus] = useState(
    PAYMENT_INTENT_STATUS.NOT_STARTED
  );
  const [isExistingIntent, setIsExistingIntent] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Stripe ödeme niyeti oluştur
  useEffect(() => {
    // Eğer ödeme tamamlandıysa veya ödeme niyeti zaten beklemedeyse tekrar oluşturma
    if (
      paymentIntentStatus === PAYMENT_INTENT_STATUS.PENDING ||
      paymentIntentStatus === PAYMENT_INTENT_STATUS.SUCCEEDED
    ) {
      return;
    }

    if (amount > 0 && stripe && elements) {
      // Ödeme niyeti durumunu güncelle
      setPaymentIntentStatus(PAYMENT_INTENT_STATUS.PENDING);

      // Ödeme niyeti al
      async function getPaymentIntent() {
        setLoading(true);
        setError(null);

        try {
          const response = await axios.post("/api/stripe", {
            amount,
            description: additionalData?.description,
          });

          setClientSecret(response.data.clientSecret);

          // API'den mevcut bir intent kullanıldığı bilgisi gelirse kaydet
          if (response.data.isExisting) {
            setIsExistingIntent(true);
            toast.success("Mevcut bir ödeme işlemi kullanılıyor");
          } else {
            setIsExistingIntent(false);
          }

          console.log("Ödeme niyeti oluşturuldu", response.data);
        } catch (error: any) {
          console.error("Ödeme niyeti oluşturma hatası:", error);
          setError(
            error.message || "Ödeme hazırlığı sırasında bir hata oluştu"
          );
          setPaymentIntentStatus(PAYMENT_INTENT_STATUS.FAILED);
          if (onPaymentError) onPaymentError(error);
          toast.error(
            error.message || "Ödeme hazırlığı sırasında bir hata oluştu"
          );
        } finally {
          setLoading(false);
        }
      }

      getPaymentIntent();
    }
  }, [
    amount,
    stripe,
    elements,
    additionalData,
    paymentIntentStatus,
    onPaymentError,
  ]);

  // Formu sıfırla
  const resetForm = useCallback(() => {
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
    setError(null);
    setPaymentIntentStatus(PAYMENT_INTENT_STATUS.FAILED); // Sıfırlama sırasında durumu FAILED olarak ayarla
    setIsExistingIntent(false);
    setCardComplete(false);
    if (onPaymentError) onPaymentError(new Error("Form sıfırlandı"));
  }, [onPaymentError, elements]);

  // Kart değişimini izle
  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message || "Kart bilgilerinde hata var");
    } else {
      setError(null);
    }
  };

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

      // Önce kart bilgilerini doğrula
      const { error: cardError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (cardError) {
        console.log("Kart doğrulama hatası:", cardError);
        // Kart doğrulama hatası varsa cancel sayfasına yönlendir
        router.push("/checkout/cancel");
        return;
      }

      // Stripe ile ödemeyi tamamla
      const paymentMethodOptions = {
        card: cardElement,
        billing_details: {
          // Test kartı için gerekli olan billing detayları
          name: "Test Kullanıcı",
          address: {
            line1: "Test Adres",
            postal_code: "34000", // Test kartları için genelde 5 haneli bir posta kodu gerekir
            city: "İstanbul",
            country: "TR",
          },
        },
      };

      // Kartı kaydetme seçeneği varsa ayrı bir işlem yap
      if (saveCard) {
        // Önce ödeme yöntemi oluştur
        const { error: paymentMethodError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
            billing_details: {
              name: "Test Kullanıcı",
              address: {
                postal_code: "34000", // Test kartları için genelde 5 haneli bir posta kodu gerekir
              },
            },
          });

        if (paymentMethodError) {
          // Hatayı Türkçeleştirerek fırlat
          let turkceHataMesaji =
            "Kart işlenirken bir hata oluştu. Lütfen tekrar deneyin.";
          console.log("Ödeme yöntemi hatası:", paymentMethodError);
          // Ödeme yöntemi hatası durumunda cancel sayfasına yönlendir
          router.push("/checkout/cancel");
          return;
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
        } else if (error.type === "invalid_request_error") {
          // Genellikle clientSecret veya diğer API parametrelerinin geçersiz olduğu durumlarda
          turkceHataMesaji =
            "Ödeme isteği geçersiz. Lütfen sayfayı yenileyip tekrar deneyin.";
        }

        console.log("Ödeme hatası detayları:", {
          code: error.code,
          type: error.type,
          decline_code: error.decline_code,
          message: error.message,
        });

        // Hatanın türüne bağlı olarak ya formu sıfırla ya da cancel sayfasına yönlendir
        if (error.type === "card_error" || error.code === "card_declined") {
          // Kartla ilgili hatalar için cancel sayfasına yönlendir
          router.push("/checkout/cancel");
        } else {
          // Diğer hatalar için formu sıfırla
          setError(turkceHataMesaji);
          resetForm();
        }
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Ödeme başarıyla tamamlandı!");

        // Başarılı ödeme sonrası success sayfasına yönlendir
        if (paymentIntent.id) {
          router.push(
            `/checkout/success?session_id=${paymentIntent.id}&order_id=${
              paymentIntentId || paymentIntent.id
            }`
          );
        } else {
          router.push("/checkout/success");
        }

        if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
      } else {
        // Başarısız ödeme durumunda cancel sayfasına yönlendir
        router.push("/checkout/cancel");
      }
    } catch (error: any) {
      // Hata detaylarını kontrol et ve güvenli bir şekilde logla
      const errorMessage =
        error.message || "Ödeme işlemi sırasında bir hata oluştu!";
      console.log("İşlenen hata:", errorMessage);

      // Genel hata durumunda cancel sayfasına yönlendir
      router.push("/checkout/cancel");

      if (onPaymentError) onPaymentError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Formu yeniden denemek için sıfırlama butonu
  const handleRetry = () => {
    resetForm();
    toast("Lütfen başka bir kart ile deneyiniz.");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Fade in={true} timeout={800}>
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CreditCardOutlined
              sx={{
                color: theme.palette.primary.main,
                fontSize: 24,
              }}
            />
            <Typography variant="h6" fontWeight={600}>
              Kart Bilgileri
            </Typography>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: error
                ? "error.main"
                : alpha(theme.palette.primary.main, 0.2),
              borderRadius: "12px",
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              boxShadow: error
                ? `0 0 0 1px ${theme.palette.error.main}`
                : cardComplete
                ? `0 0 0 1px ${theme.palette.success.main}`
                : "none",
              transition: "all 0.2s ease",
              "::focus-within": {
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
          >
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </Paper>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              mt: 2,
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 0.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.light, 0.1),
              }}
            >
              <InfoOutlined
                sx={{ fontSize: 14, mr: 0.5, color: theme.palette.info.main }}
              />
              Test kartı: 4242 4242 4242 4242 | Tarih: 12/25 | CVC: 123
            </Typography>

            {cardComplete && (
              <Chip
                icon={<CheckCircleOutline />}
                label="Kart bilgileri geçerli"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Card>
      </Fade>

      <Fade in={true} timeout={1000}>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                color="primary"
                sx={{
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2">
                Kartımı gelecekteki ödemeler için kaydet
              </Typography>
            }
          />

          {isExistingIntent && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.light, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoOutlined color="info" />
              <Typography variant="body2">
                Daha önce başlatılmış bir ödeme işlemi kullanılıyor.
              </Typography>
            </Box>
          )}

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={handleRetry}
                sx={{
                  mt: 1,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                Başka Kart Dene
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIosNew />}
              onClick={() => router.back()}
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.2,
              }}
            >
              Geri Dön
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!stripe || loading || !clientSecret || !cardComplete}
              startIcon={
                loading ? <CircularProgress size={20} /> : <LockOutlined />
              }
              sx={{
                minWidth: 200,
                textTransform: "none",
                borderRadius: "10px",
                background: theme.palette.success.main,
                boxShadow: `0 4px 14px ${alpha(
                  theme.palette.success.main,
                  0.4
                )}`,
                "&:hover": {
                  background: theme.palette.success.dark,
                },
                py: 1.2,
              }}
            >
              {loading ? "İşleniyor..." : buttonText}
            </Button>
          </Box>

          <Box
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <SecurityOutlined color="success" />
            <Typography variant="body2" color="text.secondary">
              Ödemeniz 256-bit SSL ile korunmaktadır. Bu test ortamında gerçek
              ödeme yapılmamaktadır.
            </Typography>
          </Box>
        </Box>
      </Fade>
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
  additionalData,
}: StripePaymentFormProps) => {
  return (
    <Container maxWidth="sm">
      <Elements stripe={stripePromise}>
        <PaymentForm
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          buttonText={buttonText}
          additionalData={additionalData}
        />
      </Elements>
    </Container>
  );
};

export default StripePaymentForm;
