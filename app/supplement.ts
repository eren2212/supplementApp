// export const detailedSupplementFeatures = [
//   {
//     id: 1,
//     name: "C Vitamini",
//     description:
//       "Bağışıklık sistemini güçlendiren, güçlü antioksidan özelliklere sahip ve cilt sağlığını destekleyen temel bir vitamindir.",
//     price: 15.99,
//     stock: 150,
//     imageUrl: "https://via.placeholder.com/150/FFD700/FFFFFF?Text=C%20Vitamini", // Örnek resim URL'si
//     features: [
//       "Güçlü antioksidan özelliklere sahiptir ve hücreleri serbest radikallerin zararlı etkilerinden korur.",
//       "Cilt sağlığını destekler, kolajen üretimini teşvik eder ve cildin daha parlak ve genç görünmesine yardımcı olur.",
//       "Bağışıklık sisteminin normal fonksiyonuna katkıda bulunur ve vücudun enfeksiyonlara karşı direncini artırır.",
//       "Demir emilimini artırır.",
//       "Yorgunluk ve bitkinliğin azalmasına yardımcı olur.",
//     ],
//   },
//   {
//     id: 2,
//     name: "Krill Yağı",
//     description:
//       "Omega-3 yağ asitleri, EPA ve DHA içeren, eklem ve bilişsel sağlığı destekleyen doğal bir kaynaktır.",
//     price: 29.99,
//     stock: 100,
//     imageUrl:
//       "https://via.placeholder.com/150/4682B4/FFFFFF?Text=Krill%20Ya%C4%9F%C4%B1", // Örnek resim URL'si
//     features: [
//       "Eklem sağlığını destekler, eklem ağrılarını ve iltihaplanmayı azaltmaya yardımcı olabilir.",
//       "Bilişsel sağlığı destekler, hafıza, odaklanma ve konsantrasyon yeteneklerini geliştirebilir.",
//       "Kalp sağlığı için faydalıdır, trigliserit seviyelerini düşürmeye ve kan basıncını düzenlemeye yardımcı olabilir.",
//       "Güçlü bir antioksidandır.",
//       "Fosfolipidler içerdiği için emilimi balık yağına göre daha iyidir.",
//     ],
//   },
//   {
//     id: 3,
//     name: "L-Tirozin",
//     description:
//       "Nörotransmitterlerin (dopamin, norepinefrin) öncüsü olan bir amino asittir, enerji ve odaklanmayı destekler.",
//     price: 22.5,
//     stock: 120,
//     imageUrl: "https://via.placeholder.com/150/F08080/FFFFFF?Text=L-Tirozin", // Örnek resim URL'si
//     features: [
//       "Yorgunluk belirtilerini hafifletmeye yardımcı olur ve enerji seviyelerini artırabilir.",
//       "Stres seviyelerini azaltmaya yardımcı olur ve zihinsel netliği destekler.",
//       "Ruh halini iyileştirmeye yardımcı olabilir.",
//       "Tiroid hormonlarının üretimi için gereklidir.",
//       "Egzersiz performansını artırabilir.",
//     ],
//   },
//   {
//     id: 4,
//     name: "Magnezyum Bisglisinat",
//     description:
//       "Uyku kalitesini destekleyen, kemik sağlığına katkıda bulunan ve kas fonksiyonlarını düzenleyen önemli bir mineral takviyesidir.",
//     price: 18.75,
//     stock: 180,
//     imageUrl: "https://via.placeholder.com/150/8FBC8F/FFFFFF?Text=Magnezyum", // Örnek resim URL'si
//     features: [
//       "Uyku kalitesini destekler ve uykuya dalmaya yardımcı olur, rahatlamayı teşvik eder.",
//       "Kemik sağlığına ve sağlıklı bağışıklık fonksiyonuna katkıda bulunur.",
//       "Kas ve sinir fonksiyonlarını destekler.",
//       "Enerji üretimi için gereklidir.",
//       "Stres ve anksiyete seviyelerini azaltmaya yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 5,
//     name: "Melatonin",
//     description:
//       "Uyku düzenini düzenlemeye yardımcı olan ve uyku kalitesini artıran doğal bir hormondur.",
//     price: 12.99,
//     stock: 200,
//     imageUrl: "https://via.placeholder.com/150/483D8B/FFFFFF?Text=Melatonin", // Örnek resim URL'si
//     features: [
//       "Uyku kalitesini artırmaya yardımcı olur ve daha düzenli bir uyku döngüsü sağlar.",
//       "Jet lag semptomlarını hafifletmeye yardımcı olabilir.",
//       "Antioksidan özelliklere sahiptir.",
//       "Kan basıncını kontrol etmeye yardımcı olabilir (dolaylı olarak uyku düzeni üzerinden).",
//     ],
//   },
//   {
//     id: 6,
//     name: "Probiyotik Kompleks",
//     description:
//       "Sindirim sağlığını destekleyen, bağışıklık sistemini güçlendiren ve şişkinliği azaltmaya yardımcı olan canlı bakteri kültürü takviyesidir.",
//     price: 25.5,
//     stock: 90,
//     imageUrl: "https://via.placeholder.com/150/90EE90/FFFFFF?Text=Probiyotik", // Örnek resim URL'si
//     features: [
//       "Bağırsak florasını dengeleyerek sindirim sağlığını destekler.",
//       "Şişkinliği azaltmaya yardımcı olur ve sindirim rahatsızlıklarını hafifletebilir.",
//       "Bağışıklık sistemini güçlendirmeye yardımcı olabilir.",
//       "Besin emilimini artırabilir.",
//       "Stres düzeylerini azaltmaya yardımcı olabilir (bağırsak-beyin aksı üzerinden).",
//     ],
//   },
//   {
//     id: 7,
//     name: "Bacopa Monnieri",
//     description:
//       "Bilişsel fonksiyonları destekleyen, hafızayı güçlendiren ve stres seviyelerini azaltmaya yardımcı olan bir bitkisel takviyedir.",
//     price: 27.99,
//     stock: 110,
//     imageUrl: "https://via.placeholder.com/150/A0522D/FFFFFF?Text=Bacopa", // Örnek resim URL'si
//     features: [
//       "Konsantrasyon, dikkat ve hafızayı destekler.",
//       "Ruh hali dengesini desteklemeye yardımcı olur ve anksiyeteyi azaltabilir.",
//       "Öğrenme yeteneğini geliştirebilir.",
//       "Antioksidan özelliklere sahiptir.",
//     ],
//   },
//   {
//     id: 8,
//     name: "Maca Kökü",
//     description:
//       "Enerji seviyelerini artıran, hormonal dengeyi destekleyen ve libidoyu artırmaya yardımcı olan doğal bir adaptojendir.",
//     price: 21.0,
//     stock: 130,
//     imageUrl: "https://via.placeholder.com/150/D2691E/FFFFFF?Text=Maca", // Örnek resim URL'si
//     features: [
//       "Enerji seviyelerini artırmaya yardımcı olur ve fiziksel performansı destekleyebilir.",
//       "Sağlıklı bir hormonal dengeyi destekler.",
//       "Libidoyu ve cinsel fonksiyonu artırmaya yardımcı olabilir.",
//       "Ruh halini iyileştirebilir.",
//     ],
//   },
//   {
//     id: 9,
//     name: "B12 Vitamini (Metilkobalamin)",
//     description:
//       "Enerji üretimi için önemli olan, sinir sistemi sağlığını destekleyen ve kan hücrelerinin oluşumuna katkıda bulunan bir vitamindir.",
//     price: 16.5,
//     stock: 160,
//     imageUrl: "https://via.placeholder.com/150/FFA07A/FFFFFF?Text=B12", // Örnek resim URL'si
//     features: [
//       "Enerji seviyelerini artırarak yorgunluğu azaltabilir.",
//       "Yetersiz B12 vitamini alımı, kan hücrelerinin üretiminde zorluğa neden olabilir.",
//       "Sinir sistemi sağlığı için önemlidir.",
//       "DNA sentezinde rol oynar.",
//       "Bilişsel fonksiyonları destekleyebilir.",
//     ],
//   },
//   {
//     id: 10,
//     name: "Omega-3 Balık Yağı",
//     description:
//       "EPA ve DHA içeren, kalp ve beyin sağlığı için önemli olan esansiyel yağ asitleri kaynağıdır.",
//     price: 34.99,
//     stock: 80,
//     imageUrl: "https://via.placeholder.com/150/008080/FFFFFF?Text=Omega-3", // Örnek resim URL'si
//     features: [
//       "Kalp sağlığı için faydalıdır ve kalp krizi ve inme riskini azaltabilir.",
//       "Beyin sağlığı ve işlevi için önemlidir ve bilişsel işlevleri artırabilir.",
//       "İltihaplanmayı azaltmaya yardımcı olabilir.",
//       "Göz sağlığını destekleyebilir.",
//       "Ruh halini iyileştirmeye yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 11,
//     name: "Multivitamin ve Mineral Kompleks",
//     description:
//       "Günlük alınması gereken temel vitamin ve mineralleri içeren, genel sağlığı destekleyen kapsamlı bir takviyedir.",
//     price: 24.0,
//     stock: 140,
//     imageUrl:
//       "https://via.placeholder.com/150/800080/FFFFFF?Text=Multi%20Vitamin", // Örnek resim URL'si
//     features: [
//       "İhtiyaç duyduğumuz bazı vitamin ve mineralleri almayı kolaylaştırabilir.",
//       "Besin eksikliği yaşayan bireylerin diyetlerini tamamlamak için kullanılabileceği durumlar vardır.",
//       "Enerji seviyelerini destekleyebilir.",
//       "Bağışıklık sistemini destekleyebilir.",
//       "Genel sağlık ve iyi oluş halini destekler.",
//     ],
//   },
//   {
//     id: 12,
//     name: "D3 Vitamini (Kolekalsiferol)",
//     description:
//       "Kalsiyum emilimini destekleyen, kemik sağlığı için önemli olan ve bağışıklık sistemini güçlendiren bir vitamindir.",
//     price: 19.5,
//     stock: 170,
//     imageUrl: "https://via.placeholder.com/150/FF8C00/FFFFFF?Text=D%20Vitamini", // Örnek resim URL'si
//     features: [
//       "Kemiklerin güçlenmesinde ve hastalıklarının önlenmesini sağlar.",
//       "Bağışıklık sistemi sağlığı için de önemlidir ve enfeksiyon riskini azaltabilir.",
//       "Kas fonksiyonlarını destekleyebilir.",
//       "Ruh halini iyileştirmeye yardımcı olabilir.",
//       "Kalsiyum ve fosfor emilimini düzenler.",
//     ],
//   },
//   {
//     id: 13,
//     name: "Rhodiola Rosea",
//     description:
//       "Stresle başa çıkmaya yardımcı olan, enerji seviyelerini artıran ve zihinsel performansı destekleyen bir adaptojen bitkisidir.",
//     price: 26.75,
//     stock: 105,
//     imageUrl: "https://via.placeholder.com/150/B8860B/FFFFFF?Text=Rhodiola", // Örnek resim URL'si
//     features: [
//       "Stresle başa çıkmaya yardımcı olabilir ve adaptasyon yeteneğini artırır.",
//       "Fiziksel performansı artırabilir ve yorgunluğu azaltabilir.",
//       "Zihinsel performansı, odaklanmayı ve hafızayı geliştirebilir.",
//       "Ruh halini iyileştirmeye yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 14,
//     name: "Kompleks Sindirim Enzimleri",
//     description:
//       "Besinlerin daha iyi sindirilmesine yardımcı olan, şişkinlik ve gaz gibi sorunları azaltan bir enzim karışımıdır.",
//     price: 23.25,
//     stock: 115,
//     imageUrl:
//       "https://via.placeholder.com/150/6B8E23/FFFFFF?Text=Sindirim%20Enzimleri", // Örnek resim URL'si
//     features: [
//       "Besinlerin parçalanmasına ve emilimine yardımcı olur.",
//       "Yorgunluk, gaz ve şişkinlik gibi sindirim sorunlarına da yardımcı olabilir.",
//       "Besin intoleranslarının etkilerini azaltmaya yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 15,
//     name: "Ginseng (Panax Ginseng)",
//     description:
//       "Enerji seviyelerini artıran, bağışıklık sistemini güçlendiren ve zihinsel fonksiyonları iyileştiren geleneksel bir bitkisel takviyedir.",
//     price: 31.5,
//     stock: 95,
//     imageUrl: "https://via.placeholder.com/150/CD5C5C/FFFFFF?Text=Qinseng", // Örnek resim URL'si
//     features: [
//       "Bağışıklık sistemini güçlendirebilir.",
//       "Enerji seviyelerini arttırabilir ve yorgunluğu azaltabilir.",
//       "Zihinsel işlevleri iyileştirebilir, odaklanma ve hafızayı destekleyebilir.",
//       "Stresle başa çıkmaya yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 16,
//     name: "Keratin Kompleks",
//     description:
//       "Saç, cilt ve tırnak sağlığını destekleyen, güç ve parlaklık kazandıran bir protein takviyesidir.",
//     price: 28.5,
//     stock: 100,
//     imageUrl: "https://via.placeholder.com/150/F5F5DC/FFFFFF?Text=Keratin", // Örnek resim URL'si
//     features: [
//       "Saçların yumuşamasına ve parlaklık kazanmasına yardımcı olur.",
//       "Kırılma ve yıpranmaya karşı koruma sağlar.",
//       "Tırnakların güçlenmesine yardımcı olabilir.",
//       "Cilt elastikiyetini destekleyebilir.",
//     ],
//   },
//   {
//     id: 17,
//     name: "L-Teanin",
//     description:
//       "Rahatlamayı teşvik eden, stresi azaltan ve zihinsel odaklanmayı artıran bir amino asittir.",
//     price: 17.25,
//     stock: 125,
//     imageUrl: "https://via.placeholder.com/150/ADD8E6/FFFFFF?Text=L-Teanin", // Örnek resim URL'si
//     features: [
//       "Stres ve anksiyete semptomlarını hafifletmeye yardımcı olabilir.",
//       "Zihinsel performansı artırarak zihinsel odaklanmayı ve konsantrasyonu artırabilir.",
//       "Rahatlama hissini teşvik ederken uyuşukluğa neden olmaz.",
//       "Uyku kalitesini artırmaya yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 18,
//     name: "Kalsiyum Sitrat",
//     description:
//       "Kemik ve diş sağlığı için önemli olan, kas fonksiyonlarını ve sinir iletimini destekleyen bir mineral takviyesidir.",
//     price: 14.0,
//     stock: 190,
//     imageUrl: "https://via.placeholder.com/150/FAF0E6/FFFFFF?Text=Kalsiyum", // Örnek resim URL'si
//     features: [
//       "Kemik ve diş sağlığı için önemli bir mineraldir ve ayrıca kas fonksiyonları, sinir iletimi ve kan pıhtılaşması için gereklidir.",
//       "Kalsiyum eksikliği, kemik erimesi, kas zayıflığı ve diğer sağlık sorunlarına neden olabilir.",
//       "Kalp ritmini düzenlemeye yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 19,
//     name: "Kızılcık Ekstresi",
//     description:
//       "İdrar yolu sağlığını destekleyen ve antioksidan özelliklere sahip doğal bir takviyedir.",
//     price: 20.5,
//     stock: 135,
//     imageUrl:
//       "https://via.placeholder.com/150/DC143C/FFFFFF?Text=K%C4%B1z%C4%B1lc%C4%B1k", // Örnek resim URL'si
//     features: [
//       "İdrar yolu enfeksiyonlarını önlemeye katkıda bulunur.",
//       "Sindirim sistemini destekleme, cilt sağlığını iyileştirme gibi faydaları vardır.",
//       "Güçlü antioksidan özelliklere sahiptir.",
//       "Anti-inflamatuar özelliklere sahip olabilir.",
//     ],
//   },
//   {
//     id: 20,
//     name: "Kolajen Peptitleri",
//     description:
//       "Cilt elastikiyetini artıran, eklem sağlığını destekleyen ve saç ve tırnakların güçlenmesine yardımcı olan bir protein takviyesidir.",
//     price: 39.99,
//     stock: 75,
//     imageUrl: "https://via.placeholder.com/150/FFE4C4/FFFFFF?Text=Kolajen", // Örnek resim URL'si
//     features: [
//       "Cildin elastikiyetini artırabilir, kırışıklıkların azalmasına yardımcı olabilir.",
//       "Kemiklerin güçlü kalmasını sağlayabilir.",
//       "Eklem sağlığını koruyabilir ve eklem ağrılarını hafifletebilir.",
//       "Saç ve tırnakların güçlenmesine yardımcı olabilir.",
//     ],
//   },
//   {
//     id: 21,
//     name: "Çuha Çiçeği Yağı",
//     description:
//       "Cilt sağlığını destekleyen, hormonal dengeye yardımcı olan ve iltihaplanmayı azaltabilen bir yağ asidi kaynağıdır.",
//     price: 22.0,
//     stock: 110,
//     imageUrl:
//       "https://via.placeholder.com/150/98FB98/FFFFFF?Text=%C3%87uha%20%C3%A7i%C3%A7e%C4%9Fi", // Örnek resim URL'si
//     features: [
//       "Saç dökülmesini azaltabilir, saçların daha güçlü ve parlak olmasını sağlayabilir.",
//       "Cilt için nemlendirici ve besleyici bir etkiye sahiptir. Ciltteki iltihaplanma ve akne gibi sorunları azaltabilir.",
//       "Hormonal dengeyi desteklemeye yardımcı olabilir, özellikle kadınlarda PMS semptomlarını hafifletebilir.",
//     ],
//   },
//   {
//     id: 22,
//     name: "Koenzim Q10 (Ubikinon)",
//     description:
//       "Enerji üretimi için önemli olan, antioksidan özelliklere sahip ve kalp sağlığını destekleyen bir bileşiktir.",
//     price: 36.5,
//     stock: 85,
//     imageUrl: "https://via.placeholder.com/150/FF69B4/FFFFFF?Text=Q10", // Örnek resim URL'si
//     features: [
//       "Enerji seviyelerini artırabilir, yorgunluğu azaltabilir ve genel olarak enerjik hissetmenizi sağlayabilir.",
//       "Güçlü bir antioksidandır ve hücreleri serbest radikallerin zararlı etkilerinden korur.",
//       "Kalp sağlığını desteklemeye yardımcı olabilir.",
//       "Cilt sağlığını iyileştirebilir.",
//     ],
//   },
//   {
//     id: 23,
//     name: "Çinko Pikolinat",
//     description:
//       "Bağışıklık sistemini destekleyen, cilt sağlığını iyileştiren ve hücre büyümesi için önemli bir mineral takviyesidir.",
//     price: 17.75,
//     stock: 155,
//     imageUrl: "https://via.placeholder.com/150/DAA520/FFFFFF?Text=%C3%87inko", // Örnek resim URL'si
//     features: [
//       "Bağışıklık sisteminizi destekleyerek hastalıklara karşı direncinizi artırabilir.",
//       "Sağlıklı hücre büyümesi ve doku onarımını destekleyebilir.",
//       "Cilt sağlığını iyileştirmeye yardımcı olabilir.",
//       "Saç ve tırnak sağlığı için önemlidir.",
//     ],
//   },
//   {
//     id: 24,
//     name: "L-Arjinin",
//     description:
//       "Nitrik oksit üretimini destekleyen, kan akışını iyileştiren ve kas gelişimine yardımcı olan bir amino asittir.",
//     price: 29.0,
//     stock: 100,
//     imageUrl: "https://via.placeholder.com/150/87CEEB/FFFFFF?Text=L-arginin", // Örnek resim URL'si
//     features: [
//       "Nitrik oksit üretimini destekleyebilir ve dolaşım sağlığını iyileştirebilirsiniz.",
//       "Kas kütlesi ve gücünün artmasına katkıda bulunabilir.",
//       "Egzersiz performansını artırabilir.",
//       "Bağışıklık sistemini desteklemeye yardımcı olabilir.",
//     ],
//   },
// ];

// Supplement veri seti
const supplements = [
  {
    id: "65a1b2c3d4e5f6g7h8i9j0k",
    name: "Acetyl-L-Carnitine",
    description:
      "Beyin fonksiyonlarını ve enerji metabolizmasını destekleyen amino asit türevi.",
    price: 129.99,
    stock: 50,
    imageUrl: "../public/SupplementImage/Acetyl-L-Carnitine.webp",
    comments: [
      {
        id: "65a1b2c3d4e5f6g7h8i9j1l",
        userId: "65a1b2c3d4e5f6g7h8i9j9u",
        content: "Enerji seviyelerimde belirgin artış hissettim.",
        rating: 5,
      },
      {
        id: "65a1b2c3d4e5f6g7h8i9j2m",
        userId: "65a1b2c3d4e5f6g7h8i9j8i",
        content: "Konsantrasyonumu artırdığını düşünüyorum.",
        rating: 4,
      },
    ],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0n",
    name: "Aktifleştirilmiş B Vitamini",
    description: "Vücutta kolay emilebilen formda B vitamini kompleksi.",
    price: 89.99,
    stock: 75,
    imageUrl: "../public/SupplementImage/aktifleştirilmiş-b.webp",
    comments: [
      {
        id: "65a1b2c3d4e5f6g7h8i9j3o",
        userId: "65a1b2c3d4e5f6g7h8i9j7y",
        content: "Enerji seviyelerim için harika bir destek.",
        rating: 5,
      },
    ],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0p",
    name: "Ashwagandha",
    description:
      "Stres seviyelerini düşürmeye ve rahatlamaya yardımcı adaptojen bitki.",
    price: 79.99,
    stock: 60,
    imageUrl: "../public/SupplementImage/ashwagandha.webp",
    comments: [
      {
        id: "65a1b2c3d4e5f6g7h8i9j4q",
        userId: "65a1b2c3d4e5f6g7h8i9j6t",
        content: "Uyku kalitemi önemli ölçüde artırdı.",
        rating: 5,
      },
      {
        id: "65a1b2c3d4e5f6g7h8i9j5r",
        userId: "65a1b2c3d4e5f6g7h8i9j5r",
        content: "Stresle başa çıkmada gerçekten yardımcı oluyor.",
        rating: 4,
      },
    ],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0s",
    name: "B12 Vitamini",
    description: "Enerji üretimi ve sinir sistemi sağlığı için temel vitamin.",
    price: 49.99,
    stock: 100,
    imageUrl: "../public/SupplementImage/b12.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0t",
    name: "Balık Yağı",
    description:
      "Omega-3 yağ asitleri EPA ve DHA kaynağı, kalp ve beyin sağlığı için.",
    price: 119.99,
    stock: 45,
    imageUrl: "../public/SupplementImage/balik-yagi.webp",
    comments: [
      {
        id: "65a1b2c3d4e5f6g7h8i9j6u",
        userId: "65a1b2c3d4e5f6g7h8i9j4v",
        content: "Kolesterol değerlerimde iyileşme gördüm.",
        rating: 5,
      },
    ],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0w",
    name: "Bitkisel Protein",
    description:
      "Veganlar ve vejetaryenler için tam amino asit profilli bitkisel protein.",
    price: 159.99,
    stock: 30,
    imageUrl: "../public/SupplementImage/Bitkisel-Protein.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0x",
    name: "Çinko",
    description: "Bağışıklık sistemi ve cilt sağlığı için önemli mineral.",
    price: 39.99,
    stock: 85,
    imageUrl: "../public/SupplementImage/cinko.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0y",
    name: "Demir",
    description:
      "Kırmızı kan hücreleri üretimi ve enerji metabolizması için gerekli mineral.",
    price: 59.99,
    stock: 65,
    imageUrl: "../public/SupplementImage/demir.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j0z",
    name: "Günlük Temel İhtiyaçlar Demir",
    description:
      "Günlük demir ihtiyacınızı karşılamak için formüle edilmiş takviye.",
    price: 69.99,
    stock: 55,
    imageUrl: "../public/SupplementImage/günlük-temel ihtiyaclar-demir.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1a",
    name: "Kalsiyum",
    description: "Kemik ve diş sağlığı için temel mineral.",
    price: 49.99,
    stock: 70,
    imageUrl: "../public/SupplementImage/kalsiyum.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1b",
    name: "Kızılcık",
    description:
      "İdrar yolu sağlığını destekleyen antioksidan bakımından zengin meyve.",
    price: 79.99,
    stock: 40,
    imageUrl: "../public/SupplementImage/kizilcik.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1c",
    name: "Krom Maksimum",
    description: "Kan şekeri dengesini desteklemeye yardımcı eser mineral.",
    price: 59.99,
    stock: 60,
    imageUrl: "../public/SupplementImage/Krom-Maksimum.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1d",
    name: "Magnezyum",
    description: "Kas ve sinir fonksiyonları için gerekli temel mineral.",
    price: 89.99,
    stock: 50,
    imageUrl: "../public/SupplementImage/magnezyum.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1e",
    name: "Magnezyum Gece Pudrası",
    description:
      "Rahatlamaya ve uyku kalitesini artırmaya yardımcı magnezyum formülü.",
    price: 99.99,
    stock: 35,
    imageUrl: "../public/SupplementImage/Magnezyum-Gece-Pudrası.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1f",
    name: "Omega-3",
    description: "Kalp, beyin ve eklem sağlığı için temel yağ asitleri.",
    price: 109.99,
    stock: 45,
    imageUrl: "../public/SupplementImage/omega-3.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1g",
    name: "Vitamin D",
    description: "Kemik sağlığı ve bağışıklık fonksiyonu için gerekli vitamin.",
    price: 69.99,
    stock: 80,
    imageUrl: "../public/SupplementImage/vitamin-d.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1h",
    name: "Vitamin D Vegan",
    description: "Bitkisel kaynaklı D2 vitamini, veganlar için uygundur.",
    price: 79.99,
    stock: 30,
    imageUrl: "../public/SupplementImage/vitamind-vegan.webp",
    comments: [],
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j1i",
    name: "Vitamin K2",
    description:
      "Kalsiyumun doğru kullanımı ve kemik sağlığı için gerekli vitamin.",
    price: 89.99,
    stock: 40,
    imageUrl: "../public/SupplementImage/vitamin-k2.webp",
    comments: [],
  },
];

// Kullanıcı örnekleri (yorumlar için)
const users = [
  {
    id: "65a1b2c3d4e5f6g7h8i9j9u",
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j8i",
    name: "Ayşe Demir",
    email: "ayse@example.com",
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j7y",
    name: "Mehmet Kaya",
    email: "mehmet@example.com",
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j6t",
    name: "Zeynep Şahin",
    email: "zeynep@example.com",
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j5r",
    name: "Deniz Arslan",
    email: "deniz@example.com",
  },
  {
    id: "65a1b2c3d4e5f6g7h8i9j4v",
    name: "Elif Koç",
    email: "elif@example.com",
  },
];
