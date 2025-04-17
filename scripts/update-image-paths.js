const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function updateImagePaths() {
  try {
    // Tüm supplementleri al
    const supplements = await prisma.supplement.findMany();

    console.log(`Toplam ${supplements.length} adet ürün bulundu.`);

    // SupplementImage klasöründeki dosyaları al
    const imageDir = path.join(process.cwd(), "public", "SupplementImage");
    const imageFiles = fs.readdirSync(imageDir);

    console.log(
      `SupplementImage klasöründe ${imageFiles.length} adet resim bulundu.`
    );

    // Her ürün için resim yolunu güncelle
    for (const supplement of supplements) {
      // Mevcut resim adını al
      const currentImageName = supplement.imageUrl.split("/").pop();

      // Eğer resim adı SupplementImage klasöründe varsa, yolu güncelle
      if (imageFiles.includes(currentImageName)) {
        await prisma.supplement.update({
          where: {
            id: supplement.id,
          },
          data: {
            imageUrl: currentImageName,
          },
        });

        console.log(
          `${supplement.name} ürününün resim yolu güncellendi: ${currentImageName}`
        );
      } else {
        console.log(
          `${supplement.name} ürünü için resim bulunamadı: ${currentImageName}`
        );
      }
    }

    console.log("Tüm ürünlerin resim yolları güncellendi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImagePaths();
