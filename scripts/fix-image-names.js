const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function fixImageNames() {
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

    // Eksik resimleri düzelt
    for (const supplement of supplements) {
      // Mevcut resim adını al
      const currentImageName = supplement.imageUrl;

      // Eğer resim adı SupplementImage klasöründe yoksa, benzer bir isim ara
      if (!imageFiles.includes(currentImageName)) {
        // Ürün adını küçük harfe çevir ve boşlukları tire ile değiştir
        const normalizedName = supplement.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        // Benzer isimli dosyaları bul
        const similarFiles = imageFiles.filter(
          (file) =>
            file.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(file.toLowerCase().replace(/\.[^/.]+$/, ""))
        );

        if (similarFiles.length > 0) {
          // İlk benzer dosyayı kullan
          const newImageName = similarFiles[0];

          await prisma.supplement.update({
            where: {
              id: supplement.id,
            },
            data: {
              imageUrl: newImageName,
            },
          });

          console.log(
            `${supplement.name} ürününün resim yolu güncellendi: ${currentImageName} -> ${newImageName}`
          );
        } else {
          console.log(
            `${supplement.name} ürünü için benzer resim bulunamadı: ${currentImageName}`
          );
        }
      }
    }

    console.log("Tüm ürünlerin resim yolları güncellendi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageNames();
