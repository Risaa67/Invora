## 1. Informasi Produk

| Item            | Keterangan                   |
| --------------- | ---------------------------- |
| Nama Produk     | Invora |
| Versi           | 1.0 (MVP)                    |
| Platform        | Website Responsive           |
| Frontend        | Next.js + Tailwind CSS       |
| Backend         | Supabase                     |
| Database        | PostgreSQL (Supabase)        |
| Authentication  | Supabase Auth                |
| Deployment      | Vercel                       |
| Version Control | GitHub                       |

---

# 2. Latar Belakang

Banyak usaha kecil dan menengah masih mencatat stok barang secara manual menggunakan buku atau spreadsheet, sehingga sering terjadi kesalahan pencatatan, stok tidak akurat, dan proses pencarian data menjadi lambat.

Sistem Manajemen Stok Barang dibuat untuk membantu pengguna mengelola data barang, mencatat transaksi barang masuk dan keluar, memantau stok secara real-time, serta menghasilkan laporan stok dengan lebih cepat dan akurat.

---

# 3. Tujuan Produk

Membangun aplikasi berbasis web yang dapat:

* Mengelola data barang.
* Mencatat barang masuk dan barang keluar.
* Menghitung stok secara otomatis.
* Menyediakan fitur pencarian barang.
* Menampilkan laporan stok.
* Mempermudah monitoring persediaan barang.

---

# 4. Target Pengguna

## Admin Gudang

Kebutuhan:

* Login ke sistem.
* Mengelola data barang.
* Mencatat barang masuk.
* Mencatat barang keluar.
* Melihat laporan stok.

---

## Pemilik Usaha

Kebutuhan:

* Melihat laporan stok.
* Melihat riwayat transaksi.
* Memantau jumlah persediaan barang.

---

# 5. Fitur Utama

## 5.1 Authentication

Menggunakan **Supabase Auth**.

Fitur:

* Login
* Logout
* Reset Password (opsional)

---

## 5.2 Dashboard

Menampilkan ringkasan:

* Total Barang
* Total Barang Masuk
* Total Barang Keluar
* Stok Menipis
* Total Kategori

---

## 5.3 Master Barang (CRUD)

Admin dapat:

* Menambah barang
* Mengubah data barang
* Menghapus barang
* Melihat daftar barang

Data barang:

* Nama Barang
* Kode Barang
* Kategori
* Satuan
* Harga
* Stok

---

## 5.4 Barang Masuk

Admin dapat mencatat:

* Barang
* Jumlah
* Supplier
* Tanggal Masuk

Setelah disimpan:

**Stok otomatis bertambah.**

---

## 5.5 Barang Keluar

Admin dapat mencatat:

* Barang
* Jumlah
* Tujuan/Penerima
* Tanggal Keluar

Setelah disimpan:

**Stok otomatis berkurang.**

---

## 5.6 Pencarian

Pengguna dapat mencari barang berdasarkan:

* Nama Barang
* Kode Barang
* Kategori

---

## 5.7 Laporan

Laporan meliputi:

* Daftar seluruh barang
* Barang masuk
* Barang keluar
* Riwayat transaksi
* Stok saat ini

---

# 6. User Flow

### Admin

```text
Login
   │
   ▼
Dashboard
   │
   ├── Kelola Barang
   ├── Barang Masuk
   ├── Barang Keluar
   ├── Pencarian
   └── Laporan
```

---

# 7. Functional Requirements

| ID   | Requirement               | Prioritas |
| ---- | ------------------------- | --------- |
| FR01 | Login Admin               | High      |
| FR02 | CRUD Barang               | High      |
| FR03 | Input Barang Masuk        | High      |
| FR04 | Input Barang Keluar       | High      |
| FR05 | Perhitungan stok otomatis | High      |
| FR06 | Pencarian barang          | Medium    |
| FR07 | Laporan stok              | Medium    |
| FR08 | Dashboard statistik       | Medium    |

---

# 8. Non-Functional Requirements

| Requirement  | Detail                    |
| ------------ | ------------------------- |
| Performance  | Waktu muat < 3 detik      |
| Security     | HTTPS dan Supabase Auth   |
| Availability | Sistem dapat diakses 24/7 |
| Responsive   | Desktop, Tablet, Mobile   |
| Backup       | Backup database Supabase  |

---

# 9. Arsitektur Sistem

```text
                User
                  │
                  ▼
      Next.js + Tailwind CSS
                  │
          Supabase Client
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
 Supabase Auth PostgreSQL Database Storage
                  │
                  ▼
          Dashboard & Laporan
```

---

# 10. Struktur Database

## users

| Field | Type    |
| ----- | ------- |
| id    | UUID    |
| email | varchar |
| role  | admin   |

---

## categories

| Field | Type    |
| ----- | ------- |
| id    | UUID    |
| nama  | varchar |

---

## products

| Field       | Type    |
| ----------- | ------- |
| id          | UUID    |
| kode_barang | varchar |
| nama_barang | varchar |
| kategori_id | UUID    |
| satuan      | varchar |
| harga       | numeric |
| stok        | integer |

---

## stock_in

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| product_id | UUID      |
| jumlah     | integer   |
| supplier   | varchar   |
| tanggal    | timestamp |

---

## stock_out

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| product_id | UUID      |
| jumlah     | integer   |
| penerima   | varchar   |
| tanggal    | timestamp |

---

# 11. Teknologi

| Teknologi           | Fungsi                         |
| ------------------- | ------------------------------ |
| Next.js             | Frontend Framework             |
| Tailwind CSS        | UI Styling                     |
| TypeScript          | Bahasa Pemrograman             |
| Supabase Auth       | Login & Authentication         |
| Supabase PostgreSQL | Database                       |
| Supabase Storage    | Penyimpanan dokumen (opsional) |
| Vercel              | Deployment                     |
| GitHub              | Version Control                |

---

# 12. MVP (Minimum Viable Product)

Fitur yang wajib tersedia pada versi pertama:

* ✅ Login Admin
* ✅ Dashboard
* ✅ CRUD Barang
* ✅ Input Barang Masuk
* ✅ Input Barang Keluar
* ✅ Perhitungan Stok Otomatis
* ✅ Pencarian Barang
* ✅ Laporan Data Barang

---

# 13. Pengembangan Selanjutnya (Future Scope)

Fitur yang dapat ditambahkan pada versi berikutnya:

* 📷 Scan Barcode/QR Code untuk input barang.
* 📦 Manajemen Supplier.
* 👥 Multi-user dengan Role (Admin, Staff Gudang, Owner).
* 📊 Grafik stok dan transaksi.
* 📄 Export laporan ke PDF dan Excel.
* 🔔 Notifikasi stok menipis.
* 📱 Progressive Web App (PWA) agar bisa digunakan seperti aplikasi mobile.
