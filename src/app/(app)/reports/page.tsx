"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, StockIn, StockOut } from "@/lib/types";

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockIn, setStockIn] = useState<StockIn[]>([]);
  const [stockOut, setStockOut] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "products" | "stock-in" | "stock-out"
  >("products");
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, stockInRes, stockOutRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(nama)")
        .order("nama_barang"),
      supabase
        .from("stock_in")
        .select("*, products(nama_barang, kode_barang)")
        .order("tanggal", { ascending: false }),
      supabase
        .from("stock_out")
        .select("*, products(nama_barang, kode_barang)")
        .order("tanggal", { ascending: false }),
    ]);

    setProducts(productsRes.data || []);
    setStockIn(stockInRes.data || []);
    setStockOut(stockOutRes.data || []);
    setLoading(false);
  };

  const totalNilaiStok = products.reduce(
    (acc, p) => acc + p.harga * p.stok,
    0
  );
  const totalMasuk = stockIn.reduce((acc, s) => acc + s.jumlah, 0);
  const totalKeluar = stockOut.reduce((acc, s) => acc + s.jumlah, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Barang</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Barang Masuk</p>
          <p className="text-2xl font-bold text-green-600">{totalMasuk}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Barang Keluar</p>
          <p className="text-2xl font-bold text-orange-600">{totalKeluar}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Nilai Total Stok</p>
          <p className="text-2xl font-bold text-blue-600">
            Rp {totalNilaiStok.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Daftar Barang
        </button>
        <button
          onClick={() => setActiveTab("stock-in")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "stock-in"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Barang Masuk
        </button>
        <button
          onClick={() => setActiveTab("stock-out")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "stock-out"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Barang Keluar
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Nama Barang
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{product.kode_barang}</td>
                    <td className="px-4 py-3 font-medium">
                      {product.nama_barang}
                    </td>
                    <td className="px-4 py-3">
                      {product.categories?.nama || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">{product.stok}</td>
                    <td className="px-4 py-3 text-right">
                      Rp{" "}
                      {(product.harga * product.stok).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "stock-in" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Kode Barang
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Nama Barang
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Supplier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockIn.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stockIn.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        {item.products?.kode_barang}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.products?.nama_barang}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        +{item.jumlah}
                      </td>
                      <td className="px-4 py-3">{item.supplier}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "stock-out" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Kode Barang
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Nama Barang
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Penerima
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockOut.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  stockOut.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        {item.products?.kode_barang}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.products?.nama_barang}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600 font-medium">
                        -{item.jumlah}
                      </td>
                      <td className="px-4 py-3">{item.penerima}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
