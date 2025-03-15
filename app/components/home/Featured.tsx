"use client";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

const FeaturedFeatures = () => {
  const { ref: ref1, inView: inView1 } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const { ref: ref2, inView: inView2 } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const { ref: ref3, inView: inView3 } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div className="flex flex-wrap justify-center gap-12 mt-16">
      <motion.div
        className="flex flex-col items-center text-center p-8 rounded-xl shadow-lg bg-gradient-to-r from-[#c8d7ff] to-[#c8d7ff] text-gray-800 transform transition duration-500 hover:scale-105 backdrop-blur-md"
        ref={ref1}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView1 ? 1 : 0, y: inView1 ? 0 : 30 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-6xl mb-6">🎯</div>
        <h3 className="font-bold text-2xl mb-4">
          Kişiselleştirilmiş Ürün Önerileri
        </h3>
        <p className="text-lg">
          Kullanıcı ihtiyaçlarına ve tercihlerine göre özel olarak seçilen ürün
          önerileri ile alışveriş deneyiminizi kolaylaştırın ve
          kişiselleştirilmiş çözümlerle daha hızlı sonuçlar alın.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col items-center text-center p-8 rounded-xl shadow-lg bg-gradient-to-r from-[#c8d7ff] to-[#c8d7ff] text-gray-800 transform transition duration-500 hover:scale-105 backdrop-blur-md"
        ref={ref2}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView2 ? 1 : 0, y: inView2 ? 0 : 30 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-6xl mb-6">⚡</div>
        <h3 className="font-bold text-2xl mb-4">Hızlı ve Güvenilir İşlem</h3>
        <p className="text-lg">
          Sistemdeki işlemlerinizde hız ve güvenliği ön planda tutarak,
          kesintisiz ve hızlı bir deneyim sunuyoruz. Kısa süre içinde
          işlemlerinizi tamamlayarak zamandan tasarruf edin.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col items-center text-center p-8 rounded-xl shadow-lg bg-gradient-to-r from-[#c8d7ff] to-[#c8d7ff] text-gray-800 transform transition duration-500 hover:scale-105 backdrop-blur-md"
        ref={ref3}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: inView3 ? 1 : 0, y: inView3 ? 0 : 30 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-6xl mb-6">🧪</div>
        <h3 className="font-bold text-2xl mb-4">
          Bilimsel ve Klinik Onaylı Takviyeler
        </h3>
        <p className="text-lg">
          Sağlığınızı en iyi şekilde destekleyen, bilimsel araştırmalarla
          kanıtlanmış ve klinik olarak onaylanmış takviyeler ile yaşam
          kalitenizi artırın. Sağlıklı bir yaşam için doğru tercihler!
        </p>
      </motion.div>
    </div>
  );
};

export default FeaturedFeatures;
