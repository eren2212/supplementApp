"use client";
import React, { useState } from "react";
import Image from "next/image";
import Telefon from "../../../public/images/Telefon-1.png";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SurveyModal from "../supplement/SurveyModal";
import { useCartStore } from "@/app/store/cartStore";
import { toast } from "react-hot-toast";

const TaskComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { addItem } = useCartStore();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddToCart = async (supplementNames: string[]) => {
    try {
      const response = await fetch("/api/supplements");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const supplements = await response.json();
      let addedCount = 0;

      // Add items one by one instead of all at once to avoid metadata size limitations
      for (const name of supplementNames) {
        const supplement = supplements.find((s: any) => s.name === name);

        if (supplement) {
          // Add a small delay between operations to ensure state updates properly
          await new Promise((resolve) => setTimeout(resolve, 100));

          addItem({
            id: supplement.id,
            name: supplement.name,
            price: supplement.price,
            imageUrl: supplement.imageUrl,
            quantity: 1,
          });
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`${addedCount} ürün sepetinize eklendi!`, {
          position: "top-right",
          duration: 3000,
        });

        // Redirect to cart page after a short delay
        setTimeout(() => {
          router.push("/cart");
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling supplements:", error);
      toast.error("Ürünler eklenirken bir hata oluştu.", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <div className="relative isolate px-6 lg:px-8 lg:m-1 mt-15">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="mx-auto max-w-5xl py-15 lg:py-25">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              className="text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.h1
                className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                Sağlıklı Yaşam İçin Doğru Adres
              </motion.h1>
              <motion.p
                className="mt-4 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Kaliteli ve güvenilir supplementlerle sağlığınızı destekleyin.
              </motion.p>
              <motion.div
                className="mt-8 flex items-center gap-x-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  onClick={openModal}
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Taskı Çözün
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <div className="hidden md:block">
                <Image
                  src={Telefon}
                  alt="Telefon"
                  className="w-[230px] h-auto max-h-[800px] object-contain rounded-3xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>

      <SurveyModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        addToCart={handleAddToCart}
      />
    </>
  );
};

export default TaskComponent;
