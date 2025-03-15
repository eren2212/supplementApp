"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const BlogClient = () => {
  const blogPosts = [
    {
      title: "Sağlıklı Yaşam İçin 5 Öneri",
      date: "2 Mart 2025",
      excerpt:
        "Sağlıklı bir yaşam tarzı benimsemek için dikkat etmeniz gereken temel unsurları keşfedin...",
      image: "/images/Telefon-1.png",
    },
    {
      title: "Vitamin Takviyeleri: Ne Zaman Kullanılmalı?",
      date: "28 Şubat 2025",
      excerpt:
        "Vitamin takviyelerinin faydaları ve hangi durumlarda kullanılmaları gerektiğini inceleyin...",
      image: "/images/Telefon-1.png",
    },
    {
      title: "Bağışıklık Sistemini Güçlendiren Besinler",
      date: "25 Şubat 2025",
      excerpt:
        "Bağışıklık sisteminizi güçlendirecek besinler hakkında bilmeniz gereken her şey...",
      image: "/images/Telefon-1.png",
    },
  ];

  return (
    <div className="relative isolate px-6 lg:px-8">
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
            Blog Yazıları
          </motion.h1>
        </motion.div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {blogPosts.map((post, index) => (
            <motion.article
              className="post bg-white p-6 rounded-lg shadow-lg"
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm mt-2">{post.date}</p>
              <p className="mt-4 text-gray-600">{post.excerpt}</p>
              <div className="flex justify-end mt-4">
                <a
                  href="#"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Devamını Oku
                </a>
              </div>
            </motion.article>
          ))}
        </section>
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
  );
};

export default BlogClient;
