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

// Adres tipi
interface SavedAddress {
  id: string;
  title: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  postcode: string;
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
  cartItems: any[],
  personalInfo: PersonalInfo,
  addressInfo: AddressInfo
) => {
  try {
    // Teslimat adresi formatı
    const shippingAddress = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address: addressInfo.street,
      city: addressInfo.city,
      postcode: addressInfo.postalCode,
      country: addressInfo.country,
    };

    const response = await axios.post("/api/stripe", {
      amount,
      currency: "try",
      description: "Ürün satın alımı",
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
      shippingAddress,
      metadata: {
        itemCount: cartItems.length.toString(),
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

  // Kayıtlı adresler
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);

  // Ödeme state'leri
  const [amount, setAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // API isteğinin yapılıp yapılmadığını takip eden ref
  const hasInitialized = useRef(false);

  // Kullanıcının kayıtlı adreslerini yükle
  const loadSavedAddresses = async () => {
    if (!session?.user) return;

    setLoadingSavedAddresses(true);
    try {
      const response = await axios.get("/api/profile");
      if (response.data.success && response.data.data.addresses) {
        setSavedAddresses(response.data.data.addresses);

        // Varsayılan adresi seç (varsa)
        const defaultAddress = response.data.data.addresses.find(
          (addr: SavedAddress) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);

          // Kişisel bilgileri doldur
          setPersonalInfo({
            firstName: defaultAddress.firstName,
            lastName: defaultAddress.lastName,
            email: session.user.email || "",
            phone: defaultAddress.phone,
          });

          // Adres bilgilerini doldur
          setAddressInfo({
            street: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.district || "",
            postalCode: defaultAddress.postcode,
            country: defaultAddress.country,
          });
        }
      }
    } catch (error) {
      console.error("Kayıtlı adresler yüklenirken hata oluştu:", error);
      toast.error("Adresler yüklenirken bir sorun oluştu.");
    } finally {
      setLoadingSavedAddresses(false);
    }
  };

  // Form otomatik doldurma işlemi
  useEffect(() => {
    if (session?.user) {
      // Kullanıcı adını parçalara ayır
      const nameParts = session.user.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Kişisel bilgileri doldur (kayıtlı adres seçilmediyse)
      if (!selectedAddressId) {
        setPersonalInfo({
          firstName,
          lastName,
          email: session.user.email || "",
          phone: session.user.phone || "",
        });
      }

      // Adres bilgilerini doldur (eğer eskiden kayıtlı adres varsa ve yeni kayıtlı adres seçilmediyse)
      if (session.user.address && !selectedAddressId) {
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

      // Kayıtlı adresleri yükle
      loadSavedAddresses();
    }
  }, [session]);

  // Kayıtlı adres seçildiğinde form alanlarını doldur
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    const selectedAddress = savedAddresses.find(
      (addr) => addr.id === addressId
    );
    if (!selectedAddress) return;

    // Kişisel bilgileri doldur
    setPersonalInfo({
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      email: session?.user?.email || "",
      phone: selectedAddress.phone,
    });

    // Adres bilgilerini doldur
    setAddressInfo({
      street: selectedAddress.address,
      city: selectedAddress.city,
      state: selectedAddress.district || "",
      postalCode: selectedAddress.postcode,
      country: selectedAddress.country,
    });
  };

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
          errors.phone = "Telefon numarası tam 10 haneli olmalıdır";
        } else if (!cleanPhone.startsWith("5")) {
          errors.phone =
            "Geçerli bir Türkiye GSM numarası girmelisiniz (5XX...)";
        }
      }
    } else if (step === 2) {
      if (!addressInfo.street.trim()) {
        errors.street = "Adres bilgisini girmelisiniz";
      } else if (addressInfo.street.trim().length < 10) {
        errors.street = "Adres en az 10 karakter olmalıdır";
      }

      if (!addressInfo.city) {
        errors.city = "Şehir seçmelisiniz";
      }

      if (!addressInfo.state.trim()) {
        errors.state = "İlçe/Semt bilgisini girmelisiniz";
      } else if (addressInfo.state.trim().length < 3) {
        errors.state = "İlçe adı en az 3 karakter olmalıdır";
      }

      // Posta kodu validasyonu - tam 5 haneli format
      if (!addressInfo.postalCode.trim()) {
        errors.postalCode = "Posta kodunu girmelisiniz";
      } else {
        const cleanPostalCode = addressInfo.postalCode.replace(/\D/g, "");
        if (cleanPostalCode.length !== 5) {
          errors.postalCode = "Posta kodu tam 5 haneli olmalıdır";
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

    // Stripe ile ödeme niyeti oluştur
    const { secret, error } = await getClientSecret(
      currentAmount,
      items,
      personalInfo,
      addressInfo
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

  const handlePaymentSuccess = async (id: string) => {
    setPaymentId(id);
    setPaymentSuccess(true);

    try {
      // Sipariş oluşturma endpoint'ini çağır
      console.log("Sipariş oluşturma isteği yapılıyor...");
      const response = await axios.post("/api/orders/create", {
        paymentIntentId: id,
        items: items,
        totalAmount: getTotalPrice(),
        shippingAddress: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: addressInfo.street,
          city: addressInfo.city,
          postcode: addressInfo.postalCode,
          country: addressInfo.country,
        },
      });

      console.log("Sipariş oluşturma yanıtı:", response.data);
      if (response.data.success) {
        toast.success("Sipariş başarıyla oluşturuldu!");
        router.push("/profile/orders");
      }
    } catch (error) {
      console.error("Sipariş oluşturma hatası:", error);
      // Webhook üzerinden oluşturulacağı için hata göstermeye gerek yok
    }

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
      // Sadece rakamları al ve 10 karakterle sınırla
      const input = e.target.value.replace(/\D/g, "").substring(0, 10);
      const formatted = formatPhoneNumber(input);

      // Local state'i güncelle
      setLocalValue(formatted);
    };

    const handleBlur = () => {
      // Sadece rakamları al
      const input = localValue.replace(/\D/g, "");

      // 10 karakter kontrolü
      if (input.length > 0 && input.length !== 10) {
        // Eksik veya fazla karakter durumunu bildirmek için error state'i ayarlanabilir
        console.log("Telefon numarası 10 haneli olmalıdır.");
      }

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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </span>
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
      // Sadece rakamları kabul et ve 5 karakterle sınırla
      const input = e.target.value.replace(/\D/g, "").substring(0, 5);

      // Local state'i güncelle
      setLocalValue(input);
    };

    const handleBlur = () => {
      // Posta kodu doğrulama - tam 5 haneli olmalı
      if (localValue.length > 0 && localValue.length !== 5) {
        console.log("Posta kodu tam 5 haneli olmalıdır.");
      }

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
          Posta Kodu <span className="text-xs text-gray-500">(5 haneli)</span>
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            id="postalCode"
            name="postalCode"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="34000"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            maxLength={5}
            inputMode="numeric"
          />
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
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  };

  // Ödeme sayfası içeriği
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
      {items.length === 0 && !paymentSuccess ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Ödeme yapmak için sepetinize ürün eklemelisiniz.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center"
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
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Alışverişe Devam Et
          </button>
        </div>
      ) : (
        <>
          {/* Sepete Dön Butonu */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => router.push("/cart")}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
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
              Sepete Dön
            </button>
            {/* Güvenli Ödeme Göstergesi */}
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Güvenli Ödeme
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              {/* Header */}
              <h1 className="text-3xl font-bold mb-6 text-gray-800">Ödeme</h1>

              {/* Adım göstergesi */}
              <div className="w-full mb-8">
                <div className="flex items-center justify-between relative">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep > index
                            ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md"
                            : currentStep === index + 1
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                            : "bg-white text-gray-400 border border-gray-200"
                        } transition-colors duration-300`}
                      >
                        {currentStep > index ? (
                          <svg
                            className="w-5 h-5"
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
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          currentStep === index + 1
                            ? "text-blue-600"
                            : currentStep > index
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {index === 0
                          ? "Kişisel Bilgiler"
                          : index === 1
                          ? "Adres"
                          : "Ödeme"}
                      </span>
                    </div>
                  ))}
                  {/* Bağlantı çizgileri */}
                  <div className="absolute top-5 left-0 h-0.5 bg-gray-200 w-full -z-0">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                      style={{
                        width: `${
                          ((currentStep - 1) / (totalSteps - 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Form adımları */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {/* Form adım 1: Kişisel Bilgiler */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 1 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                          <svg
                            className="w-6 h-6 mr-3 text-blue-500"
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
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Ad"
                            name="firstName"
                            value={personalInfo.firstName}
                            onChange={handleUpdateField(
                              "firstName",
                              "personal"
                            )}
                            error={formErrors.firstName}
                          />
                          <FormInput
                            label="Soyad"
                            name="lastName"
                            value={personalInfo.lastName}
                            onChange={handleUpdateField("lastName", "personal")}
                            error={formErrors.lastName}
                          />
                          <FormInput
                            label="E-posta"
                            name="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={handleUpdateField("email", "personal")}
                            error={formErrors.email}
                          />
                          <PhoneInput
                            value={personalInfo.phone}
                            onChange={handleUpdateField("phone", "personal")}
                            error={formErrors.phone}
                          />
                        </div>
                        <div className="mt-10 flex justify-end">
                          <button
                            onClick={() => handleStepChange("next")}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 px-7 rounded-lg hover:shadow-lg transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center text-lg"
                          >
                            Devam Et
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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Form adım 2: Adres Bilgileri */}
                    {currentStep === 2 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                          <svg
                            className="w-6 h-6 mr-3 text-blue-500"
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
                        </h2>

                        {/* Kayıtlı adresler */}
                        {savedAddresses.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 100-4h14a2 2 0 100 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                              Kayıtlı Adresleriniz
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {savedAddresses.map((address) => (
                                <div
                                  key={address.id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedAddressId === address.id
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  onClick={() =>
                                    handleAddressSelect(address.id)
                                  }
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">
                                      {address.title}
                                    </div>
                                    {address.isDefault && (
                                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        Varsayılan
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <div>
                                      {address.firstName} {address.lastName}
                                    </div>
                                    <div>{address.phone}</div>
                                    <div>{address.address}</div>
                                    <div>
                                      {address.district &&
                                        `${address.district}, `}
                                      {address.city} {address.postcode}
                                    </div>
                                    <div>{address.country}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex items-center">
                              <input
                                type="checkbox"
                                id="useNewAddress"
                                className="mr-2"
                                checked={!selectedAddressId}
                                onChange={() => setSelectedAddressId(null)}
                              />
                              <label
                                htmlFor="useNewAddress"
                                className="text-sm"
                              >
                                Yeni adres kullanmak istiyorum
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Yeni adres formu */}
                        {!selectedAddressId && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <FormInput
                                label="Adres"
                                name="street"
                                value={addressInfo.street}
                                onChange={handleUpdateField(
                                  "street",
                                  "address"
                                )}
                                error={formErrors.street}
                              />
                            </div>
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
                                    handleUpdateField(
                                      "city",
                                      "address"
                                    )({
                                      target: {
                                        name: "city",
                                        value: e.target.value,
                                      },
                                    } as React.ChangeEvent<HTMLInputElement>)
                                  }
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
                                    formErrors.city
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <option value="">Şehir Seçiniz</option>
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
                              label="İlçe"
                              name="state"
                              value={addressInfo.state}
                              onChange={handleUpdateField("state", "address")}
                              error={formErrors.state}
                            />
                            <PostalCodeInput
                              value={addressInfo.postalCode}
                              onChange={handleUpdateField(
                                "postalCode",
                                "address"
                              )}
                              error={formErrors.postalCode}
                            />
                            <FormInput
                              label="Ülke"
                              name="country"
                              value={addressInfo.country}
                              onChange={handleUpdateField("country", "address")}
                              error={formErrors.country}
                            />
                          </div>
                        )}

                        <div className="mt-8 flex justify-between">
                          <button
                            onClick={() => handleStepChange("prev")}
                            className="bg-white border border-blue-500 text-blue-600 py-3.5 px-7 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center"
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
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            Geri
                          </button>
                          <button
                            onClick={() => handleStepChange("next")}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3.5 px-7 rounded-lg hover:shadow-lg transition-all duration-300 shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center text-lg"
                          >
                            Ödemeye Geç
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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
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
                            <div className="mt-8 flex justify-between">
                              <button
                                onClick={() => handleStepChange("prev")}
                                className="border border-blue-500 text-blue-600 py-3.5 px-7 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center"
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
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                                Geri
                              </button>
                              <button
                                onClick={handleRetry}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-7 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-auto shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Tekrar Dene
                              </button>
                            </div>
                          </div>
                        ) : clientSecret ? (
                          <div>
                            <StripeProvider options={{ clientSecret }}>
                              <CheckoutForm
                                amount={amount}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                              />
                            </StripeProvider>
                            <div className="mt-8 flex justify-start">
                              <button
                                onClick={() => handleStepChange("prev")}
                                className="border border-blue-500 text-blue-600 py-3.5 px-7 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center"
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
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                                Adrese Dön
                              </button>
                            </div>
                          </div>
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
                            <div className="mt-8 flex justify-between">
                              <button
                                onClick={() => handleStepChange("prev")}
                                className="border border-blue-500 text-blue-600 py-3.5 px-7 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center"
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
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                                Geri
                              </button>
                              <button
                                onClick={handleRetry}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-7 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-auto shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Tekrar Dene
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sağ taraf - Sipariş özeti */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h2 className="text-xl font-semibold mb-5 pb-4 border-b border-gray-100 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
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
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-3 border-b border-gray-100"
                    >
                      {item.imageUrl && (
                        <img
                          src={`/SupplementImage/${item.imageUrl}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>{item.quantity} adet</span>
                          <span className="font-semibold text-blue-600">
                            {((item.price || 0) * item.quantity).toLocaleString(
                              "tr-TR",
                              {
                                style: "currency",
                                currency: "TRY",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-4 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>
                      {getTotalPrice().toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                </div>

                <div className="flex justify-between font-semibold text-lg mt-5 mb-6">
                  <span>Toplam</span>
                  <span className="text-blue-700 bg-blue-50 px-4 py-1 rounded-full">
                    {getTotalPrice().toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-sm text-blue-700">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium mb-1">Bilgilendirme</p>
                      <p>
                        Siparişiniz onaylandıktan sonra 3-5 iş günü içerisinde
                        kargoya verilecektir.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex justify-center ${
                    currentStep === 3 ? "hidden" : ""
                  }`}
                >
                  <button
                    onClick={() => handleStepChange("next")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-7 rounded-lg hover:shadow-lg transition-all duration-300 w-full shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  >
                    {currentStep === 1 ? "Devam Et" : "Ödemeye Geç"}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
