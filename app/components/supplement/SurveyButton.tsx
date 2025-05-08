import { useState, useEffect } from "react";
import SurveyModal from "./SurveyModal";
import { useCartStore } from "../../store/cartStore";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Supplement {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface SurveyButtonProps {
  addToCart: (supplements: string[]) => void;
}

const SurveyButton = ({ addToCart }: SurveyButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Bana Uygun Takviyeyi Bul
      </button>

      <SurveyModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        addToCart={addToCart}
      />
    </>
  );
};

export default SurveyButton;
