"use client";

import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useState } from "react";

type FormData = {
  email: string;
  password: string;
};

const LoginClient = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
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
              {...register("email", { required: "E-posta zorunludur" })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="E-posta adresinizi girin"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Şifre</label>
            <input
              type="password"
              {...register("password", { required: "Şifre zorunludur" })}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Şifrenizi girin"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500"
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
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
        >
          <FcGoogle className="text-2xl mr-2" /> Google ile Giriş Yap
        </button>

        <p className="text-center text-gray-600 mt-4">
          Üye olmadınız mı?
          <a
            onClick={() => router.push("/register")}
            className="text-indigo-600 hover:underline ml-1 cursor-pointer"
          >
            Üye Ol
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginClient;
