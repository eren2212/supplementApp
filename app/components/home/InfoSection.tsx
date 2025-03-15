"use client";
import React from "react";
import { motion } from "framer-motion";

const InfoSection = () => {
  return (
    <div className="relative isolate px-6 lg:px-8 py-16 bg-gradient-to-t rounded-3xl">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16 sm:text-5xl">
          Neden Bu Sistemi Kullanmalısınız?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Bilgi 1 */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
            initial={{ opacity: 0, x: 100 }} // Sağdan gelmesi için x: 100
            whileInView={{ opacity: 1, x: 0 }} // Görünür hale geldiğinde tam yerine oturacak
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-indigo-600 mb-4">
              Kendi İhtiyacınıza Uygun Ürünleri Keşfedin
            </h3>
            <p className="text-lg text-gray-700">
              Rastgele ürün satın almak yerine, sağlığınıza ve yaşam tarzınıza
              en uygun takviye ürünlerini keşfedin. Sistemimiz, verdiğiniz
              yanıtlara göre size özel öneriler sunarak ihtiyacınız olmayan
              ürünleri almanızı önler ve bilinçli bir alışveriş deneyimi
              yaşamanızı sağlar.
            </p>
          </motion.div>

          {/* Bilgi 2 */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
            initial={{ opacity: 0, x: 100 }} // Sağdan gelmesi için x: 100
            whileInView={{ opacity: 1, x: 0 }} // Görünür hale geldiğinde tam yerine oturacak
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-indigo-600 mb-4">
              Hızlı ve Kolay Kullanım
            </h3>
            <p className="text-lg text-gray-700">
              Karmaşık içerikleri incelemek zorunda kalmadan sadece birkaç basit
              soruya yanıt vererek size en uygun takviyeleri öğrenebilirsiniz.
              Test süreci hızlı ve kullanıcı dostu olup, herhangi bir ek bilgi
              gerektirmez. Böylece zaman kaybetmeden doğru ürüne
              ulaşabilirsiniz.
            </p>
          </motion.div>

          {/* Bilgi 3 */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
            initial={{ opacity: 0, x: 100 }} // Sağdan gelmesi için x: 100
            whileInView={{ opacity: 1, x: 0 }} // Görünür hale geldiğinde tam yerine oturacak
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-indigo-600 mb-4">
              Güvenilir ve Klinik Onaylı Ürünler
            </h3>
            <p className="text-lg text-gray-700">
              Önerilen tüm takviyeler bilimsel araştırmalar ve uzman
              değerlendirmeleriyle belirlenir. Klinik olarak test edilmiş,
              kalite standartlarına uygun ve güvenilir içeriklere sahip ürünler
              sunularak sağlığınızın ön planda tutulması sağlanır.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
