# Sprint Planning

**Nama Proyek:** Invora

**Sprint:** Sprint 1 (MVP)

**Durasi:** 1 Hari

**Deadline:** Hari ini pukul 23.59 WIB

**Sprint Goal:**

> Menghasilkan aplikasi web yang memungkinkan admin login, mengelola data barang, mencatat barang masuk dan keluar, serta melihat stok yang diperbarui secara otomatis.

---

# Sprint Backlog

| ID    | User Story                                                                       | Prioritas | Estimasi |
| ----- | -------------------------------------------------------------------------------- | --------- | -------- |
| SP-01 | Sebagai admin, saya dapat login ke sistem                                        | High      | 30 menit |
| SP-02 | Sebagai admin, saya dapat melihat dashboard                                      | High      | 45 menit |
| SP-03 | Sebagai admin, saya dapat menambah, mengubah, menghapus, dan melihat data barang | High      | 2 jam    |
| SP-04 | Sebagai admin, saya dapat mencatat barang masuk agar stok bertambah              | High      | 1 jam    |
| SP-05 | Sebagai admin, saya dapat mencatat barang keluar agar stok berkurang             | High      | 1 jam    |
| SP-06 | Sebagai admin, saya dapat mencari barang berdasarkan nama atau kode              | Medium    | 30 menit |
| SP-07 | Sebagai admin, saya dapat melihat laporan stok sederhana                         | Medium    | 45 menit |
| SP-08 | Deploy aplikasi ke Vercel dan push ke GitHub                                     | High      | 30 menit |

---

# Breakdown Task

## 1. Setup Project (30 Menit)

### Task

* Membuat repository GitHub
* Membuat project Next.js
* Install Tailwind CSS
* Konfigurasi Supabase
* Deploy awal ke Vercel

**Output**

* Project berhasil berjalan di localhost
* Repository GitHub tersedia
* Deployment awal berhasil

---

## 2. Authentication (30 Menit)

### Task

* Halaman Login
* Integrasi Supabase Auth
* Logout
* Protected Route Dashboard

**Acceptance Criteria**

* Admin dapat login.
* Admin dapat logout.
* Dashboard hanya bisa diakses setelah login.

---

## 3. Dashboard (45 Menit)

### Widget

* Total Barang
* Barang Masuk Hari Ini
* Barang Keluar Hari Ini
* Total Stok

**Acceptance Criteria**

Dashboard berhasil menampilkan data dari Supabase.

---

## 4. CRUD Barang (2 Jam)

### Task

* Tabel Barang
* Tambah Barang
* Edit Barang
* Hapus Barang
* Detail Barang

Field Barang

* Nama Barang
* Kode Barang
* Kategori
* Harga
* Stok
* Satuan

**Acceptance Criteria**

* Data tersimpan di Supabase.
* Data dapat diubah dan dihapus.
* Data tampil dalam tabel.

---

## 5. Barang Masuk (1 Jam)

### Task

* Form Barang Masuk
* Simpan transaksi
* Update stok otomatis

Field

* Barang
* Jumlah
* Supplier
* Tanggal

**Acceptance Criteria**

* Transaksi tersimpan.
* Stok bertambah otomatis.

---

## 6. Barang Keluar (1 Jam)

### Task

* Form Barang Keluar
* Simpan transaksi
* Update stok otomatis

Field

* Barang
* Jumlah
* Penerima
* Tanggal

**Acceptance Criteria**

* Transaksi tersimpan.
* Stok berkurang otomatis.
* Tidak bisa mengurangi stok jika jumlah melebihi stok tersedia.

---

## 7. Pencarian (30 Menit)

### Task

* Search berdasarkan Nama Barang
* Search berdasarkan Kode Barang

**Acceptance Criteria**

* Data barang dapat difilter secara real-time.

---

## 8. Laporan (45 Menit)

### Task

* Tabel Barang
* Total Barang
* Total Barang Masuk
* Total Barang Keluar

**Acceptance Criteria**

* Laporan menampilkan data terbaru.

---

## 9. Deployment (30 Menit)

### Task

* Push ke GitHub
* Deploy ke Vercel
* Uji aplikasi produksi

**Acceptance Criteria**

* Aplikasi dapat diakses melalui URL Vercel.

---

# Sprint Board (Kanban)

| To Do         | In Progress | Done |
| ------------- | ----------- | ---- |
| Setup Project |             |      |
| Login         |             |      |
| Dashboard     |             |      |
| CRUD Barang   |             |      |
| Barang Masuk  |             |      |
| Barang Keluar |             |      |
| Search Barang |             |      |
| Laporan       |             |      |
| Deploy Vercel |             |      |

---

# Definition of Done (DoD)

Suatu task dianggap selesai apabila:

* Fitur berjalan tanpa error.
* Data tersimpan di Supabase.
* Tampilan responsif (desktop dan mobile).
* Kode telah di-push ke GitHub.
* Deployment di Vercel berhasil.
* Fitur sesuai dengan acceptance criteria.

## Prioritas Pengerjaan

Karena waktu sangat terbatas, urutan pengerjaan yang disarankan adalah:

1. ✅ Setup Project (Next.js + Tailwind + Supabase + Vercel)
2. ✅ Login & Authentication
3. ✅ CRUD Data Barang
4. ✅ Barang Masuk (update stok)
5. ✅ Barang Keluar (update stok)
6. ✅ Dashboard Ringkasan
7. ✅ Pencarian Barang
8. ✅ Laporan Sederhana
9. ✅ Deploy ke Vercel