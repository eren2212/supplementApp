const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateSupplementCategories() {
  try {
    // Tüm supplementleri al
    const supplements = await prisma.supplement.findMany();

    console.log(`Toplam ${supplements.length} adet ürün bulundu.`);

    // Kategoriler
    const categories = [
      "BRAIN",
      "WOMEN_HEALTH",
      "MENS_HEALTH",
      "HEART",
      "SLEEP",
      "ENERGY",
    ];

    // Her ürün için rastgele bir kategori ata
    for (const supplement of supplements) {
      // Rastgele bir kategori seç
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      try {
        // Ürünü güncelle
        await prisma.supplement.update({
          where: {
            id: supplement.id,
          },
          data: {
            category: randomCategory,
          },
        });

        console.log(
          `${supplement.name} ürününe ${randomCategory} kategorisi atandı.`
        );
      } catch (updateError) {
        console.error(
          `${supplement.name} ürünü güncellenirken hata oluştu:`,
          updateError
        );
      }
    }

    console.log("Tüm ürünlerin kategorileri güncellendi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSupplementCategories();
