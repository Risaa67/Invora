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

export interface Customer {
  id: string;
  nama: string;
  email: string | null;
  telepon: string | null;
  alamat: string | null;
  catatan: string | null;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  kode_pesanan: string;
  customer_id: string | null;
  tanggal: string;
  status: OrderStatus;
  subtotal: number;
  diskon: number;
  total: number;
  catatan: string | null;
  customers?: Customer;
  order_items?: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  products?: Product;
}
