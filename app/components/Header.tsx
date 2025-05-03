"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IoExitOutline } from "react-icons/io5";
import { CiShoppingBasket } from "react-icons/ci";
import { FiMenu, FiX } from "react-icons/fi";
import { RxAvatar } from "react-icons/rx";
import Badge from "@mui/material/Badge";
import toast from "react-hot-toast";
import Logo from "../../public/images/logo.png";
import { useCartStore } from "../store/cartStore";

const navigation = [
  { name: "Supplemenler", href: "/supplement" },
  { name: "Tavsiyeler", href: "/advice" },
  { name: "Blog", href: "/blog" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Başarıyla çıkış yaptınız!");
      router.push("/");
    } catch (error) {
      toast.error("Çıkış yaparken bir hata oluştu!");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-lg w-full  ">
      <nav className="flex items-center justify-between p-4 lg:px-8">
        {/* Sol taraf (Logo) */}
        <div className="flex flex-1">
          <Image
            src={Logo}
            alt="Logo"
            width={70}
            height={70}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Orta Menü - Masaüstü */}
        <div className="hidden lg:flex lg:gap-x-12 justify-center flex-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              onClick={() => router.push(item.href)}
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Sağ taraf (Sepet ve Kullanıcı) */}
        <div className="flex flex-1 justify-end items-center relative">
          {/* Sepet */}
          <button
            className="mr-3 cursor-pointer"
            onClick={() => router.push("/cart")}
          >
            {mounted && (
              <Badge badgeContent={totalItems} color={"primary"} max={9}>
                <CiShoppingBasket size={25} />
              </Badge>
            )}
          </button>

          {/* Kullanıcı */}
          {session && session.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10  cursor-pointer border-gray-300 flex items-center justify-center overflow-hidden"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-3xl"
                  />
                ) : (
                  <RxAvatar size={30} className="text-gray-500" />
                )}
              </button>

              {/* Dropdown Menü */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-md z-50">
                  <button
                    onClick={() => router.push("/profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                  >
                    Profilim
                  </button>
                  {session.user.role === "ADMIN" && (
                    <button
                      onClick={() => router.push("/admin")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                    >
                      Paneli Git
                    </button>
                  )}
                  {session.user.role === "DOCTOR" && (
                    <button
                      onClick={() => router.push("/doctor")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                    >
                      Doktor Paneli
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center gap-2 cursor-pointer"
                  >
                    Çıkış Yap <IoExitOutline size={18} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              Giriş Yap <span aria-hidden="true">&rarr;</span>
            </button>
          )}

          {/* Hamburger Menü */}
          <button
            className="ml-4 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobil Menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
          {navigation.map((item) => (
            <a
              key={item.name}
              onClick={() => {
                router.push(item.href);
                setMobileMenuOpen(false);
              }}
              className="block px-4 py-2 text-gray-900 text-center text-sm font-semibold cursor-pointer hover:bg-gray-100"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
