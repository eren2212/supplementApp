const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixAshwagandha() {
  try {
    // Ashwagandha ürününü bul
    const ashwagandha = await prisma.supplement.findFirst({
      where: {
        name: {
          contains: "Ashwagandha",
          mode: "insensitive",
        },
      },
    });

    if (ashwagandha) {
      // Resim adını düzelt
      await prisma.supplement.update({
        where: {
          id: ashwagandha.id,
        },
        data: {
          imageUrl: "asvaganda.webp",
        },
      });

      console.log(
        `Ashwagandha ürününün resim yolu güncellendi: ${ashwagandha.imageUrl} -> asvaganda.webp`
      );
    } else {
      console.log("Ashwagandha ürünü bulunamadı.");
    }
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAshwagandha();
