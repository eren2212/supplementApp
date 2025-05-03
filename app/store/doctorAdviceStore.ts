import { create } from "zustand";
import axios from "axios";

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  email?: string;
}

export interface Advice {
  id: string;
  doctorId: string;
  title: string;
  content: string;
  category: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  status?: "published" | "draft" | "pending";
  imageUrl?: string;
  doctor?: Doctor;
}

export type NewAdvice = Omit<Advice, "id" | "date" | "likes" | "isLiked">;

interface DoctorAdviceState {
  doctors: Doctor[];
  advices: Advice[];
  userDoctorId: string | null; // Oturum açan doktorun ID'si
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  fetchDoctors: () => Promise<Doctor[]>;
  fetchAdvices: () => Promise<Advice[]>;
  fetchDoctorAdvices: (doctorId: string) => Promise<Advice[]>;
  likeAdvice: (adviceId: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  addAdvice: (newAdvice: NewAdvice) => Promise<void>;
  updateAdvice: (
    adviceId: string,
    updatedAdvice: Partial<Advice>
  ) => Promise<void>;
  deleteAdvice: (adviceId: string) => Promise<void>;
  setUserDoctorId: (doctorId: string | null) => void;
}

// Tavsiye kategorileri
export const adviceCategories = [
  "Vitamin",
  "Mineral",
  "Yağ Asitleri",
  "Antioksidan",
  "Sindirim",
  "Protein",
  "Bitkisel Takviye",
  "Amino Asit",
];

export const useDoctorAdviceStore = create<DoctorAdviceState>((set, get) => ({
  doctors: [],
  advices: [],
  userDoctorId: null,
  loading: false,
  error: null,
  selectedCategory: "all",

  fetchDoctors: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/public/doctors");
      set({ doctors: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: "Doktorlar yüklenirken bir hata oluştu",
        loading: false,
      });
      console.error("Doktorları getirme hatası:", error);
      return [];
    }
  },

  fetchAdvices: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/public/advices");
      set({ advices: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: "Tavsiyeler yüklenirken bir hata oluştu",
        loading: false,
      });
      console.error("Tavsiyeleri getirme hatası:", error);
      return [];
    }
  },

  fetchDoctorAdvices: async (doctorId) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `/api/doctor/advices?doctorId=${doctorId}`
      );
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: "Doktor tavsiyeleri yüklenirken bir hata oluştu",
        loading: false,
      });
      console.error("Doktor tavsiyelerini getirme hatası:", error);
      return [];
    }
  },

  likeAdvice: async (adviceId) => {
    try {
      const response = await axios.patch(`/api/public/advices/${adviceId}`);

      // Güncel beğeni sayısını al
      const { likes } = response.data;

      // State'i güncelle
      set((state) => ({
        advices: state.advices.map((advice) =>
          advice.id === adviceId ? { ...advice, likes, isLiked: true } : advice
        ),
      }));
    } catch (error: any) {
      console.error("Tavsiye beğenilirken hata oluştu:", error);
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  addAdvice: async (newAdvice) => {
    set({ loading: true });
    try {
      const response = await axios.post("/api/doctor/advices", newAdvice);

      // API'den gelen yeni eklenen tavsiye
      const addedAdvice = response.data;

      // State'i güncelle
      set((state) => ({
        loading: false,
        advices: [addedAdvice, ...state.advices],
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Tavsiye eklenirken bir hata oluştu",
        loading: false,
      });
      console.error("Tavsiye ekleme hatası:", error);
    }
  },

  updateAdvice: async (adviceId, updatedAdvice) => {
    set({ loading: true });
    try {
      const response = await axios.patch(
        `/api/doctor/advices/${adviceId}`,
        updatedAdvice
      );

      // API'den gelen güncellenmiş tavsiye
      const updated = response.data;

      // State'i güncelle
      set((state) => ({
        loading: false,
        advices: state.advices.map((advice) =>
          advice.id === adviceId ? { ...advice, ...updated } : advice
        ),
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error ||
          "Tavsiye güncellenirken bir hata oluştu",
        loading: false,
      });
      console.error("Tavsiye güncelleme hatası:", error);
    }
  },

  deleteAdvice: async (adviceId) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/doctor/advices/${adviceId}`);

      // State'den silinmiş tavsiyeyi kaldır
      set((state) => ({
        loading: false,
        advices: state.advices.filter((advice) => advice.id !== adviceId),
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || "Tavsiye silinirken bir hata oluştu",
        loading: false,
      });
      console.error("Tavsiye silme hatası:", error);
    }
  },

  setUserDoctorId: (doctorId) => {
    set({ userDoctorId: doctorId });
  },
}));
