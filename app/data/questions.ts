import { IQuestions } from "@/types/questionType";

export interface ISurveyQuestions {
  category: string;
  questions: IQuestions[];
}

const surveyQuestions: ISurveyQuestions[] = [
  {
    category: "common",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Haftada kaç kere et veya bakliyat yiyorsunuz?",
        options: ["Asla", "Haftada 1-2 kez", "Haftada 3 üstü"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "asla",
            supplement: "B12 Vitamini",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Haftada kaç kere balık yiyorsunuz?",
        options: ["Asla", "Haftada 1-2 kez", "Haftada 3 üstü"],
        questionNumber: 2,

        answer: "",
        suggestible_supplement: [
          {
            option: "asla",
            supplement: "Omega-3",
          },
          {
            option: "asla",
            supplement: "Balık Yağı",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 3,
        question: "Haftada kaç porsiyon sebze-meyve yiyorsunuz?",
        options: ["Asla", "Haftada 1-2 kez", "Haftada 3 üstü"],
        questionNumber: 3,
        answer: "",
        suggestible_supplement: [
          {
            option: "asla",
            supplement: "Aktifleştirilmiş B Vitamini",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 4,
        question: "Kilonuzla ilgili endişeleriniz var mı?",
        options: [
          "Kilo vermek istiyorum",
          "Kilo almak istiyorum",
          "Fit bir görünüme sahip olmak istiyorum",
          "Şuan ki kilomdan memnunum",
        ],
        questionNumber: 4,
        answer: "",
        showOnAdminDashboard: true,
      },
      {
        type: "single choice",
        id: 5,
        question: "Ne sıklıkla egzersiz yaparsınız?",
        options: ["Asla", "Haftada 1-2 kez", "Haftada 3-5 kez"],
        questionNumber: 5,
        answer: "",
        showOnAdminDashboard: false,
      },

      {
        type: "single choice",
        id: 6,
        question:
          "Her gün en az 20-30 dakika doğrudan güneş ışığına maruz kalıyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 6,
        answer: "",
        suggestible_supplement: [
          {
            option: "Hayır",
            supplement: "Vitamin D",
          },
          {
            option: "Hayır",
            supplement: "Vitamin D Vegan",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 7,
        question: "Bu özel diyetlerden herhangi birini takip ediyor musunuz?",
        options: ["Vejeteryan", "Paleo", "Vegan", "Katojenik", "Hiçbiri"],
        questionNumber: 7,
        answer: "",
        showOnAdminDashboard: true,
      },
      {
        type: "multiple choice",
        id: 8,
        question:
          "Herhangi bir alerjiniz var mı? (Birden fazla seçebilirsiniz.)",
        options: [
          "Badem",
          "Süt Ürünleri",
          "Yumurta",
          "Balık",
          "Deniz Ürünleri",
          "Fındık",
          "Yer Fıstığı",
          "Soya Fasulyesi",
          "Buğday",
          "Gluten",
          "Hiçbiri",
        ],
        questionNumber: 8,
        answer: "",
        showOnAdminDashboard: true,
      },
      {
        type: "multiple choice",
        id: 9,
        question:
          "Şu anda herhangi bir ilaç kullanıyor musunuz? (Birden fazla seçebilirsiniz.)",
        options: [
          "Tiroid",
          "Kolestrol Düşürücü",
          "Eklem Ağrısı Giderici",
          "Kardiyovasküler İlaç",
          "Diüretikler",
          "Antikoagülanlar",
          "Diyabet İlaçları",
          "Kortizol ve Bağışıklık Bastırıcı İlaçlar",
          "Uyku ve Sakinleştirici İlaçlar",
          "Ağrı Kesici",
          "Doğum Kontrol Hapı",
          "Antidepresan",

          "Hiçbiri",
        ],
        questionNumber: 9,
        answer: "",
        showOnAdminDashboard: true,
      },
      {
        type: "single choice",
        id: 10,
        question: "Şu anda uyku kalitenizi nasıl değerlendirirsiniz?",
        options: ["Berbat", "İdare eder", "Mükemmel"],
        questionNumber: 10,
        answer: "",
        suggestible_supplement: [
          {
            option: "Berbat",
            supplement: "Magnezyum Gece Pudrası",
          },
          {
            option: "Idare eder",
            supplement: "Magnezyum Gece Pudrası",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 11,
        question: "Aşağıdaki ifadelerden hangisi sizin için en uygundur?",
        options: [
          "Uykuya dalmakta güçlük çekiyorum",
          "Uyanmakta güçlük çekiyorum",
          "Hiçbiri",
        ],
        questionNumber: 11,
        answer: "",
        suggestible_supplement: [
          {
            option: "Uykuya dalmakta",
            supplement: "Magnezyum Gece Pudrası",
          },
          {
            option: "Uyanmakta",
            supplement: "Magnezyum",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 12,
        question: "Enerji seviyenizi nasil tanımlarsınız?",
        options: [
          "Normal Hissediyorum",
          "Bir süredir yorgun hissediyorum",
          "Aşırı enerjiğim",
        ],
        questionNumber: 12,
        answer: "",
        suggestible_supplement: [
          {
            option: "yorgun",
            supplement: "Acetyl-L-Carnitine",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 13,
        question:
          "Günün hangi saatinde kendinizi yorgun hissetmeye başlarsınız?",
        options: ["Sabah", "Öğleden sonra", "Tüm gün boyunca", "Hiçbiri"],
        questionNumber: 13,
        answer: "",

        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 14,
        question: "Yemekten sonra sık sık uykunuz geliyor mu?",
        options: ["Evet", "Hayır"],
        questionNumber: 14,
        answer: "",

        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 15,
        question: "Saçlarınızda incelme veya dökülme problemi var mı?",
        options: ["Hayır ama önleyici bakımla ilgileniyorum", "Evet", "Hayır"],
        questionNumber: 15,
        answer: "",
        suggestible_supplement: [
          {
            option: "önleyici",
            supplement: "Bitkisel Protein",
          },
          {
            option: "evet",
            supplement: "Bitkisel Protein",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 16,
        question: "Saç yapınızı nasıl tanımlarsınız?",
        options: ["Yumuşak ve ipeksi", "Kuru ve hasarlı", "Arasında bir yerde"],
        questionNumber: 16,
        answer: "",

        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 17,
        question:
          "Günde 4 saatten fazla ekran karşısında vakit geçiriyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 17,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 18,
        question: "Sizde veya ailenizde göz hastalığı olan var mı?",
        options: ["Evet", "Hayır"],
        questionNumber: 18,
        answer: "",

        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 19,
        question: "Göz kuruluğu yaşıyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 19,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 20,
        question: "Aşağıdakilerden herhangi biri sizin için geçerli mi?",
        options: [
          "Emziriyorum",
          "Hamileyim",
          "Hamile kalmak istiyorum",
          "Menopoza giriyorum",
          "Menapoz sonrasıyım",
          "Hiçbiri",
        ],
        questionNumber: 20,
        answer: "",
        showOnAdminDashboard: true,
      },
      {
        type: "single choice",
        id: 21,
        question: "Stres seviyenizi nasıl tanımlarsınız?",
        options: [
          "Sürekli stres halindeyim",
          "Ara sıra strese giriyorum",
          "Normal hissediyorum",
        ],
        questionNumber: 21,
        answer: "",
        suggestible_supplement: [
          {
            option: "Sürekli",
            supplement: "Ashwagandha",
          },
          {
            option: "Ara sıra",
            supplement: "Ashwagandha",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 22,
        question: "Rahatlamakta zorlanıyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 22,
        answer: "",
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 23,
        question: "Hangisi stres durumundayken en öncelikli başınıza gelir?",
        options: [
          "Yorgun hissetmek",
          "Sürekli Kaygı",
          "Kompusif İstek (Şeker İsteği)",
          "Hiçbiri",
        ],
        questionNumber: 23,
        answer: "",
        suggestible_supplement: [
          {
            option: "Kaygı",
            supplement: "Ashwagandha",
          },
          {
            option: "Yorgun",
            supplement: "Magnezyum",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "aim",
        id: 24,
        question: "Birincil sağlık hedefinizi seçiniz ",
        options: [
          "Sindirim",
          "Bağışıklık ",
          "Beyin",
          "Eklem Sağlığı",
          "Deri",
          "Kalp",
          "Kadın sağlığı",
          "Erkek sağlığı",
        ],
        questionNumber: 24,
        answer: "",
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "uyku",
    questions: [],
  },
  {
    category: "stres",
    questions: [],
  },
  {
    category: "sindirim",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Sindirim problemleriniz nasıl ortaya çıkıyor?",
        options: [
          "Mide yanması, yanma hissi, aşırı tokluk hissi",
          "Şişkinlik, ağrı, şişlik",
          "Kabızlık, ishal, gaz",
        ],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Mide yanması",
            supplement: "Sindirim Enzimleri",
          },
          {
            option: "Şişkinlik",
            supplement: "Probiyotik",
          },
          {
            option: "Kabızlık",
            supplement: "Probiyotik",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Tuvalete gitme sıklığınız nedir?",
        options: ["Az", "Normal", "Çok sık"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "Çok sık",
            supplement: "Probiyotik",
          },
          {
            option: "Az",
            supplement: "Probiyotik",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "bağışıklık",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Sık sık hastalanır mısınız?",
        options: ["Evet", "Hayır"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Vitamin D",
          },
          {
            option: "Evet",
            supplement: "Çinko",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Son zamanlarda kendinizi yorgun veya halsiz hissettiniz mi?",
        options: ["Evet", "Hayır"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "B12 Vitamini",
          },
          {
            option: "Evet",
            supplement: "Demir",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "enerji",
    questions: [],
  },
  {
    category: "deri",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Belirli bir cilt probleminiz var mı?",
        options: [
          "Kuru Cilt",
          "Lekeler (Akne vb)",
          "Yaşlanan cilt (kırışıklıklar vb)",
        ],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "kuru",
            supplement: "Omega-3",
          },
          {
            option: "yaşlanan",
            supplement: "Vitamin K2",
          },
          {
            option: "lekeler",
            supplement: "Çinko",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Cildinizi genel olarak nasıl hissediyorsunuz?",
        options: [
          "Kuru",
          "Yağlı",
          "Düzensiz (Kızarıklık veya Şişkinlikler)",
          "Oldukça iyi",
        ],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "kuru",
            supplement: "Omega-3",
          },
          {
            option: "yağlı",
            supplement: "Çinko",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "saç",
    questions: [],
  },
  {
    category: "beyin",
    questions: [
      {
        type: "single choice",
        id: 1,
        question:
          "Bazen odaklanma veya konsantre olma konusunda sorun yaşıyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Ashwagandha",
          },
          {
            option: "Evet",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Kısa süreli hafıza problemleriniz var mı?",
        options: ["Evet", "Hayır"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Omega-3",
          },
          {
            option: "Evet",
            supplement: "Acetyl-L-Carnitine",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "göz",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Göz yorgunluğu yaşıyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Ekran karşısında günde kaç saat geçiriyorsunuz?",
        options: ["0-2 saat", "3-5 saat", "6+ saat"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "6+",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "eklem",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Eklem ağrısı çekiyor musunuz?",
        options: ["Evet", "Hayır"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Kalsiyum",
          },
          {
            option: "Evet",
            supplement: "Vitamin K2",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question:
          "Sizde veya ailenizde herhangi birinin eklem veya kemik hastalığı geçmişi var mı?",
        options: ["Evet", "Hayır"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Kalsiyum",
          },
          {
            option: "Evet",
            supplement: "Vitamin D",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 3,
        question: "Mevcut durumunuzu nasıl tanımlarsınız?",
        options: [
          "Çoğu gün ağrılı uyanırım",
          "Bazen ağrılığı uyanırım",
          "Egzersiz veya artan hareketten sonra kendimi ağrılı hissediyorum",
          "Hiçbiri",
        ],
        questionNumber: 3,
        answer: "",
        suggestible_supplement: [
          {
            option: "ağrılı",
            supplement: "Magnezyum",
          },
          {
            option: "ağrılı",
            supplement: "Vitamin K2",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "kalp",
    questions: [
      {
        type: "single choice",
        id: 1,
        question:
          "Sizde veya ailenizde herhangi birinin kalp problemi geçmişi var mı?",
        options: ["Evet", "Hayır"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "Evet",
            supplement: "Omega-3",
          },
          {
            option: "Evet",
            supplement: "Balık Yağı",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Bu ifadelerden herhangi biri sizin için geçerli mi?",
        options: [
          "Kolestrolüm yüksek",
          "Yüksek tansiyonum var",
          "Dolaşım bozukluğum var",
          "Hiçbiri",
        ],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "yüksek",
            supplement: "Omega-3",
          },
          {
            option: "dolaşım",
            supplement: "Omega-3",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "erkek sağlığı",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Cinsel probleminiz var mı ?",
        options: ["Azalmış Libido", "Sertleşme bozukluğu", "Hiçbiri"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "azalmış",
            supplement: "Acetyl-L-Carnitine",
          },
          {
            option: "sertleşme",
            supplement: "Vitamin K2",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question:
          "Aşağıdakilerden herhangi biriyle ilgili destek mi arıyorsunuz ?",
        options: ["Uyarılma", "Orgazm", "Hiçbiri"],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "uyarılma",
            supplement: "Ashwagandha",
          },
          {
            option: "orgazm",
            supplement: "Ashwagandha",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
  {
    category: "kadın sağlığı",
    questions: [
      {
        type: "single choice",
        id: 1,
        question: "Hiç idrar sorunlarınız oldu mu ?",
        options: ["Asla", "Bazen", "Sıklıkla"],
        questionNumber: 1,
        answer: "",
        suggestible_supplement: [
          {
            option: "bazen",
            supplement: "Kızılcık",
          },
          {
            option: "sıklıkla",
            supplement: "Kızılcık",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 2,
        question: "Ayda kaç kere adet oluyorsunuz ?",
        options: [
          "Ayda birden fazla",
          "Her ay",
          "Ayda birden az",
          "Adet görmüyorum",
        ],
        questionNumber: 2,
        answer: "",
        suggestible_supplement: [
          {
            option: "fazla",
            supplement: "Demir",
          },
          {
            option: "birden az",
            supplement: "Vitamin D",
          },
        ],
        showOnAdminDashboard: false,
      },
      {
        type: "single choice",
        id: 3,
        question: "Cinsel probleminiz var mı ?",
        options: ["Azalmış Libido", "Doğurganlık", "Hiçbiri"],
        questionNumber: 3,
        answer: "",
        suggestible_supplement: [
          {
            option: "azalmış",
            supplement: "Ashwagandha",
          },
          {
            option: "Doğurganlık",
            supplement: "Vitamin D",
          },
        ],
        showOnAdminDashboard: false,
      },
    ],
  },
];

export default surveyQuestions;
