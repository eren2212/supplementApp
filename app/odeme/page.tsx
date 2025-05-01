"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import StripeProvider from "@/app/components/StripeProvider";
import CheckoutForm from "@/app/components/CheckoutForm";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { turkishCities } from "@/app/data/cities";

// Form tipleri
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddressInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Varsayılan form değerleri
const defaultPersonalInfo: PersonalInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const defaultAddressInfo: AddressInfo = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Türkiye",
};

// Ödeme isteği oluşturma fonksiyonu
const getClientSecret = async (
  amount: number,
  items: any[],
  metadata: any = {}
) => {
  try {
    const response = await axios.post("/api/stripe", {
      amount,
      description: "Ürün satın alımı",
      metadata: {
        itemCount: items.length.toString(),
        items: items.map((item) => item.id).join(","),
        ...metadata,
      },
    });
    return { secret: response.data.clientSecret, error: null };
  } catch (error: any) {
    console.error("Ödeme başlatılırken hata:", error);
    return {
      secret: null,
      error:
        error.response?.data?.error || "Ödeme başlatılırken bir hata oluştu",
    };
  }
};

export default function OdemePage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { data: session, status } = useSession();

  // Step takibi
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state'leri
  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo>(defaultPersonalInfo);
  const [addressInfo, setAddressInfo] =
    useState<AddressInfo>(defaultAddressInfo);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Ödeme state'leri
  const [amount, setAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // API isteğinin yapılıp yapılmadığını takip eden ref
  const hasInitialized = useRef(false);

  // Form otomatik doldurma işlemi
  useEffect(() => {
    if (session?.user) {
      // Kullanıcı adını parçalara ayır
      const nameParts = session.user.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Kişisel bilgileri doldur
      setPersonalInfo({
        firstName,
        lastName,
        email: session.user.email || "",
        phone: session.user.phone || "",
      });

      // Adres bilgilerini doldur
      if (session.user.address) {
        try {
          // Adres string ise parçalara ayır
          const addressParts = session.user.address
            .split(",")
            .map((part) => part.trim());
          setAddressInfo({
            street: addressParts[0] || "",
            city: addressParts[1] || "",
            state: addressParts[2] || "",
            postalCode: addressParts[3] || "",
            country: addressParts[4] || "Türkiye",
          });
        } catch (error) {
          console.error("Adres ayrıştırma hatası:", error);
        }
      }
    }
  }, [session]);

  // Form input'ları için reusable component
  const FormInput = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    error,
    placeholder = "",
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    error?: string;
    placeholder?: string;
  }) => {
    // Bir referans oluşturalım
    const inputRef = useRef<HTMLInputElement>(null);

    // Component mount olduğunda değeri ayarlayalım
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }, [value]);

    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type={type}
            id={name}
            name={name}
            defaultValue={value}
            onBlur={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {name === "email" && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
          )}
          {name === "firstName" || name === "lastName" ? (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
          ) : null}
          {name === "street" ? (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </span>
          ) : null}
          {name === "state" ? (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
          ) : null}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  };

  // Form validasyon fonksiyonu
  const validateForm = (step: number): boolean => {
    // Önce mevcut input değerlerini alıp state'i güncelle
    const formElements = document.querySelectorAll("input, select");

    formElements.forEach((element) => {
      const name = element.getAttribute("name");
      const value = (element as HTMLInputElement).value;

      if (name) {
        if (
          name === "firstName" ||
          name === "lastName" ||
          name === "email" ||
          name === "phone"
        ) {
          setPersonalInfo((prev) => ({
            ...prev,
            [name]: value,
          }));
        } else if (
          name === "street" ||
          name === "city" ||
          name === "state" ||
          name === "postalCode" ||
          name === "country"
        ) {
          setAddressInfo((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      }
    });

    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!personalInfo.firstName.trim()) {
        errors.firstName = "Adınızı girmelisiniz";
      }
      if (!personalInfo.lastName.trim()) {
        errors.lastName = "Soyadınızı girmelisiniz";
      }
      if (!personalInfo.email.trim()) {
        errors.email = "E-posta adresinizi girmelisiniz";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(personalInfo.email)
      ) {
        errors.email = "Geçerli bir e-posta adresi girmelisiniz";
      }

      // Telefon numarası validasyonu - 10 haneli Türkiye formatı (5XX XXX XX XX)
      if (!personalInfo.phone.trim()) {
        errors.phone = "Telefon numaranızı girmelisiniz";
      } else {
        const cleanPhone = personalInfo.phone.replace(/\D/g, "");
        if (cleanPhone.length !== 10) {
          errors.phone = "Telefon numarası 10 haneli olmalıdır";
        } else if (!cleanPhone.startsWith("5")) {
          errors.phone =
            "Geçerli bir Türkiye GSM numarası girmelisiniz (5XX...)";
        }
      }
    } else if (step === 2) {
      if (!addressInfo.street.trim()) {
        errors.street = "Adres bilgisini girmelisiniz";
      }
      if (!addressInfo.city) {
        errors.city = "Şehir seçmelisiniz";
      }
      if (!addressInfo.state.trim()) {
        errors.state = "İlçe/Semt bilgisini girmelisiniz";
      }

      // Posta kodu validasyonu - 5 haneli format
      if (!addressInfo.postalCode.trim()) {
        errors.postalCode = "Posta kodunu girmelisiniz";
      } else {
        const cleanPostalCode = addressInfo.postalCode.replace(/\D/g, "");
        if (cleanPostalCode.length !== 5) {
          errors.postalCode = "Posta kodu 5 haneli olmalıdır";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // İleri veya geri gitme fonksiyonu
  const handleStepChange = (direction: "next" | "prev") => {
    if (direction === "next") {
      if (!validateForm(currentStep)) return;

      // Son adımda ödeme işlemi başlatılacak
      if (currentStep === 2) {
        initializePayment();
      }

      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // İstek göndermek ve state'i güncellemek için fonksiyon
  const initializePayment = async () => {
    if (hasInitialized.current && clientSecret) return;

    setLoading(true);
    hasInitialized.current = true;

    const currentAmount = getTotalPrice();
    setAmount(currentAmount);

    // Metadata olarak kullanıcı bilgilerini de gönder
    const metadata = {
      customerName: `${personalInfo.firstName} ${personalInfo.lastName}`,
      customerEmail: personalInfo.email,
      customerPhone: personalInfo.phone,
      shippingAddress: `${addressInfo.street}, ${addressInfo.city}, ${addressInfo.postalCode}, ${addressInfo.country}`,
    };

    // Stripe ile ödeme niyeti oluştur
    const { secret, error } = await getClientSecret(
      currentAmount,
      items,
      metadata
    );

    if (secret) {
      sessionStorage.setItem("stripe_client_secret", secret);
      sessionStorage.setItem("stripe_amount", currentAmount.toString());
      setClientSecret(secret);
    } else {
      setPaymentError(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Sepet boşsa sepet sayfasına yönlendir
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    setAmount(getTotalPrice());
    setLoading(false);

    // Component unmount olduğunda
    return () => {
      // Başarılı ödeme sonrasında session storage'ı temizle
      if (paymentSuccess) {
        sessionStorage.removeItem("stripe_client_secret");
        sessionStorage.removeItem("stripe_amount");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, router]);

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentSuccess(true);
    // Ödeme başarılı olduğunda sepeti temizle
    clearCart();
    // Session storage'ı temizle
    sessionStorage.removeItem("stripe_client_secret");
    sessionStorage.removeItem("stripe_amount");
    toast.success("Ödemeniz başarıyla alındı!");
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    toast.error("Ödeme işlemi sırasında bir hata oluştu");
  };

  const handleRetry = async () => {
    setPaymentError(null);
    setLoading(true);
    hasInitialized.current = false;
    sessionStorage.removeItem("stripe_client_secret");
    sessionStorage.removeItem("stripe_amount");
    await initializePayment();
  };

  const handleUpdateField =
    (field: string, section: "personal" | "address") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (section === "personal") {
        setPersonalInfo((prev) => ({
          ...prev,
          [field]: value,
        }));
      } else {
        setAddressInfo((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  // Format telefon numarası
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları tut
    const numbers = value.replace(/\D/g, "");

    // Türkiye GSM formatı: 5XX XXX XX XX
    let formatted = "";

    if (numbers.length > 0) {
      formatted += numbers.substring(0, Math.min(3, numbers.length));
    }
    if (numbers.length > 3) {
      formatted += " " + numbers.substring(3, Math.min(6, numbers.length));
    }
    if (numbers.length > 6) {
      formatted += " " + numbers.substring(6, Math.min(8, numbers.length));
    }
    if (numbers.length > 8) {
      formatted += " " + numbers.substring(8, Math.min(10, numbers.length));
    }

    return formatted;
  };

  // PhoneInput bileşeni
  const PhoneInput = ({
    value,
    onChange,
    error,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(formatPhoneNumber(value));

    // State güncellendiğinde input değerini güncelle
    useEffect(() => {
      setLocalValue(formatPhoneNumber(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Sadece rakamları al
      const input = e.target.value.replace(/\D/g, "");
      const formatted = formatPhoneNumber(input);

      // Local state'i güncelle
      setLocalValue(formatted);

      // Gerçek değişikliği yapmıyoruz, sadece hazırlıyoruz
    };

    const handleBlur = () => {
      // Sadece rakamları al
      const input = localValue.replace(/\D/g, "");

      // onChange'i çağır
      const syntheticEvent = {
        target: {
          name: "phone",
          value: input,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    };

    return (
      <div className="mb-4">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Telefon Numarası{" "}
          <span className="text-xs text-gray-500">(5XX XXX XX XX)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            +90
          </span>
          <input
            ref={inputRef}
            type="tel"
            id="phone"
            name="phone"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="5XX XXX XX XX"
            className={`w-full pl-14 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            maxLength={13} // "5XX XXX XX XX" formatı için
            inputMode="numeric"
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  };

  // PostalCodeInput bileşeni
  const PostalCodeInput = ({
    value,
    onChange,
    error,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    // State güncellendiğinde input değerini güncelle
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Sadece rakamları kabul et
      const input = e.target.value.replace(/\D/g, "").substring(0, 5);

      // Local state'i güncelle
      setLocalValue(input);
    };

    const handleBlur = () => {
      // onChange'i çağır
      const syntheticEvent = {
        target: {
          name: "postalCode",
          value: localValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    };

    return (
      <div className="mb-4">
        <label
          htmlFor="postalCode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Posta Kodu
        </label>
        <input
          ref={inputRef}
          type="text"
          id="postalCode"
          name="postalCode"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="12345"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            error ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          maxLength={5}
          inputMode="numeric"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  };

  // Yükleme durumu
  if (loading && currentStep === 3) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p>Ödeme hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // Başarılı ödeme ekranı
  if (paymentSuccess) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-green-600"
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

          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Siparişiniz Tamamlandı!
          </h2>

          <p className="text-gray-600 mb-6 text-lg">
            Ödemeniz başarıyla tamamlandı. Siparişiniz kısa süre içinde
            hazırlanacak.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left border border-gray-100">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Sipariş Detayları
            </h3>
            <p className="mb-3 text-gray-700 border-b pb-2">
              <span className="font-medium text-gray-900">Sipariş No:</span>{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                {paymentId}
              </span>
            </p>
            <p className="mb-3 text-gray-700 border-b pb-2">
              <span className="font-medium text-gray-900">Alıcı:</span>{" "}
              {personalInfo.firstName} {personalInfo.lastName}
            </p>
            <p className="mb-3 text-gray-700 border-b pb-2">
              <span className="font-medium text-gray-900">
                Teslimat Adresi:
              </span>{" "}
              {addressInfo.street}, {addressInfo.city}
            </p>
            <p className="mb-4 text-gray-700 text-lg font-medium">
              <span className="text-gray-900">Toplam Tutar:</span>{" "}
              <span className="text-blue-600">
                {amount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Ana Sayfaya Dön
            </button>
            <button
              onClick={() => router.push("/supplement")}
              className="bg-gray-100 text-gray-800 py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Alışverişe Devam Et
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Ödeme ilerleme göstergesi - modern tasarım */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          {/* İlerleme adımları göstergesi */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-10">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                      currentStep > index + 1
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : currentStep === index + 1
                        ? "bg-white border-2 border-blue-500 text-blue-800 shadow-md"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {currentStep > index + 1 ? (
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xl font-medium">{index + 1}</span>
                    )}
                  </div>

                  {index < totalSteps - 1 && (
                    <div className="w-24 mx-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          currentStep > index + 1
                            ? "bg-gradient-to-r from-blue-500 to-blue-400"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center text-center text-sm mb-6">
              <div
                className={`flex flex-col items-center transition-all duration-300 ${
                  currentStep >= 1
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                } w-1/3`}
              >
                <span className="text-base mb-2">Kişisel Bilgiler</span>
                <div
                  className={`h-1 w-20 rounded-full ${
                    currentStep >= 1 ? "bg-blue-500" : "bg-transparent"
                  }`}
                ></div>
              </div>
              <div
                className={`flex flex-col items-center transition-all duration-300 ${
                  currentStep >= 2
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                } w-1/3`}
              >
                <span className="text-base mb-2">Teslimat Adresi</span>
                <div
                  className={`h-1 w-20 rounded-full ${
                    currentStep >= 2 ? "bg-blue-500" : "bg-transparent"
                  }`}
                ></div>
              </div>
              <div
                className={`flex flex-col items-center transition-all duration-300 ${
                  currentStep >= 3
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                } w-1/3`}
              >
                <span className="text-base mb-2">Ödeme Bilgileri</span>
                <div
                  className={`h-1 w-20 rounded-full ${
                    currentStep >= 3 ? "bg-blue-500" : "bg-transparent"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana içerik - modern tasarım */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Üst başlık */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b relative">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              {currentStep === 1 && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-blue-700"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              {currentStep === 2 && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-blue-700"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              )}
              {currentStep === 3 && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-blue-700"
                >
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              {currentStep === 1 && (
                <>
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Kişisel Bilgiler
                </>
              )}
              {currentStep === 2 && (
                <>
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Teslimat Adresi
                </>
              )}
              {currentStep === 3 && (
                <>
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Ödeme Bilgileri
                </>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              {currentStep === 1 &&
                "Lütfen kişisel bilgilerinizi giriniz. Bu bilgiler fatura ve teslimat için kullanılacaktır."}
              {currentStep === 2 &&
                "Siparişinizin teslim edileceği adres bilgilerini giriniz."}
              {currentStep === 3 &&
                "Güvenli ödeme sayfasındasınız. Lütfen ödeme bilgilerinizi giriniz."}
            </p>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Form içeriği */}
                {/* Adım 1: Kişisel Bilgiler */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Ad"
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={handleUpdateField("firstName", "personal")}
                        error={formErrors.firstName}
                        placeholder="Adınızı giriniz"
                      />
                      <FormInput
                        label="Soyad"
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={handleUpdateField("lastName", "personal")}
                        error={formErrors.lastName}
                        placeholder="Soyadınızı giriniz"
                      />
                    </div>
                    <FormInput
                      label="E-posta"
                      name="email"
                      value={personalInfo.email}
                      onChange={handleUpdateField("email", "personal")}
                      type="email"
                      error={formErrors.email}
                      placeholder="E-posta adresinizi giriniz"
                    />
                    <PhoneInput
                      value={personalInfo.phone}
                      onChange={handleUpdateField("phone", "personal")}
                      error={formErrors.phone}
                    />
                  </div>
                )}

                {/* Adım 2: Adres Bilgileri */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <FormInput
                      label="Adres"
                      name="street"
                      value={addressInfo.street}
                      onChange={handleUpdateField("street", "address")}
                      error={formErrors.street}
                      placeholder="Adresinizi giriniz"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="mb-4">
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Şehir
                        </label>
                        <div className="relative">
                          <select
                            id="city"
                            name="city"
                            value={addressInfo.city}
                            onChange={(e) =>
                              setAddressInfo((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
                              formErrors.city
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Şehir seçiniz</option>
                            {turkishCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </div>
                        {formErrors.city && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.city}
                          </p>
                        )}
                      </div>
                      <FormInput
                        label="İlçe/Eyalet"
                        name="state"
                        value={addressInfo.state}
                        onChange={handleUpdateField("state", "address")}
                        error={formErrors.state}
                        placeholder="İlçe veya eyalet"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PostalCodeInput
                        value={addressInfo.postalCode}
                        onChange={handleUpdateField("postalCode", "address")}
                        error={formErrors.postalCode}
                      />
                      <div className="mb-4">
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Ülke
                        </label>
                        <div className="relative">
                          <select
                            id="country"
                            name="country"
                            value={addressInfo.country}
                            onChange={(e) =>
                              setAddressInfo((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                          >
                            <option value="Türkiye">Türkiye</option>
                            <option value="Almanya">Almanya</option>
                            <option value="İngiltere">İngiltere</option>
                            <option value="Fransa">Fransa</option>
                          </select>
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Adım 3: Ödeme */}
                {currentStep === 3 && (
                  <div>
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 p-8 rounded-xl mb-8 shadow-md border border-blue-100">
                      <h3 className="font-semibold text-xl mb-6 text-blue-800 flex items-center">
                        <svg
                          className="w-6 h-6 mr-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Sipariş Özeti
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center py-3 border-b border-blue-100">
                          <span className="flex items-center text-gray-700">
                            <svg
                              className="w-5 h-5 mr-3 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                            Ürün Sayısı:
                          </span>
                          <span className="font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                            {items.length} adet
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-blue-100">
                          <span className="flex items-center text-gray-700">
                            <svg
                              className="w-5 h-5 mr-3 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Alıcı:
                          </span>
                          <span className="font-medium text-blue-800">
                            {personalInfo.firstName} {personalInfo.lastName}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-blue-100">
                          <span className="flex items-center text-gray-700">
                            <svg
                              className="w-5 h-5 mr-3 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Teslimat Adresi:
                          </span>
                          <span className="text-right font-medium text-blue-800 max-w-xs">
                            {addressInfo.street}, {addressInfo.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between font-semibold mt-6 pt-4 border-t border-blue-200 text-lg">
                        <span className="flex items-center">
                          <svg
                            className="w-6 h-6 mr-3 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Toplam Tutar:
                        </span>
                        <span className="text-blue-700 bg-blue-100 px-4 py-1 rounded-full text-xl">
                          {amount.toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })}
                        </span>
                      </div>
                    </div>

                    {paymentError ? (
                      <div className="text-center">
                        <div className="text-red-600 mb-6 p-5 bg-red-50 rounded-xl border border-red-100 flex items-center">
                          <svg
                            className="w-6 h-6 mr-3 text-red-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{paymentError}</span>
                        </div>
                        <button
                          onClick={handleRetry}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-full shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Tekrar Dene
                          </span>
                        </button>
                      </div>
                    ) : clientSecret ? (
                      <StripeProvider options={{ clientSecret }}>
                        <CheckoutForm
                          amount={amount}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </StripeProvider>
                    ) : (
                      <div className="text-center">
                        <div className="mb-6 text-amber-700 p-5 bg-amber-50 rounded-xl border border-amber-100 flex items-center">
                          <svg
                            className="w-6 h-6 mr-3 text-amber-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>
                            Ödeme bilgileri yüklenirken bir hata oluştu.
                          </span>
                        </div>
                        <button
                          onClick={handleRetry}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-full shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Tekrar Dene
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Alt butonlar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t flex justify-between mt-6 rounded-b-xl">
            <button
              onClick={() =>
                currentStep > 1
                  ? handleStepChange("prev")
                  : router.push("/cart")
              }
              className="flex items-center px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {currentStep > 1 ? "Geri" : "Sepete Dön"}
            </button>

            {currentStep < totalSteps && (
              <button
                onClick={() => handleStepChange("next")}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {currentStep === totalSteps - 1 ? "Ödemeye Geç" : "Devam Et"}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
