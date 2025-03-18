"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Card, CardContent } from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  Security,
  Inventory,
  Menu as MenuIcon,
  ChevronLeft,
  Home,
} from "@mui/icons-material";

const sidebarItems = [
  { name: "Anasayfa", href: "/admin", icon: <Dashboard /> },
  { name: "Ürünler", href: "/admin/products", icon: <Inventory /> },
  { name: "Siparişler", href: "/admin/orders", icon: <ShoppingCart /> },
  { name: "Yetkilendirme", href: "/admin/auth", icon: <Security /> },
  { name: "Siteye Dön", href: "/", icon: <Home /> },
];

const stats = [
  { label: "Toplam Sipariş", value: "120" },
  { label: "Toplam Gelir", value: "₺45.000" },
  { label: "Yeni Ürünler", value: "15" },
  { label: "Aktif Kullanıcılar", value: "300" },
];

const AdminDashboard = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-white p-4 shadow-md transition-all duration-300 flex flex-col items-center`}
      >
        <Button onClick={() => setCollapsed(!collapsed)} className="mb-4">
          {collapsed ? <MenuIcon /> : <ChevronLeft />}
        </Button>
        <nav className="mt-5 w-full">
          {sidebarItems.map(({ name, href, icon }) => (
            <Link key={href} href={href} passHref>
              <div
                className={`flex items-center p-3 rounded-lg transition-all cursor-pointer mb-2 w-full ${
                  pathname === href
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-3">{icon}</span>
                {!collapsed && <span>{name}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-semibold mb-6">Admin Paneli</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value }, index) => (
            <Card key={index} className="p-4 text-center shadow-md">
              <CardContent>
                <h3 className="text-lg font-medium text-gray-600">{label}</h3>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
