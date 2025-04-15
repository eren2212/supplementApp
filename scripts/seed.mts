// scripts/seed.mts
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Veri ekleme işlemi başlıyor...");

  // Önce kullanıcıları ekleyelim
  const userData: Prisma.UserCreateInput[] = [
    {
      name: "Admin Kullanıcı",
      email: "admin@example.com",
      hashedPassword: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      address: "İstanbul, Türkiye",
      phone: "+905551234567",
    },
    {
      name: "Normal Kullanıcı",
      email: "user@example.com",
      hashedPassword: await bcrypt.hash("user123", 10),
      role: "CUSTOMER",
      address: "Ankara, Türkiye",
      phone: "+905559876543",
    },
    {
      name: "Test Kullanıcı",
      email: "test@example.com",
      hashedPassword: await bcrypt.hash("test123", 10),
      role: "CUSTOMER",
      address: "İzmir, Türkiye",
      phone: "+905557894561",
    },
  ];

  // Kullanıcıları ekleyelim
  const users = [];
  for (const data of userData) {
    const user = await prisma.user.create({
      data,
    });
    users.push(user);
    console.log(`${user.name} kullanıcısı eklendi`);
  }

  // Supplement verileri
  const supplementData: Prisma.SupplementCreateInput[] = [
    {
      name: "Acetyl-L-Carnitine",
      description:
        "Beyin fonksiyonlarını ve enerji metabolizmasını destekleyen amino asit türevi.",
      price: 129.99,
      stock: 50,
      imageUrl: "../public/SupplementImage/Acetyl-L-Carnitine.webp",
      comments: {
        create: [
          {
            userId: users[0].id,
            content: "Enerji seviyelerimde belirgin artış hissettim.",
            rating: 5,
          },
          {
            userId: users[0].id,
            content: "Konsantrasyonumu artırdığını düşünüyorum.",
            rating: 4,
          },
        ],
      },
    },
    {
      name: "Aktifleştirilmiş B Vitamini",
      description: "Vücutta kolay emilebilen formda B vitamini kompleksi.",
      price: 89.99,
      stock: 75,
      imageUrl: "../public/SupplementImage/aktifleştirilmiş-b.webp",
      comments: {
        create: [
          {
            userId: users[1].id,
            content: "Enerji seviyelerim için harika bir destek.",
            rating: 5,
          },
        ],
      },
    },
    {
      name: "Ashwagandha",
      description:
        "Stres seviyelerini düşürmeye ve rahatlamaya yardımcı adaptojen bitki.",
      price: 79.99,
      stock: 60,
      imageUrl: "../public/SupplementImage/ashwagandha.webp",
      comments: {
        create: [
          {
            userId: users[1].id,
            content: "Uyku kalitemi önemli ölçüde artırdı.",
            rating: 5,
          },
          {
            userId: users[2].id,
            content: "Stresle başa çıkmada gerçekten yardımcı oluyor.",
            rating: 4,
          },
        ],
      },
    },
    {
      name: "B12 Vitamini",
      description:
        "Enerji üretimi ve sinir sistemi sağlığı için temel vitamin.",
      price: 49.99,
      stock: 100,
      imageUrl: "../public/SupplementImage/b12.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Balık Yağı",
      description:
        "Omega-3 yağ asitleri EPA ve DHA kaynağı, kalp ve beyin sağlığı için.",
      price: 119.99,
      stock: 45,
      imageUrl: "../public/SupplementImage/balik-yagi.webp",
      comments: {
        create: [
          {
            userId: users[0].id,
            content: "Kolesterol değerlerimde iyileşme gördüm.",
            rating: 5,
          },
        ],
      },
    },
    {
      name: "Bitkisel Protein",
      description:
        "Veganlar ve vejetaryenler için tam amino asit profilli bitkisel protein.",
      price: 159.99,
      stock: 30,
      imageUrl: "../public/SupplementImage/Bitkisel-Protein.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Çinko",
      description: "Bağışıklık sistemi ve cilt sağlığı için önemli mineral.",
      price: 39.99,
      stock: 85,
      imageUrl: "../public/SupplementImage/cinko.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Demir",
      description:
        "Kırmızı kan hücreleri üretimi ve enerji metabolizması için gerekli mineral.",
      price: 59.99,
      stock: 65,
      imageUrl: "../public/SupplementImage/demir.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Günlük Temel İhtiyaçlar Demir",
      description:
        "Günlük demir ihtiyacınızı karşılamak için formüle edilmiş takviye.",
      price: 69.99,
      stock: 55,
      imageUrl: "../public/SupplementImage/günlük-temel ihtiyaclar-demir.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Kalsiyum",
      description: "Kemik ve diş sağlığı için temel mineral.",
      price: 49.99,
      stock: 70,
      imageUrl: "../public/SupplementImage/kalsiyum.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Kızılcık",
      description:
        "İdrar yolu sağlığını destekleyen antioksidan bakımından zengin meyve.",
      price: 79.99,
      stock: 40,
      imageUrl: "../public/SupplementImage/kizilcik.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Krom Maksimum",
      description: "Kan şekeri dengesini desteklemeye yardımcı eser mineral.",
      price: 59.99,
      stock: 60,
      imageUrl: "../public/SupplementImage/Krom-Maksimum.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Magnezyum",
      description: "Kas ve sinir fonksiyonları için gerekli temel mineral.",
      price: 89.99,
      stock: 50,
      imageUrl: "../public/SupplementImage/magnezyum.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Magnezyum Gece Pudrası",
      description:
        "Rahatlamaya ve uyku kalitesini artırmaya yardımcı magnezyum formülü.",
      price: 99.99,
      stock: 35,
      imageUrl: "../public/SupplementImage/Magnezyum-Gece-Pudrası.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Omega-3",
      description: "Kalp, beyin ve eklem sağlığı için temel yağ asitleri.",
      price: 109.99,
      stock: 45,
      imageUrl: "../public/SupplementImage/omega-3.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Vitamin D",
      description:
        "Kemik sağlığı ve bağışıklık fonksiyonu için gerekli vitamin.",
      price: 69.99,
      stock: 80,
      imageUrl: "../public/SupplementImage/vitamin-d.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Vitamin D Vegan",
      description: "Bitkisel kaynaklı D2 vitamini, veganlar için uygundur.",
      price: 79.99,
      stock: 30,
      imageUrl: "../public/SupplementImage/vitamind-vegan.webp",
      comments: {
        create: [],
      },
    },
    {
      name: "Vitamin K2",
      description:
        "Kalsiyumun doğru kullanımı ve kemik sağlığı için gerekli vitamin.",
      price: 89.99,
      stock: 40,
      imageUrl: "../public/SupplementImage/vitamin-k2.webp",
      comments: {
        create: [],
      },
    },
  ];

  // Supplementleri ekleyelim
  for (const data of supplementData) {
    const supplement = await prisma.supplement.create({
      data,
      include: { comments: true },
    });
    console.log(
      `${supplement.name} eklendi (${supplement.comments.length} yorum)`
    );
  }

  console.log("Veri ekleme işlemi tamamlandı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
