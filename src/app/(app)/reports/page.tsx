"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, StockIn, StockOut, Order } from "@/lib/types";

type TabType = "overview" | "products" | "stock-in" | "stock-out" | "orders";

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockIn, setStockIn] = useState<StockIn[]>([]);
  const [stockOut, setStockOut] = useState<StockOut[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, stockInRes, stockOutRes, ordersRes] = await Promise.all([
      supabase.from("products").select("*, categories(nama)").order("nama_barang"),
      supabase.from("stock_in").select("*, products(nama_barang, kode_barang)").order("tanggal", { ascending: false }),
      supabase.from("stock_out").select("*, products(nama_barang, kode_barang)").order("tanggal", { ascending: false }),
      supabase.from("orders").select("*, customers(nama), order_items(*, products(nama_barang))").order("created_at", { ascending: false }),
    ]);

    setProducts(productsRes.data || []);
    setStockIn(stockInRes.data || []);
    setStockOut(stockOutRes.data || []);
    setOrders(ordersRes.data || []);
    setLoading(false);
  };

  // Filter by date
  const filteredStockIn = stockIn.filter((item) => {
    if (!dateRange.start && !dateRange.end) return true;
    const date = item.tanggal;
    if (dateRange.start && date < dateRange.start) return false;
    if (dateRange.end && date > dateRange.end) return false;
    return true;
  });

  const filteredStockOut = stockOut.filter((item) => {
    if (!dateRange.start && !dateRange.end) return true;
    const date = item.tanggal;
    if (dateRange.start && date < dateRange.start) return false;
    if (dateRange.end && date > dateRange.end) return false;
    return true;
  });

  const filteredOrders = orders.filter((order) => {
    if (!dateRange.start && !dateRange.end) return true;
    const date = order.tanggal;
    if (dateRange.start && date < dateRange.start) return false;
    if (dateRange.end && date > dateRange.end) return false;
    return true;
  });

  // Stats
  const totalNilaiStok = products.reduce((acc, p) => acc + p.harga * p.stok, 0);
  const totalMasuk = filteredStockIn.reduce((acc, s) => acc + s.jumlah, 0);
  const totalKeluar = filteredStockOut.reduce((acc, s) => acc + s.jumlah, 0);
  const totalPendapatan = filteredOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);
  const totalPesanan = filteredOrders.length;
  const pesananSelesai = filteredOrders.filter((o) => o.status === "delivered").length;

  // Top products by value
  const topProductsByValue = [...products]
    .sort((a, b) => b.harga * b.stok - a.harga * a.stok)
    .slice(0, 5);

  // Category breakdown
  const categoryStats = products.reduce(
    (acc, p) => {
      const catName = p.categories?.nama || "Tanpa Kategori";
      if (!acc[catName]) acc[catName] = { count: 0, value: 0, stock: 0 };
      acc[catName].count++;
      acc[catName].value += p.harga * p.stok;
      acc[catName].stock += p.stok;
      return acc;
    },
    {} as Record<string, { count: number; value: number; stock: number }>
  );

  const exportCSV = (data: Record<string, string | number>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => row[h]).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportProducts = () => {
    exportCSV(
      products.map((p) => ({
        Kode: p.kode_barang,
        Nama: p.nama_barang,
        Kategori: p.categories?.nama || "-",
        Satuan: p.satuan,
        Harga: p.harga,
        Stok: p.stok,
        Nilai: p.harga * p.stok,
      })),
      "laporan_produk"
    );
  };

  const exportStockIn = () => {
    exportCSV(
      filteredStockIn.map((s) => ({
        Tanggal: s.tanggal,
        Kode: s.products?.kode_barang || "-",
        Barang: s.products?.nama_barang || "-",
        Jumlah: s.jumlah,
        Supplier: s.supplier,
      })),
      "laporan_barang_masuk"
    );
  };

  const exportStockOut = () => {
    exportCSV(
      filteredStockOut.map((s) => ({
        Tanggal: s.tanggal,
        Kode: s.products?.kode_barang || "-",
        Barang: s.products?.nama_barang || "-",
        Jumlah: s.jumlah,
        Penerima: s.penerima,
      })),
      "laporan_barang_keluar"
    );
  };

  const exportOrders = () => {
    exportCSV(
      filteredOrders.map((o) => ({
        Kode: o.kode_pesanan,
        Pelanggan: o.customers?.nama || "Umum",
        Tanggal: o.tanggal,
        Status: o.status,
        Subtotal: o.subtotal,
        Diskon: o.diskon,
        Total: o.total,
      })),
      "laporan_pesanan"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat laporan...</span>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; color: string }[] = [
    { id: "overview", label: "Overview", color: "blue" },
    { id: "products", label: "Produk", color: "purple" },
    { id: "stock-in", label: "Barang Masuk", color: "green" },
    { id: "stock-out", label: "Barang Keluar", color: "orange" },
    { id: "orders", label: "Pesanan", color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Analisis data stok dan penjualan</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: "", end: "" })}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Produk</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Masuk</p>
                  <p className="text-2xl font-bold text-green-600">{totalMasuk}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Keluar</p>
                  <p className="text-2xl font-bold text-orange-600">{totalKeluar}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
              <p className="text-blue-100 text-sm">Nilai Inventaris</p>
              <p className="text-2xl font-bold mt-1">Rp {totalNilaiStok.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Pesanan</p>
              <p className="text-3xl font-bold text-gray-900">{totalPesanan}</p>
              <p className="text-sm text-green-600 mt-1">{pesananSelesai} selesai</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Pesanan Aktif</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalPesanan - pesananSelesai - filteredOrders.filter((o) => o.status === "cancelled").length}
              </p>
              <p className="text-sm text-gray-500 mt-1">dalam proses</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-white">
              <p className="text-green-100 text-sm">Total Pendapatan</p>
              <p className="text-3xl font-bold mt-1">Rp {totalPendapatan.toLocaleString("id-ID")}</p>
              <p className="text-green-100 text-sm mt-1">dari pesanan selesai</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4">Breakdown per Kategori</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryStats).map(([name, stats]) => (
                <div key={name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="text-sm text-gray-500">{stats.count} produk</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stok: {stats.stock}</span>
                    <span className="font-medium text-blue-600">Rp {stats.value.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.value / totalNilaiStok) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4">Top 5 Produk (Berdasarkan Nilai)</h3>
            <div className="space-y-3">
              {topProductsByValue.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-gray-200 text-gray-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{product.nama_barang}</p>
                    <p className="text-sm text-gray-500">{product.categories?.nama} | Stok: {product.stok}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">Rp {(product.harga * product.stok).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-500">@ Rp {product.harga.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Daftar Produk</h3>
            <button onClick={exportProducts} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Harga</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Stok</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{p.kode_barang}</td>
                    <td className="px-4 py-3 font-medium">{p.nama_barang}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{p.categories?.nama || "-"}</span></td>
                    <td className="px-4 py-3 text-right">Rp {p.harga.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-right">{p.stok}</td>
                    <td className="px-4 py-3 text-right font-medium text-blue-600">Rp {(p.harga * p.stok).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Tab */}
      {activeTab === "stock-in" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Riwayat Barang Masuk</h3>
            <button onClick={exportStockIn} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Barang</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Jumlah</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStockIn.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                ) : (
                  filteredStockIn.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(s.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-3 font-mono">{s.products?.kode_barang}</td>
                      <td className="px-4 py-3 font-medium">{s.products?.nama_barang}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">+{s.jumlah}</td>
                      <td className="px-4 py-3">{s.supplier}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Out Tab */}
      {activeTab === "stock-out" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Riwayat Barang Keluar</h3>
            <button onClick={exportStockOut} className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Barang</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Jumlah</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStockOut.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                ) : (
                  filteredStockOut.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(s.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-3 font-mono">{s.products?.kode_barang}</td>
                      <td className="px-4 py-3 font-medium">{s.products?.nama_barang}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-medium">-{s.jumlah}</td>
                      <td className="px-4 py-3">{s.penerima}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Riwayat Pesanan</h3>
            <button onClick={exportOrders} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Pelanggan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-blue-600">{o.kode_pesanan}</td>
                      <td className="px-4 py-3">{o.customers?.nama || "Umum"}</td>
                      <td className="px-4 py-3">{new Date(o.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          o.status === "delivered" ? "bg-green-100 text-green-700" :
                          o.status === "cancelled" ? "bg-red-100 text-red-700" :
                          o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">Rp {o.total.toLocaleString("id-ID")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
