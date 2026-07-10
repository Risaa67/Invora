"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product, Category } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    kategori_id: "",
    satuan: "",
    harga: "",
    stok: "",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(nama)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("nama"),
    ]);

    setProducts(productsRes.data || []);
    setCategories(categoriesRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      kode_barang: formData.kode_barang,
      nama_barang: formData.nama_barang,
      kategori_id: formData.kategori_id || null,
      satuan: formData.satuan,
      harga: parseFloat(formData.harga) || 0,
      stok: parseInt(formData.stok) || 0,
    };

    if (editingProduct) {
      await supabase.from("products").update(data).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert(data);
    }

    setShowModal(false);
    setEditingProduct(null);
    resetForm();
    fetchData();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      kode_barang: product.kode_barang,
      nama_barang: product.nama_barang,
      kategori_id: product.kategori_id || "",
      satuan: product.satuan,
      harga: product.harga.toString(),
      stok: product.stok.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus barang ini?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      kode_barang: "",
      nama_barang: "",
      kategori_id: "",
      satuan: "",
      harga: "",
      stok: "",
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Barang</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Tambah Barang
        </button>
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
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Belum ada data barang
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingProduct ? "Edit Barang" : "Tambah Barang"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Barang
                  </label>
                  <input
                    type="text"
                    value={formData.kode_barang}
                    onChange={(e) =>
                      setFormData({ ...formData, kode_barang: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    value={formData.nama_barang}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_barang: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) =>
                        setFormData({ ...formData, satuan: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="pcs, kg, liter"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <input
                      type="number"
                      value={formData.harga}
                      onChange={(e) =>
                        setFormData({ ...formData, harga: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={formData.stok}
                    onChange={(e) =>
                      setFormData({ ...formData, stok: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingProduct ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
