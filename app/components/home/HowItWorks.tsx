"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Testi Çözün",
      description:
        "Size özel hazırlanmış birkaç basit soruya yanıt vererek ihtiyaçlarınıza uygun ürünleri belirleyin.",
      icon: "📝",
    },
    {
      id: 2,
      title: "Akıllı Algoritma Analiz Etsin",
      description:
        "Cevaplarınıza göre yapay zeka destekli algoritmamız en uygun takviye ürünlerini belirler.",
      icon: "🤖",
    },
    {
      id: 3,
      title: "Sepetinize Ekleyin",
      description:
        "Önerilen ürünler doğrudan sepetinize eklenir. İhtiyacınıza göre ürünleri inceleyebilir ve değiştirebilirsiniz.",
      icon: "🛒",
    },
    {
      id: 4,
      title: "Alışverişinizi Tamamlayın",
      description:
        "Güvenli ödeme yöntemleriyle siparişinizi tamamlayın ve ihtiyacınız olan takviyeleri kolayca edinin.",
      icon: "✅",
    },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="py-16 px-6 lg:px-24" ref={ref}>
      <motion.h2
        className="text-3xl font-bold text-center text-gray-800 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Nasıl Çalışır?
      </motion.h2>
      <div className="flex flex-col space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-start space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 2.5, delay: index * 0.2 }}
          >
            <div className="text-4xl">{step.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {index + 1}. {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
