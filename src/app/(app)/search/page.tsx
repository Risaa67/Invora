"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(nama)")
        .order("nama_barang");

      setProducts(data || []);
      setFiltered(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  useEffect(() => {
    const query = search.toLowerCase();
    const result = products.filter(
      (p) =>
        p.nama_barang.toLowerCase().includes(query) ||
        p.kode_barang.toLowerCase().includes(query) ||
        p.categories?.nama?.toLowerCase().includes(query)
    );
    setFiltered(result);
  }, [search, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pencarian Barang</h1>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, kode, atau kategori..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {search && (
          <p className="mt-2 text-sm text-gray-600">
            Ditemukan {filtered.length} barang
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Satuan
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Harga
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Stok
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {search
                      ? "Tidak ada barang yang cocok"
                      : "Belum ada data barang"}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{product.kode_barang}</td>
                    <td className="px-4 py-3 font-medium">
                      {product.nama_barang}
                    </td>
                    <td className="px-4 py-3">
                      {product.categories?.nama || "-"}
                    </td>
                    <td className="px-4 py-3">{product.satuan}</td>
                    <td className="px-4 py-3 text-right">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.stok <= 5
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stok}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
