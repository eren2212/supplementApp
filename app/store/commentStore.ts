import { create } from "zustand";
import { Category } from "@prisma/client";

export interface CommentFormData {
  supplementId: string;
  content: string;
  rating: number;
}

interface CommentState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  pendingComment: CommentFormData;
  setPendingComment: (comment: Partial<CommentFormData>) => void;
  resetForm: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  isSubmitting: false,
  error: null,
  success: false,
  pendingComment: {
    supplementId: "",
    content: "",
    rating: 5,
  },
  setPendingComment: (comment) =>
    set((state) => ({
      pendingComment: { ...state.pendingComment, ...comment },
    })),
  resetForm: () =>
    set({
      pendingComment: {
        supplementId: "",
        content: "",
        rating: 5,
      },
      error: null,
      success: false,
      isSubmitting: false,
    }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error, success: false, isSubmitting: false }),
  setSuccess: (success) => set({ success, error: null, isSubmitting: false }),
}));
