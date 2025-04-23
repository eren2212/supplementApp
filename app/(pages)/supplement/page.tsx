"use client";

import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";

interface Supplement {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: Category;
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">(
    "ALL"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/supplements");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSupplements(data);
    } catch (error) {
      console.error("Error fetching supplements:", error);
      setError("Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (supplement: Supplement) => {
    // Sepete ekleme animasyonu için toast bildirimi
    toast.success("Ürün sepete eklendi!", {
      position: "top-right",
      duration: 2000,
    });

    // Zustand store'a ekle
    addItem({
      id: supplement.id,
      name: supplement.name,
      price: supplement.price,
      imageUrl: supplement.imageUrl,
      quantity: 1,
    });
  };

  const getCategoryName = (category: Category) => {
    const categoryNames: Record<Category, string> = {
      BRAIN: "Beyin Sağlığı",
      WOMEN_HEALTH: "Kadın Sağlığı",
      MENS_HEALTH: "Erkek Sağlığı",
      HEART: "Kalp Sağlığı",
      SLEEP: "Uyku Düzeni",
      ENERGY: "Enerji",
    };
    return categoryNames[category];
  };

  const filteredSupplements =
    selectedCategory === "ALL"
      ? supplements
      : supplements.filter(
          (supplement) => supplement.category === selectedCategory
        );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-lg">{error}</p>
          <button
            onClick={fetchSupplements}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-25">
      <h1 className="text-3xl font-bold mb-8">Takviyeler</h1>

      {/* Kategori Filtreleme */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 overflow-x-auto pb-4">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
            selectedCategory === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Tümü
        </button>

        {Object.values(Category).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Ürün Grid */}
      {filteredSupplements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Bu kategoride ürün bulunamadı.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredSupplements.map((supplement) => (
              <motion.div
                key={supplement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
                onMouseEnter={() => setHoveredCard(supplement.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Ürün Resmi */}
                <div className="relative h-48 w-full group">
                  <Image
                    src={`/SupplementImage/${supplement.imageUrl
                      .split("/")
                      .pop()}`}
                    alt={supplement.name}
                    fill
                    className={`object-cover transition-all duration-300 ${
                      hoveredCard === supplement.id ? "scale-105" : "scale-100"
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Blur Overlay with Buttons - Hover durumunda görünür */}
                  {hoveredCard === supplement.id && (
                    <motion.div
                      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      className="absolute inset-0 bg-white-100 bg-opacity-20 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(supplement)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1 text-sm cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Sepete Ekle
                      </motion.button>
                      <Link href={`/supplement/${supplement.id}`} passHref>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-200 flex items-center gap-1 text-sm cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Detaylar
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-2">
                    {supplement.name}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {supplement.description}
                  </p>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-blue-600">
                      {supplement.price.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </span>
                    <span
                      className={`text-sm ${
                        supplement.stock > 0 ? "text-gray-500" : "text-red-500"
                      }`}
                    >
                      {supplement.stock > 0
                        ? `Stok: ${supplement.stock}`
                        : "Stokta Yok"}
                    </span>
                  </div>

                  <div className="mt-auto pt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getCategoryName(supplement.category)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
