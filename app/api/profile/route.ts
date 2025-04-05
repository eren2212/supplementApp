import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb"; // Prisma Client'ı import ediyoruz

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
          return res.status(400).json({ message: "Geçersiz kullanıcı ID'si" });
        }

        const profile = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, image: true, address: true },
        });

        if (!profile) {
          return res.status(404).json({ message: "Profil bulunamadı" });
        }

        res.status(200).json(profile);
      } catch (error) {
        console.error("Profil getirilirken hata oluştu:", error);
        res.status(500).json({ message: "Profil getirilemedi" });
      }
      break;
    case "PUT":
      try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
          return res.status(400).json({ message: "Geçersiz kullanıcı ID'si" });
        }

        const { name, address, image } = req.body;

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { name, address, image },
          select: { id: true, name: true, image: true, address: true },
        });

        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Profil güncellenirken hata oluştu:", error);
        res.status(500).json({ message: "Profil güncellenemedi" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
