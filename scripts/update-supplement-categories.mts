import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

async function updateSupplementCategories() {
  try {
    // Tüm supplementleri al
    const supplements = await prisma.supplement.findMany();

    console.log(`Toplam ${supplements.length} adet ürün bulundu.`);

    // Her ürün için rastgele bir kategori ata
    for (const supplement of supplements) {
      // Rastgele bir kategori seç
      const categories = Object.values(Category);
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

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
    }

    console.log("Tüm ürünlerin kategorileri güncellendi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSupplementCategories();
