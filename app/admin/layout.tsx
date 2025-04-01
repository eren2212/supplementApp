import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Montserrat,
} from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";

// Font konfigürasyonları
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxury Admin Panel",
  description: "Premium Yönetim Paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <main className="min-h-screen bg-gray-50">
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              className: "font-montserrat text-sm",
            }}
          />
        </main>
      </body>
    </html>
  );
}
