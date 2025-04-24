"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useCartStore } from "../../../store/cartStore";
import { Category } from "@prisma/client";
import CommentForm from "@/app/components/supplement/CommentForm";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  isHidden?: boolean;
  reportCount: number;
  user: {
    id?: string;
    name: string;
    image: string | null;
  };
}

interface Supplement {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: Category;
  comments: Comment[];
}

export default function SupplementDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [refreshComments, setRefreshComments] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (params.id) {
      fetchSupplementDetails();
    }
  }, [params.id, refreshComments]);

  const fetchSupplementDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/supplements/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ürün bulunamadı");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSupplement(data);
    } catch (error) {
      console.error("Error fetching supplement details:", error);
      setError(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!supplement) return;

    toast.success("Ürün sepete eklendi!", {
      position: "top-right",
      duration: 2000,
    });

    addItem({
      id: supplement.id,
      name: supplement.name,
      price: supplement.price,
      imageUrl: supplement.imageUrl,
      quantity: quantity,
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

  const handleQuantityChange = (newQuantity: number) => {
    if (supplement && newQuantity >= 1 && newQuantity <= supplement.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleCommentSuccess = () => {
    setRefreshComments((prev) => !prev); // Toggle to trigger re-fetch
  };

  const getAverageRating = () => {
    if (
      !supplement ||
      !supplement.comments ||
      supplement.comments.length === 0
    ) {
      return 0;
    }

    const totalRating = supplement.comments.reduce(
      (sum, comment) => sum + comment.rating,
      0
    );
    return totalRating / supplement.comments.length;
  };

  const handleReportComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Uygunsuz içerik" }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Yorum başarıyla şikayet edildi.");
      } else {
        toast.error(data.error || "Bir hata oluştu.");
      }
    } catch (error) {
      toast.error("Şikayet gönderilirken bir hata oluştu.");
      console.error("Error reporting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg mt-4">Ürün bilgileri yükleniyor...</p>
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
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!supplement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">Ürün bulunamadı</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const averageRating = getAverageRating();

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-8 text-sm">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Takviyeler
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{supplement.name}</span>
      </div>

      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Product Image */}
        <div className="md:w-1/2 h-96 md:h-auto relative">
          <Image
            src={`/SupplementImage/${supplement.imageUrl}`}
            alt={supplement.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{supplement.name}</h1>

            {supplement.comments && supplement.comments.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({supplement.comments.length} yorum)
                </span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {getCategoryName(supplement.category)}
            </span>
          </div>

          <p className="text-gray-700 mb-8 text-lg">{supplement.description}</p>

          <div className="mt-auto space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-blue-600">
                {supplement.price.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  supplement.stock > 10
                    ? "bg-green-100 text-green-800"
                    : supplement.stock > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {supplement.stock > 10
                  ? "Stokta Var"
                  : supplement.stock > 0
                  ? `Son ${supplement.stock} Ürün`
                  : "Stokta Yok"}
              </span>
            </div>

            {supplement.stock > 0 && (
              <>
                <div className="flex items-center mt-4">
                  <label className="mr-4 font-medium text-gray-700">
                    Adet:
                  </label>
                  <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={supplement.stock}
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                      className="w-12 text-center focus:outline-none py-2"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= supplement.stock}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex mt-6 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Sepete Ekle
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          Yorumlar
          {supplement.comments && supplement.comments.length > 0 && (
            <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {supplement.comments.length}
            </span>
          )}
        </h2>

        {/* Comment Form */}
        <CommentForm
          supplementId={supplement.id}
          onSuccess={handleCommentSuccess}
        />

        {/* Comments List */}
        {supplement.comments && supplement.comments.length > 0 ? (
          <div className="space-y-4 mt-6">
            {supplement.comments
              .filter((comment) => !comment.isHidden)
              .map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-5 rounded-lg shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative mr-4">
                      {comment.user?.image ? (
                        <Image
                          src={comment.user.image}
                          alt={comment.user.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-lg">
                          {comment.user?.name || "Misafir"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "tr-TR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${
                              i < comment.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{comment.content}</p>

                  <div className="mt-3 flex justify-between items-center">
                    {comment.reportCount > 0 && (
                      <div className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-gray-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span
                          className={
                            comment.reportCount >= 2
                              ? "text-red-500"
                              : "text-gray-500"
                          }
                        >
                          {comment.reportCount} Şikayet
                        </span>
                      </div>
                    )}

                    {session?.user && comment.user?.id !== session.user.id && (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="text-xs text-gray-500 hover:text-red-500 flex items-center ml-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Şikayet Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center mt-6">
            <p className="text-gray-600">
              Bu ürün için henüz yorum yapılmamış. İlk yorumu sen yapabilirsin!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
