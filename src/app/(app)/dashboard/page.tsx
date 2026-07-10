"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, StockIn, StockOut, Order } from "@/lib/types";
import Link from "next/link";

interface DashboardStats {
  totalBarang: number;
  barangMasuk: number;
  barangKeluar: number;
  stokMenipis: number;
  totalKategori: number;
  totalNilaiStok: number;
  totalPesanan: number;
  pesananPending: number;
  totalPendapatan: number;
  totalPelanggan: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    stokMenipis: 0,
    totalKategori: 0,
    totalNilaiStok: 0,
    totalPesanan: 0,
    pesananPending: 0,
    totalPendapatan: 0,
    totalPelanggan: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentStockIn, setRecentStockIn] = useState<StockIn[]>([]);
  const [recentStockOut, setRecentStockOut] = useState<StockOut[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [
        productsRes,
        stockInTodayRes,
        stockOutTodayRes,
        categoriesRes,
        lowStockRes,
        recentInRes,
        recentOutRes,
        ordersRes,
        topData,
        customersRes,
      ] = await Promise.all([
        supabase.from("products").select("id, stok, harga"),
        supabase.from("stock_in").select("id").gte("tanggal", today).lte("tanggal", today + "T23:59:59"),
        supabase.from("stock_out").select("id").gte("tanggal", today).lte("tanggal", today + "T23:59:59"),
        supabase.from("categories").select("id"),
        supabase.from("products").select("*").lte("stok", 5).order("stok", { ascending: true }).limit(5),
        supabase.from("stock_in").select("*, products(nama_barang, kode_barang)").order("created_at", { ascending: false }).limit(5),
        supabase.from("stock_out").select("*, products(nama_barang, kode_barang)").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("*, customers(nama)").order("created_at", { ascending: false }).limit(5),
        supabase.from("products").select("*, categories(nama)").order("stok", { ascending: false }).limit(5),
        supabase.from("customers").select("id"),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const totalBarang = products.length;
      const stokMenipis = products.filter((p) => p.stok <= 5).length;
      const totalNilaiStok = products.reduce((acc, p) => acc + (p.harga || 0) * (p.stok || 0), 0);
      const totalPendapatan = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((acc, o) => acc + (o.total || 0), 0);
      const pesananPending = orders.filter((o) => o.status === "pending").length;

      setStats({
        totalBarang,
        barangMasuk: stockInTodayRes.data?.length || 0,
        barangKeluar: stockOutTodayRes.data?.length || 0,
        stokMenipis,
        totalKategori: categoriesRes.data?.length || 0,
        totalNilaiStok,
        totalPesanan: orders.length,
        pesananPending,
        totalPendapatan,
        totalPelanggan: customersRes.data?.length || 0,
      });

      setLowStockProducts(lowStockRes.data || []);
      setRecentStockIn(recentInRes.data || []);
      setRecentStockOut(recentOutRes.data || []);
      setRecentOrders(orders);
      setTopProducts(topData || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const statCards = [
    { title: "Total Barang", value: stats.totalBarang, icon: "📦", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { title: "Masuk Hari Ini", value: stats.barangMasuk, icon: "📥", bgColor: "bg-green-50", textColor: "text-green-600" },
    { title: "Keluar Hari Ini", value: stats.barangKeluar, icon: "📤", bgColor: "bg-orange-50", textColor: "text-orange-600" },
    { title: "Stok Menipis", value: stats.stokMenipis, icon: "⚠️", bgColor: "bg-red-50", textColor: "text-red-600" },
    { title: "Total Pelanggan", value: stats.totalPelanggan, icon: "👥", bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { title: "Pesanan Pending", value: stats.pesananPending, icon: "🛒", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
  ];

  const quickActions = [
    { label: "Pesanan Baru", href: "/orders", icon: "🛒", color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "Barang Masuk", href: "/stock-in", icon: "📥", color: "bg-green-600 hover:bg-green-700" },
    { label: "Barang Keluar", href: "/stock-out", icon: "📤", color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Laporan", href: "/reports", icon: "📊", color: "bg-purple-600 hover:bg-purple-700" },
  ];

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
    processing: { label: "Diproses", color: "bg-indigo-100 text-indigo-700" },
    shipped: { label: "Dikirim", color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Selesai", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat dashboard...</span>
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
          <p className="text-sm text-gray-500 mt-1">Selamat datang di Invora</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">Total Pendapatan</p>
            <p className="text-3xl font-bold mt-1">Rp {stats.totalPendapatan.toLocaleString("id-ID")}</p>
            <p className="text-blue-100 text-sm mt-1">{stats.totalPesanan} pesanan total</p>
          </div>
          <Link
            href="/reports"
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-center"
          >
            Lihat Laporan →
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`${card.bgColor} ${card.textColor} p-2 rounded-lg text-xl`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{card.title}</p>
                <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
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
            <Link key={action.href} href={action.href} className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors`}>
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pesanan Terakhir</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada pesanan</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusConfig = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono font-medium text-blue-600">{order.kode_pesanan}</p>
                      <p className="text-sm text-gray-500">{order.customers?.nama || "Umum"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {order.total.toLocaleString("id-ID")}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.color}`}>{statusConfig.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stok Menipis</h2>
            <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl">✅</span>
              <p className="mt-2">Semua stok aman</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Stok</h2>
            <Link href="/inventory" className="text-sm text-blue-600 hover:text-blue-700">Inventaris</Link>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                }`}>{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.nama_barang}</p>
                </div>
                <span className="text-sm font-medium text-blue-600">{product.stok}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock In */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Masuk Terakhir</h2>
            <Link href="/stock-in" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          {recentStockIn.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada data</div>
          ) : (
            <div className="space-y-2">
              {recentStockIn.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.products?.nama_barang}</p>
                    <p className="text-xs text-gray-500">{item.supplier}</p>
                  </div>
                  <span className="text-green-600 font-medium ml-2">+{item.jumlah}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Stock Out */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Keluar Terakhir</h2>
            <Link href="/stock-out" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          {recentStockOut.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada data</div>
          ) : (
            <div className="space-y-2">
              {recentStockOut.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.products?.nama_barang}</p>
                    <p className="text-xs text-gray-500">{item.penerima}</p>
                  </div>
                  <span className="text-orange-600 font-medium ml-2">-{item.jumlah}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
