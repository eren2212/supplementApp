import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    address?: string | null;
    provider?: string;
    joinDate?: string; // Düzeltildi: `String?` yerine `string | null | undefined`
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    address?: string | null;
    provider?: string;
    joinDate?: string; // JWT token'ında da aynı tip
  }
}
