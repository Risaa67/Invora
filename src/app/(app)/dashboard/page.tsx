"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, StockIn, StockOut } from "@/lib/types";
import Link from "next/link";

interface DashboardStats {
  totalBarang: number;
  barangMasuk: number;
  barangKeluar: number;
  stokMenipis: number;
  totalKategori: number;
  totalNilaiStok: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    stokMenipis: 0,
    totalKategori: 0,
    totalNilaiStok: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentStockIn, setRecentStockIn] = useState<StockIn[]>([]);
  const [recentStockOut, setRecentStockOut] = useState<StockOut[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const [
        productsRes,
        stockInTodayRes,
        stockOutTodayRes,
        categoriesRes,
        lowStockRes,
        recentInRes,
        recentOutRes,
      ] = await Promise.all([
        supabase.from("products").select("id, stok, harga"),
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
        supabase
          .from("products")
          .select("*")
          .lte("stok", 5)
          .order("stok", { ascending: true })
          .limit(5),
        supabase
          .from("stock_in")
          .select("*, products(nama_barang, kode_barang)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("stock_out")
          .select("*, products(nama_barang, kode_barang)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const products = productsRes.data || [];
      const totalBarang = products.length;
      const stokMenipis = products.filter((p) => p.stok <= 5).length;
      const totalNilaiStok = products.reduce(
        (acc, p) => acc + (p.harga || 0) * (p.stok || 0),
        0
      );

      setStats({
        totalBarang,
        barangMasuk: stockInTodayRes.data?.length || 0,
        barangKeluar: stockOutTodayRes.data?.length || 0,
        stokMenipis,
        totalKategori: categoriesRes.data?.length || 0,
        totalNilaiStok,
      });

      setLowStockProducts(lowStockRes.data || []);
      setRecentStockIn(recentInRes.data || []);
      setRecentStockOut(recentOutRes.data || []);

      // Top products by stock
      const { data: topData } = await supabase
        .from("products")
        .select("*, categories(nama)")
        .order("stok", { ascending: false })
        .limit(5);
      setTopProducts(topData || []);

      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const statCards = [
    {
      title: "Total Barang",
      value: stats.totalBarang,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Barang Masuk Hari Ini",
      value: stats.barangMasuk,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Barang Keluar Hari Ini",
      value: stats.barangKeluar,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Stok Menipis",
      value: stats.stokMenipis,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      title: "Total Kategori",
      value: stats.totalKategori,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Nilai Total Stok",
      value: `Rp ${stats.totalNilaiStok.toLocaleString("id-ID")}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ];

  const quickActions = [
    { label: "Tambah Barang", href: "/products", icon: "📦", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Barang Masuk", href: "/stock-in", icon: "📥", color: "bg-green-600 hover:bg-green-700" },
    { label: "Barang Keluar", href: "/stock-out", icon: "📤", color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Lihat Laporan", href: "/reports", icon: "📋", color: "bg-purple-600 hover:bg-purple-700" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selamat datang di Invora - Sistem Manajemen Stok Barang
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`${card.bgColor} ${card.textColor} p-2 rounded-lg`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{card.title}</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Stok Menipis
            </h2>
            <Link
              href="/products"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Semua stok aman
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.nama_barang}</p>
                    <p className="text-xs text-gray-500">{product.kode_barang}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {product.stok} tersisa
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-blue-500">📦</span> Stok Terbanyak
            </h2>
            <Link
              href="/products"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada data</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.nama_barang}</p>
                    <p className="text-xs text-gray-500">{product.categories?.nama || "-"}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {product.stok}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock In */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-green-500">📥</span> Barang Masuk Terakhir
            </h2>
            <Link
              href="/stock-in"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>
          {recentStockIn.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada transaksi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-600">Barang</th>
                    <th className="text-right py-2 font-medium text-gray-600">Jumlah</th>
                    <th className="text-left py-2 font-medium text-gray-600">Supplier</th>
                    <th className="text-left py-2 font-medium text-gray-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockIn.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2">
                        <p className="font-medium">{item.products?.nama_barang}</p>
                        <p className="text-xs text-gray-500">{item.products?.kode_barang}</p>
                      </td>
                      <td className="py-2 text-right text-green-600 font-medium">+{item.jumlah}</td>
                      <td className="py-2 text-gray-600">{item.supplier}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Stock Out */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-orange-500">📤</span> Barang Keluar Terakhir
            </h2>
            <Link
              href="/stock-out"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Lihat Semua
            </Link>
          </div>
          {recentStockOut.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada transaksi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-600">Barang</th>
                    <th className="text-right py-2 font-medium text-gray-600">Jumlah</th>
                    <th className="text-left py-2 font-medium text-gray-600">Penerima</th>
                    <th className="text-left py-2 font-medium text-gray-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockOut.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2">
                        <p className="font-medium">{item.products?.nama_barang}</p>
                        <p className="text-xs text-gray-500">{item.products?.kode_barang}</p>
                      </td>
                      <td className="py-2 text-right text-orange-600 font-medium">-{item.jumlah}</td>
                      <td className="py-2 text-gray-600">{item.penerima}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
