import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client"; // Prisma enum'ını import edin

declare module "next-auth" {
  interface User {
    id: string;
    role: Role; // Prisma enum'ını kullanın (eğer string değilse)
    address?: string | null; // `address` özelliğini ekleyin ve tipini belirtin
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role; // Prisma enum'ını kullanın (eğer string değilse)
    address?: string | null; // JWT'ye de `address` bilgisini eklemek isterseniz
  }
}
