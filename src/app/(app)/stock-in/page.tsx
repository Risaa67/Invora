"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, StockIn } from "@/lib/types";

export default function StockInPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockInList, setStockInList] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    product_id: "",
    jumlah: "",
    supplier: "",
    tanggal: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, stockInRes] = await Promise.all([
      supabase.from("products").select("*").order("nama_barang"),
      supabase
        .from("stock_in")
        .select("*, products(nama_barang, kode_barang)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    setProducts(productsRes.data || []);
    setStockInList(stockInRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const jumlah = parseInt(formData.jumlah);
    const product = products.find((p) => p.id === formData.product_id);

    if (!product) {
      alert("Barang tidak ditemukan");
      setSubmitting(false);
      return;
    }

    // Insert stock in record
    const { error: insertError } = await supabase.from("stock_in").insert({
      product_id: formData.product_id,
      jumlah,
      supplier: formData.supplier,
      tanggal: formData.tanggal,
    });

    if (insertError) {
      alert("Gagal menyimpan data: " + insertError.message);
      setSubmitting(false);
      return;
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({ stok: product.stok + jumlah })
      .eq("id", formData.product_id);

    if (updateError) {
      alert("Gagal update stok: " + updateError.message);
    }

    setFormData({
      product_id: "",
      jumlah: "",
      supplier: "",
      tanggal: new Date().toISOString().split("T")[0],
    });
    fetchData();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Barang Masuk</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Input Barang Masuk</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Barang
              </label>
              <select
                value={formData.product_id}
                onChange={(e) =>
                  setFormData({ ...formData, product_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Barang</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.kode_barang} - {product.nama_barang} (Stok:{" "}
                    {product.stok})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Simpan Barang Masuk"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Riwayat Barang Masuk</h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Barang
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600">
                    Jumlah
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Supplier
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockInList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-gray-500"
                    >
                      Belum ada riwayat
                    </td>
                  </tr>
                ) : (
                  stockInList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {item.products?.nama_barang}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.products?.kode_barang}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-green-600 font-medium">
                        +{item.jumlah}
                      </td>
                      <td className="px-3 py-2">{item.supplier}</td>
                      <td className="px-3 py-2">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
