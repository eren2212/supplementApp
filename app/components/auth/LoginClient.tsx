"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Form doğrulama şeması
const loginSchema = yup.object({
  email: yup
    .string()
    .required("E-posta adresi zorunludur")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: yup
    .string()
    .required("Şifre zorunludur")
    .min(6, "Şifre en az 6 karakter olmalıdır"),
});

type FormData = yup.InferType<typeof loginSchema>;

const LoginClient = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    const { email, password } = data;

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    } else {
      toast.success("Başarıyla giriş yaptınız!");
      setTimeout(() => {
        router.push("/");
      }, 1000); // 2000 milisaniye = 2 saniye
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/LoginRegister-2.jpg')" }}
      ></div>

      <div className="relative bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-96 md:w-80">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Giriş Yap
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="mb-4">
            <label className="block text-gray-700">Şifre</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md`}
              placeholder="Şifrenizi girin"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-500">veya</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-300"
        >
          <FcGoogle className="text-2xl mr-2" /> Google ile Giriş Yap
        </button>

        <p className="text-center text-gray-600 mt-4">
          Üye olmadınız mı?
          <a
            onClick={() => router.push("/register")}
            className="text-indigo-600 hover:underline ml-1 cursor-pointer font-medium"
          >
            Üye Ol
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginClient;
