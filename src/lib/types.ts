export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Category {
  id: string;
  nama: string;
}

export interface Product {
  id: string;
  kode_barang: string;
  nama_barang: string;
  kategori_id: string;
  satuan: string;
  harga: number;
  stok: number;
  categories?: Category;
}

export interface StockIn {
  id: string;
  product_id: string;
  jumlah: number;
  supplier: string;
  tanggal: string;
  products?: Product;
}

export interface StockOut {
  id: string;
  product_id: string;
  jumlah: number;
  penerima: string;
  tanggal: string;
  products?: Product;
}

export interface DashboardStats {
  totalBarang: number;
  barangMasuk: number;
  barangKeluar: number;
  stokMenipis: number;
  totalKategori: number;
}
