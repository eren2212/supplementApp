const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixRemainingImages() {
  try {
    // Tüm supplementleri al
    const supplements = await prisma.supplement.findMany();

    console.log(`Toplam ${supplements.length} adet ürün bulundu.`);

    // Eksik resimleri düzelt
    for (const supplement of supplements) {
      // Mevcut resim adını al
      const currentImageName = supplement.imageUrl;

      // Eğer resim yolu tam yol içeriyorsa, sadece dosya adını al
      if (currentImageName.includes("/") || currentImageName.includes("\\")) {
        const fileName = currentImageName.split(/[/\\]/).pop();

        await prisma.supplement.update({
          where: {
            id: supplement.id,
          },
          data: {
            imageUrl: fileName,
          },
        });

        console.log(
          `${supplement.name} ürününün resim yolu güncellendi: ${currentImageName} -> ${fileName}`
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

fixRemainingImages();
