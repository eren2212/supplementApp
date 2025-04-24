import { create } from "zustand";
import axios from "axios";

export interface Doctor {
  id: number;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
}

export interface Advice {
  id: number;
  doctorId: number;
  title: string;
  content: string;
  category: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  status?: "published" | "draft" | "pending";
}

export type NewAdvice = Omit<Advice, "id" | "date" | "likes" | "isLiked">;

interface DoctorAdviceState {
  doctors: Doctor[];
  advices: Advice[];
  userDoctorId: number | null; // Oturum açan doktorun ID'si
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  fetchDoctors: () => Promise<void>;
  fetchAdvices: () => Promise<void>;
  fetchDoctorAdvices: (doctorId: number) => Promise<Advice[]>;
  likeAdvice: (adviceId: number) => void;
  setSelectedCategory: (category: string) => void;
  addAdvice: (newAdvice: NewAdvice) => Promise<void>;
  updateAdvice: (
    adviceId: number,
    updatedAdvice: Partial<Advice>
  ) => Promise<void>;
  deleteAdvice: (adviceId: number) => Promise<void>;
  setUserDoctorId: (doctorId: number | null) => void;
}

// Mock data for now - would be replaced with API calls in production
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Ahmet Yılmaz",
    title: "Beslenme Uzmanı",
    specialty: "Klinik Beslenme",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "10 yıllık klinik beslenme deneyimiyle özellikle vitamin eksiklikleri konusunda uzmanlaşmıştır.",
  },
  {
    id: 2,
    name: "Dr. Ayşe Demir",
    title: "Endokrinolog",
    specialty: "Vitamin ve Hormon Tedavisi",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    bio: "Hormon dengesi ve vitamin takviyelerinin etkileşimleri konusunda uzmandır.",
  },
  {
    id: 3,
    name: "Dr. Mehmet Kaya",
    title: "Kardiyoloji Uzmanı",
    specialty: "Koruyucu Kardiyoloji",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
    bio: "Kalp sağlığı için doğal takviyeler ve beslenme programları konusunda uzmanlaşmıştır.",
  },
  {
    id: 4,
    name: "Dr. Zeynep Kılıç",
    title: "Nöroloji Uzmanı",
    specialty: "Nörolojik Hastalıklar",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
    bio: "Beyin sağlığı ve sinir sistemi için vitamin destekleri konusunda çalışmalar yapmaktadır.",
  },
  {
    id: 5,
    name: "Dr. Hasan Çelik",
    title: "Spor Hekimi",
    specialty: "Spor Beslenmesi",
    image: "https://randomuser.me/api/portraits/men/40.jpg",
    bio: "Sporcularda performans artışı ve sağlıklı takviye kullanımı konusunda uzmanlaşmıştır.",
  },
];

const mockAdvices: Advice[] = [
  {
    id: 1,
    doctorId: 1,
    title: "D Vitamini ve Kemik Sağlığı",
    content:
      "Günlük D vitamini alımı kemik sağlığı için kritik önem taşır. Özellikle kapalı ortamlarda çalışan ve güneş ışığından yeterince faydalanamayan bireylerde D vitamini eksikliği yaygındır. Günde 1000-2000 IU D vitamini takviyesi, eksikliği önlemeye yardımcı olabilir. Takviye almadan önce kan testi yaptırmanızı öneririm.",
    category: "Vitamin",
    date: "10 Mart 2024",
    likes: 145,
    status: "published",
  },
  {
    id: 2,
    doctorId: 2,
    title: "C Vitamini ve Bağışıklık",
    content:
      "C vitamini bağışıklık sisteminizi güçlendirir ve soğuk algınlığına karşı koruyucu etkisi vardır. Günlük 500-1000 mg C vitamini özellikle hastalık dönemlerinde bağışıklık sistemini destekleyebilir. Narenciye, kivi ve çilek gibi meyveler doğal C vitamini kaynaklarıdır, ancak yüksek dozlara ulaşmak için takviye gerekebilir.",
    category: "Vitamin",
    date: "5 Mart 2024",
    likes: 98,
    status: "published",
  },
  {
    id: 3,
    doctorId: 3,
    title: "Omega-3 ve Kalp Sağlığı",
    content:
      "Omega-3 yağ asitleri kalp sağlığı için kritik öneme sahiptir. Düzenli Omega-3 takviyesi, trigliserit seviyelerini düşürebilir ve kalp ritmi düzensizliklerini azaltabilir. Haftada en az iki kez yağlı balık tüketimi veya günlük 1000 mg EPA/DHA içeren bir Omega-3 takviyesi öneririm. Kalp ilacı kullanıyorsanız, doktorunuza danışmadan başlamayın.",
    category: "Yağ Asitleri",
    date: "28 Şubat 2024",
    likes: 210,
    status: "published",
  },
  {
    id: 4,
    doctorId: 4,
    title: "B12 Vitamini ve Sinir Sistemi",
    content:
      "B12 vitamini sinir sistemi sağlığı için kritiktir. Eksikliğinde sinir hasarı, hafıza sorunları ve hatta depresyon görülebilir. Veganlar ve 50 yaş üzeri bireyler için günlük 1000 mcg B12 takviyesi öneriyorum. B12'nin metilkobalamin formu daha iyi emilir. Kronik bir sağlık sorununuz varsa, kullanmadan önce doktorunuza danışın.",
    category: "Vitamin",
    date: "20 Şubat 2024",
    likes: 176,
    status: "published",
  },
  {
    id: 5,
    doctorId: 5,
    title: "Magnezyum ve Kas Fonksiyonları",
    content:
      "Magnezyum, 300'den fazla enzim reaksiyonunda görev alan kritik bir mineraldir. Kas spazmları, kramplar ve uyku sorunları yaşayanlar için günlük 300-400 mg magnezyum takviyesi faydalı olabilir. Magnezyum glisinat formu mide rahatsızlığı yapmadan daha iyi emilir. Böbrek probleminiz varsa, magnezyum takviyesi kullanmadan önce mutlaka doktorunuza danışın.",
    category: "Mineral",
    date: "15 Şubat 2024",
    likes: 132,
    status: "published",
  },
  {
    id: 6,
    doctorId: 1,
    title: "Probiyotikler ve Bağırsak Sağlığı",
    content:
      "Bağırsak florası, genel sağlığımızı doğrudan etkiler. Kaliteli bir probiyotik takviyesi, sindirim sorunlarının giderilmesine, bağışıklık sisteminin güçlenmesine ve hatta ruh halinin iyileşmesine yardımcı olabilir. En az 10 milyar CFU içeren ve çoklu bakteri suşları barındıran probiyotik takviyeleri tercih edin.",
    category: "Sindirim",
    date: "12 Şubat 2024",
    likes: 155,
    status: "published",
  },
  {
    id: 7,
    doctorId: 2,
    title: "Demir Eksikliği ve Anemi",
    content:
      "Demir eksikliği, özellikle kadınlarda yaygın görülen bir sorundur. Yorgunluk, halsizlik ve konsantrasyon güçlüğü yaşıyorsanız, demir seviyelerinizi kontrol ettirmenizi öneririm. Demir takviyesi, C vitamini ile birlikte alındığında daha iyi emilir. Ancak demir fazlalığı da zararlı olabilir, bu nedenle doktor kontrolünde kullanın.",
    category: "Mineral",
    date: "5 Şubat 2024",
    likes: 118,
    status: "published",
  },
  {
    id: 8,
    doctorId: 3,
    title: "Koenzim Q10 ve Enerji Üretimi",
    content:
      "Koenzim Q10, hücresel enerji üretiminde kritik rol oynar ve güçlü bir antioksidandır. Özellikle statin grubu kolesterol ilaçları kullananlar, yorgunluk ve kas ağrıları yaşayanlar için günlük 100-200 mg CoQ10 takviyesi faydalı olabilir. Ubiquinol formu, özellikle 40 yaş üstü bireyler için daha etkilidir.",
    category: "Antioksidan",
    date: "1 Şubat 2024",
    likes: 185,
    status: "published",
  },
];

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

// Tarih formatı yardımcı fonksiyon
const formatDate = (): string => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(
    date
  );
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

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
      // Gerçek bir API çağrısı yapılacak:
      // const response = await axios.get('/api/doctors');
      // set({ doctors: response.data, loading: false });

      // Şimdilik mock veri kullanıyoruz
      setTimeout(() => {
        set({ doctors: mockDoctors, loading: false });
      }, 500);
    } catch (error) {
      set({ error: "Doktorlar yüklenirken bir hata oluştu", loading: false });
      console.error("Doktorları getirme hatası:", error);
    }
  },

  fetchAdvices: async () => {
    set({ loading: true });
    try {
      // Gerçek bir API çağrısı yapılacak:
      // const response = await axios.get('/api/advices');
      // set({ advices: response.data, loading: false });

      // Şimdilik mock veri kullanıyoruz
      setTimeout(() => {
        set({
          advices: mockAdvices.filter((a) => a.status === "published"),
          loading: false,
        });
      }, 500);
    } catch (error) {
      set({ error: "Tavsiyeler yüklenirken bir hata oluştu", loading: false });
      console.error("Tavsiyeleri getirme hatası:", error);
    }
  },

  fetchDoctorAdvices: async (doctorId: number) => {
    set({ loading: true });
    try {
      // Gerçek bir API çağrısı yapılacak:
      // const response = await axios.get(`/api/doctors/${doctorId}/advices`);
      // const doctorAdvices = response.data;

      // Şimdilik mock veri kullanıyoruz
      const doctorAdvices = mockAdvices.filter(
        (advice) => advice.doctorId === doctorId
      );

      set({ loading: false });
      return doctorAdvices;
    } catch (error) {
      set({
        error: "Doktor tavsiyeleri yüklenirken bir hata oluştu",
        loading: false,
      });
      console.error("Doktor tavsiyelerini getirme hatası:", error);
      return [];
    }
  },

  likeAdvice: (adviceId: number) => {
    set((state) => ({
      advices: state.advices.map((advice) =>
        advice.id === adviceId
          ? {
              ...advice,
              likes: advice.isLiked ? advice.likes - 1 : advice.likes + 1,
              isLiked: !advice.isLiked,
            }
          : advice
      ),
    }));
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  setUserDoctorId: (doctorId: number | null) => {
    set({ userDoctorId: doctorId });
  },

  addAdvice: async (newAdvice: NewAdvice) => {
    set({ loading: true });
    try {
      // Gerçek bir API çağrısı yapılacak:
      // const response = await axios.post('/api/advices', newAdvice);
      // const addedAdvice = response.data;

      // Şimdilik mock veri kullanıyoruz
      const addedAdvice: Advice = {
        ...newAdvice,
        id: Math.max(...mockAdvices.map((a) => a.id)) + 1,
        date: formatDate(),
        likes: 0,
        status: "published",
      };

      mockAdvices.push(addedAdvice);

      set((state) => ({
        advices: [...state.advices, addedAdvice],
        loading: false,
        error: null,
      }));
    } catch (error) {
      set({ error: "Tavsiye eklenirken bir hata oluştu", loading: false });
      console.error("Tavsiye ekleme hatası:", error);
    }
  },

  updateAdvice: async (adviceId: number, updatedAdvice: Partial<Advice>) => {
    set({ loading: true });
    try {
      // Gerçek bir API çağrısı yapılacak:
      // const response = await axios.put(`/api/advices/${adviceId}`, updatedAdvice);
      // const updatedAdviceData = response.data;

      // Şimdilik mock veri kullanıyoruz
      const adviceIndex = mockAdvices.findIndex((a) => a.id === adviceId);
      if (adviceIndex !== -1) {
        mockAdvices[adviceIndex] = {
          ...mockAdvices[adviceIndex],
          ...updatedAdvice,
        };
      }

      set((state) => ({
        advices: state.advices.map((advice) =>
          advice.id === adviceId ? { ...advice, ...updatedAdvice } : advice
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      set({ error: "Tavsiye güncellenirken bir hata oluştu", loading: false });
      console.error("Tavsiye güncelleme hatası:", error);
    }
  },

  deleteAdvice: async (adviceId: number) => {
    set({ loading: true });
    try {
      // Gerçek bir API çağrısı yapılacak:
      // await axios.delete(`/api/advices/${adviceId}`);

      // Şimdilik mock veri kullanıyoruz
      const adviceIndex = mockAdvices.findIndex((a) => a.id === adviceId);
      if (adviceIndex !== -1) {
        mockAdvices.splice(adviceIndex, 1);
      }

      set((state) => ({
        advices: state.advices.filter((advice) => advice.id !== adviceId),
        loading: false,
        error: null,
      }));
    } catch (error) {
      set({ error: "Tavsiye silinirken bir hata oluştu", loading: false });
      console.error("Tavsiye silme hatası:", error);
    }
  },
}));
