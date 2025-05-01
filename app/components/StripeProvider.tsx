"use client";

import { ReactNode } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Stripe public key ile bir kez stripe instance oluştur
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeProviderProps {
  children: ReactNode;
  options: {
    clientSecret: string;
    appearance?: any;
  };
}

// Varsayılan görünüm ayarları
const defaultAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2563eb", // blue-600
    colorBackground: "#ffffff",
    colorText: "#1f2937", // gray-800
    colorDanger: "#ef4444", // red-500
    fontFamily: "system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
};

export default function StripeProvider({
  children,
  options,
}: StripeProviderProps) {
  // options içine varsayılan appearance'ı ekle
  const elementsOptions = {
    ...options,
    appearance: options.appearance || defaultAppearance,
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}
