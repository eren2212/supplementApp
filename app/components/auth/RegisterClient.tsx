"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Form doğrulama şeması
const registerSchema = yup.object({
  firstName: yup
    .string()
    .required("Ad alanı zorunludur")
    .min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: yup
    .string()
    .required("Soyad alanı zorunludur")
    .min(2, "Soyad en az 2 karakter olmalıdır"),
  email: yup
    .string()
    .required("E-posta alanı zorunludur")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: yup
    .string()
    .required("Şifre alanı zorunludur")
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
    ),
});

type FormValues = yup.InferType<typeof registerSchema>;

const RegisterClient = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Backend'in beklediği 'name' formatına uygun hale getirdik
      const requestData = {
        name: `${data.firstName} ${data.lastName}`.trim(), // name birleşimi
        email: data.email,
        password: data.password,
      };

      await axios.post("/api/auth/register", requestData);
      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      router.refresh();
      router.push("/");
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast.error("Bu e-posta zaten kayıtlı!");
      } else {
        toast.error(error.response?.data?.message || "Kayıt başarısız!");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/LoginRegister-2.jpg')" }}
      ></div>

      <div className="relative bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-96 md:w-80">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Üye Ol
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Ad */}
          <div className="mb-4">
            <label className="block text-gray-700">Ad</label>
            <input
              type="text"
              {...register("firstName")}
              className={`w-full p-3 border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-md`}
              placeholder="Adınızı girin"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Soyad */}
          <div className="mb-4">
            <label className="block text-gray-700">Soyad</label>
            <input
              type="text"
              {...register("lastName")}
              className={`w-full p-3 border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-md`}
              placeholder="Soyadınızı girin"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* E-posta */}
          <div className="mb-4">
            <label className="block text-gray-700">E-posta</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full p-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md`}
              placeholder="E-posta adresinizi girin"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Şifre */}
          <div className="mb-4">
            <label className="block text-gray-700">Şifre</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md`}
              placeholder="Şifrenizi oluşturun"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam
              içermelidir.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500 transition-colors duration-300"
          >
            {isSubmitting ? "Kayıt Olunuyor..." : "Kayıt Ol"}
          </button>
        </form>

        {/* Google ile kayıt ol */}
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Giriş Yap Linki */}
        <p className="text-center text-gray-600 mt-4">
          Zaten üye misiniz?
          <a
            onClick={() => router.push("/login")}
            className="text-indigo-600 hover:underline ml-1 cursor-pointer font-medium"
          >
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterClient;
