# Panduan Setup Invora - v1.1

## 1. Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Login / Sign up
3. Klik **"New Project"**
4. Isi form:
   - **Organization**: Pilih atau buat baru
   - **Project Name**: `invora`
   - **Database Password**: Isi password (simpan!)
   - **Region**: Pilih terdekat (Singapore)
5. Klik **"Create new project"**
6. Tunggu beberapa menit hingga project selesai dibuat

## 2. Setup Database

1. Buka dashboard Supabase project kamu
2. Klik menu **"SQL Editor"** di sidebar
3. Klik **"New query"**
4. Buka file `supabase/schema.sql` dari project ini
5. Copy seluruh isi SQL, paste ke SQL Editor
6. Klik **"Run"** atau tekan `Ctrl+Enter`
7. Tunggu hingga muncul pesan sukses

## 3. Buat Akun Admin

1. Klik menu **"Authentication"** di sidebar
2. Klik tab **"Users"**
3. Klik **"Add user"** > **"Create new user"**
4. Isi form:
   - **Email**: `admin@invora.com` (atau sesuai keinginan)
   - **Password**: `admin123` (atau password yang kuat)
   - **Auto Confirm Email**: Centang ✅
5. Klik **"Create user"**

## 4. Ambil API Keys

1. Klik menu **"Project Settings"** (ikon gear di sidebar)
2. Klik tab **"API"**
3. Copy kedua value ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

## 5. Update .env.local

Buka file `.env.local` di project ini dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Ganti `xxxxx` dengan Project ID kamu.

## 6. Jalankan Development Server

```bash
cd invora
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

## 7. Login

- Email: `admin@invora.com`
- Password: `admin123`

## 8. Deploy ke Vercel

1. Push project ke GitHub
2. Buka [https://vercel.com](https://vercel.com)
3. Login dengan GitHub
4. Klik **"New Project"**
5. Pilih repository `Invora`
6. Isi Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon Key Supabase
7. Klik **"Deploy"**
8. Tunggu hingga selesai, dapat URL production

---

## Troubleshooting

### Error "Invalid API key"
- Pastikan `.env.local` sudah diisi dengan benar
- Restart development server setelah mengubah `.env.local`

### Error "relation does not exist"
- Pastikan SQL schema sudah dijalankan di Supabase SQL Editor

### Login gagal
- Pastikan akun user sudah dibuat di Supabase Authentication
- Centang "Auto Confirm Email" saat membuat user
