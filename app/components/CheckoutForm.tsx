"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({
  amount,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/odeme-basarili`,
        },
      });

      if (error) {
        setMessage(error.message || "Ödeme sırasında bir hata oluştu.");
        if (onError)
          onError(error.message || "Ödeme sırasında bir hata oluştu.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage("Ödeme başarıyla tamamlandı!");
        if (onSuccess) onSuccess(paymentIntent.id);
      } else {
        setMessage("Ödeme beklenmeyen bir durumda sonlandı.");
      }
    } catch (error: any) {
      setMessage("Bir hata oluştu: " + error.message);
      if (onError) onError("Bir hata oluştu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
          <div className="p-6 bg-gradient-to-br from-white to-blue-50">
            {/* Kart bilgisi elementi */}
            <div className="mb-4">
              <PaymentElement
                options={{
                  layout: {
                    type: "tabs",
                    defaultCollapsed: false,
                  },
                  fields: {
                    billingDetails: {
                      name: "auto",
                      email: "auto",
                      phone: "auto",
                      address: {
                        country: "auto",
                        postalCode: "auto",
                        line1: "auto",
                        line2: "auto",
                        city: "auto",
                        state: "auto",
                      },
                    },
                  },
                }}
                className="py-3"
              />
            </div>
          </div>
        </div>

        <button
          disabled={isLoading || !stripe || !elements}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              İşleniyor...
            </div>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {amount.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}{" "}
              Öde
            </span>
          )}
        </button>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm text-center mt-4 shadow-md ${
              message.includes("başarıyla")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex items-center justify-center mt-6 text-sm text-gray-500 space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-100 shadow-sm">
          <svg
            className="w-5 h-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 8H12.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Ödeme bilgileriniz güvenli bir şekilde korunmaktadır.</span>
        </div>
      </form>
    </div>
  );
}
