import RecommendationCard from "../../components/advice/RecommendationCard";

const doctors = [
  {
    id: 1,
    name: "Dr. Ahmet Yılmaz",
    date: "02 Mart 2025",
    vitamin: "D Vitamini",
    advice:
      "Günlük D vitamini alımı kemik sağlığı için önemlidir. Özellikle güneş görmeyen bireylerde eksiklik yaygındır.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Dr. Ayşe Demir",
    date: "28 Şubat 2025",
    vitamin: "C Vitamini",
    advice:
      "C vitamini bağışıklık sisteminizi güçlendirir ve soğuk algınlığına karşı koruyucu etkisi vardır.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 3,
    name: "Dr. Mehmet Kaya",
    date: "25 Şubat 2025",
    vitamin: "Omega-3",
    advice:
      "Omega-3 yağ asitleri kalp sağlığı için faydalıdır. Haftada en az iki kez balık tüketimi önerilir.",
    image: "https://randomuser.me/api/portraits/men/56.jpg",
  },
  {
    id: 4,
    name: "Dr. Zeynep Kılıç",
    date: "20 Şubat 2025",
    vitamin: "B12 Vitamini",
    advice:
      "B12 vitamini sinir sistemi sağlığı için kritiktir. Et ve süt ürünleri tüketmeyen bireylerde eksiklik görülebilir.",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    id: 5,
    name: "Dr. Hasan Çelik",
    date: "15 Şubat 2025",
    vitamin: "Magnezyum",
    advice:
      "Magnezyum kas ve sinir fonksiyonları için önemlidir. Yeşil yapraklı sebzeler ve kuruyemişler iyi bir kaynaktır.",
    image: "https://randomuser.me/api/portraits/men/40.jpg",
  },
  {
    id: 6,
    name: "Dr. Elif Arslan",
    date: "10 Şubat 2025",
    vitamin: "Demir",
    advice:
      "Demir eksikliği anemiye yol açabilir. Kırmızı et, baklagiller ve koyu yeşil yapraklı sebzeler tüketilmelidir.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    id: 7,
    name: "Dr. Murat Özkan",
    date: "05 Şubat 2025",
    vitamin: "E Vitamini",
    advice:
      "E vitamini antioksidan etkisiyle hücreleri korur. Badem, fındık ve bitkisel yağlar iyi bir kaynaktır.",
    image: "https://randomuser.me/api/portraits/men/60.jpg",
  },
  {
    id: 8,
    name: "Dr. Sevgi Aksoy",
    date: "01 Şubat 2025",
    vitamin: "K Vitamini",
    advice:
      "K vitamini kanın pıhtılaşmasında önemli rol oynar. Yeşil yapraklı sebzeler tüketilmelidir.",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
];

const Recommendations = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center py-30 bg-cover bg-center bg-no-repeat rounded-3xl"
      style={{ backgroundImage: "url('/images/bacground-min.jpg')" }}
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Doktor Tavsiyeleri
      </h1>
      <div className="flex flex-wrap justify-center gap-8">
        {doctors.map((doctor) => (
          <RecommendationCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
