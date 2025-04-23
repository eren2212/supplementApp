"use client";

import { useState, useEffect } from "react";
import { useCommentStore, CommentFormData } from "@/app/store/commentStore";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface CommentFormProps {
  supplementId: string;
  onSuccess?: () => void;
}

export default function CommentForm({
  supplementId,
  onSuccess,
}: CommentFormProps) {
  const { data: session } = useSession();
  const [tempRating, setTempRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const {
    pendingComment,
    setPendingComment,
    resetForm,
    isSubmitting,
    setSubmitting,
    setError,
    setSuccess,
  } = useCommentStore();

  // Initialize supplement ID when component mounts
  useEffect(() => {
    setPendingComment({ supplementId });
    return () => resetForm();
  }, [supplementId]);

  const handleRatingChange = (rating: number) => {
    setTempRating(rating);
    setPendingComment({ rating });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPendingComment({ content: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Yorum yapmak için giriş yapmalısınız");
      return;
    }

    if (!pendingComment.content.trim()) {
      toast.error("Lütfen bir yorum yazın");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplementId: pendingComment.supplementId,
          content: pendingComment.content,
          rating: pendingComment.rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Yorum eklenirken bir hata oluştu");
      }

      toast.success("Yorumunuz başarıyla eklendi");
      setSuccess(true);
      resetForm();
      setTempRating(5);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bir hata oluştu";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <p className="text-center text-gray-600">
          Yorum yapmak için{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            giriş yapın
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-xl font-semibold mb-4">Yorum Yap</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Puanınız</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 ${
                    (
                      hoveredRating !== null
                        ? star <= hoveredRating
                        : star <= tempRating
                    )
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 mb-2">
            Yorumunuz
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
            value={pendingComment.content}
            onChange={handleContentChange}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
        </button>
      </form>
    </div>
  );
}
