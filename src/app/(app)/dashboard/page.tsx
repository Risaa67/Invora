"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    stokMenipis: 0,
    totalKategori: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [products, stockIn, stockOut, categories] = await Promise.all([
        supabase.from("products").select("id, stok"),
        supabase
          .from("stock_in")
          .select("id")
          .gte("tanggal", today)
          .lte("tanggal", today + "T23:59:59"),
        supabase
          .from("stock_out")
          .select("id")
          .gte("tanggal", today)
          .lte("tanggal", today + "T23:59:59"),
        supabase.from("categories").select("id"),
      ]);

      const totalBarang = products.data?.length || 0;
      const stokMenipis =
        products.data?.filter((p) => p.stok <= 5).length || 0;

      setStats({
        totalBarang,
        barangMasuk: stockIn.data?.length || 0,
        barangKeluar: stockOut.data?.length || 0,
        stokMenipis,
        totalKategori: categories.data?.length || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  const cards = [
    {
      title: "Total Barang",
      value: stats.totalBarang,
      icon: "📦",
      color: "bg-blue-500",
    },
    {
      title: "Barang Masuk Hari Ini",
      value: stats.barangMasuk,
      icon: "📥",
      color: "bg-green-500",
    },
    {
      title: "Barang Keluar Hari Ini",
      value: stats.barangKeluar,
      icon: "📤",
      color: "bg-orange-500",
    },
    {
      title: "Stok Menipis",
      value: stats.stokMenipis,
      icon: "⚠️",
      color: "bg-red-500",
    },
    {
      title: "Total Kategori",
      value: stats.totalKategori,
      icon: "🏷️",
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
              </div>
              <div
                className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
