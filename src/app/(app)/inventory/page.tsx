"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, Category } from "@/lib/types";
import Link from "next/link";

interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  inStock: number;
  byCategory: { name: string; count: number; value: number }[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"nama" | "stok" | "value">("nama");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(nama)")
        .order("nama_barang"),
      supabase.from("categories").select("*").order("nama"),
    ]);

    setProducts(productsRes.data || []);
    setCategories(categoriesRes.data || []);
    setLoading(false);
  };

  const filteredProducts = products
    .filter((p) =>
      p.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
      p.kode_barang.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal =
        sortBy === "value" ? a.harga * a.stok : sortBy === "stok" ? a.stok : a.nama_barang;
      const bVal =
        sortBy === "value" ? b.harga * b.stok : sortBy === "stok" ? b.stok : b.nama_barang;
      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  const stats: InventoryStats = {
    totalProducts: products.length,
    totalStock: products.reduce((acc, p) => acc + p.stok, 0),
    totalValue: products.reduce((acc, p) => acc + p.harga * p.stok, 0),
    lowStock: products.filter((p) => p.stok <= 5 && p.stok > 0).length,
    outOfStock: products.filter((p) => p.stok === 0).length,
    inStock: products.filter((p) => p.stok > 5).length,
    byCategory: categories.map((cat) => {
      const catProducts = products.filter((p) => p.kategori_id === cat.id);
      return {
        name: cat.nama,
        count: catProducts.length,
        value: catProducts.reduce((acc, p) => acc + p.harga * p.stok, 0),
      };
    }),
  };

  const getStockStatus = (stok: number) => {
    if (stok === 0) return { label: "Habis", color: "bg-red-100 text-red-700" };
    if (stok <= 5) return { label: "Menipis", color: "bg-orange-100 text-orange-700" };
    return { label: "Aman", color: "bg-green-100 text-green-700" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Memuat data inventaris...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventaris</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview seluruh stok barang dan nilai inventaris
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stok</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStock.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 text-green-600 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Aman</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Menipis</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-600 p-3 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Habis</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Total Nilai Inventaris</p>
            <p className="text-3xl font-bold mt-1">
              Rp {stats.totalValue.toLocaleString("id-ID")}
            </p>
          </div>
          <Link
            href="/reports"
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Lihat Laporan →
          </Link>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stok per Kategori</h2>
        {stats.byCategory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada kategori</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byCategory.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.count} produk</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    Rp {cat.value.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nama">Urut: Nama</option>
              <option value="stok">Urut: Stok</option>
              <option value="value">Urut: Nilai</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kode</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nama Barang</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Harga</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Stok</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Nilai</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    {search ? "Tidak ada produk yang cocok" : "Belum ada data inventaris"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stok);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{product.kode_barang}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{product.nama_barang}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {product.categories?.nama || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        Rp {product.harga.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {product.stok}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">
                        Rp {(product.harga * product.stok).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {product.stok <= 5 && (
                            <Link
                              href="/stock-in"
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                            >
                              + Restok
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex justify-between">
            <span>Menampilkan {filteredProducts.length} dari {products.length} produk</span>
            <span className="font-medium">
              Total: Rp {filteredProducts.reduce((acc, p) => acc + p.harga * p.stok, 0).toLocaleString("id-ID")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
