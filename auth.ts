import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/libs/prismadb";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "E-posta",
          type: "email",
          placeholder: "ornek@mail.com",
        },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("E-posta ve şifre gereklidir.");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.hashedPassword) {
            throw new Error("Kullanıcı bulunamadı veya şifre hatalı.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error("Geçersiz şifre.");
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.name || "Google Kullanıcısı",
              image: user.image as string,
              role: "CUSTOMER", // Varsayılan rol atanıyor
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.address = dbUser.address;
            token.name = dbUser.name; // Kullanıcının rolünü token içine ekliyoruz
          }
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.address = token.address as string | null;
        session.user.name = token.name as string;
      }
      return session;
    },
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const role = auth?.user?.role || "user";

      // Eğer giriş yapmış kullanıcı login sayfasına gitmek isterse ana sayfaya yönlendir
      if (pathname.startsWith("/auth/login") && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Admin ve doktor yetkilendirme kontrolleri

      if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/", nextUrl));
      }

      // **Sadece yetkilendirme gerektiren sayfaları kontrol et**
      const protectedRoutes = ["/admin", "/doctor"];
      const isProtectedPage = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Eğer giriş yapmamış biri korumalı bir sayfaya erişmeye çalışıyorsa login sayfasına yönlendir.
      if (isProtectedPage && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true; // **Giriş yapmamış kullanıcılar diğer sayfalara erişebilir!**
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
