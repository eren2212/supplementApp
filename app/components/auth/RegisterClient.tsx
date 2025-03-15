"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const RegisterClient = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

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
              {...register("firstName", { required: "Ad alanı zorunludur." })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Adınızı girin"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          {/* Soyad */}
          <div className="mb-4">
            <label className="block text-gray-700">Soyad</label>
            <input
              type="text"
              {...register("lastName", { required: "Soyad alanı zorunludur." })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Soyadınızı girin"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          {/* E-posta */}
          <div className="mb-4">
            <label className="block text-gray-700">E-posta</label>
            <input
              type="email"
              {...register("email", {
                required: "E-posta alanı zorunludur.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Geçerli bir e-posta adresi girin.",
                },
              })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="E-posta adresinizi girin"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Şifre */}
          <div className="mb-4">
            <label className="block text-gray-700">Şifre</label>
            <input
              type="password"
              {...register("password", {
                required: "Şifre alanı zorunludur.",
                minLength: {
                  value: 6,
                  message: "Şifre en az 6 karakter olmalıdır.",
                },
              })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Şifrenizi oluşturun"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500"
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
            className="text-indigo-600 hover:underline ml-1 cursor-pointer"
          >
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterClient;
