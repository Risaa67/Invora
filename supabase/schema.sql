-- ============================================
-- INVORA - Sistem Manajemen Stok Barang
-- SQL Schema untuk Supabase PostgreSQL
-- ============================================

-- 1. Tabel Categories (Kategori Barang)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Products (Data Barang)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_barang VARCHAR(50) UNIQUE NOT NULL,
  nama_barang VARCHAR(200) NOT NULL,
  kategori_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  satuan VARCHAR(50) NOT NULL,
  harga NUMERIC(12, 2) DEFAULT 0,
  stok INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Stock In (Barang Masuk)
CREATE TABLE stock_in (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  supplier VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Stock Out (Barang Keluar)
CREATE TABLE stock_out (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  penerima VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX untuk performa
-- ============================================
CREATE INDEX idx_products_kategori ON products(kategori_id);
CREATE INDEX idx_products_nama ON products(nama_barang);
CREATE INDEX idx_products_kode ON products(kode_barang);
CREATE INDEX idx_stock_in_product ON stock_in(product_id);
CREATE INDEX idx_stock_in_tanggal ON stock_in(tanggal);
CREATE INDEX idx_stock_out_product ON stock_out(product_id);
CREATE INDEX idx_stock_out_tanggal ON stock_out(tanggal);

-- ============================================
-- FUNCTION: Auto-update stok saat barang masuk
-- ============================================
CREATE OR REPLACE FUNCTION update_stok_on_stock_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stok = stok + NEW.jumlah,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk Barang Masuk
CREATE TRIGGER trigger_stock_in
  AFTER INSERT ON stock_in
  FOR EACH ROW
  EXECUTE FUNCTION update_stok_on_stock_in();

-- ============================================
-- FUNCTION: Auto-update stok saat barang keluar
-- ============================================
CREATE OR REPLACE FUNCTION update_stok_on_stock_out()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stok = stok - NEW.jumlah,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk Barang Keluar
CREATE TRIGGER trigger_stock_out
  AFTER INSERT ON stock_out
  FOR EACH ROW
  EXECUTE FUNCTION update_stok_on_stock_out();

-- ============================================
-- FUNCTION: Validasi stok cukup saat barang keluar
-- ============================================
CREATE OR REPLACE FUNCTION validate_stok_before_stock_out()
RETURNS TRIGGER AS $$
DECLARE
  current_stok INTEGER;
BEGIN
  SELECT stok INTO current_stok
  FROM products
  WHERE id = NEW.product_id;

  IF current_stok < NEW.jumlah THEN
    RAISE EXCEPTION 'Stok tidak mencukupi. Stok tersedia: %, diminta: %', current_stok, NEW.jumlah;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger validasi stok
CREATE TRIGGER trigger_validate_stok
  BEFORE INSERT ON stock_out
  FOR EACH ROW
  EXECUTE FUNCTION validate_stok_before_stock_out();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Aktifkan RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out ENABLE ROW LEVEL SECURITY;

-- Policy: Semua authenticated user bisa CRUD
CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON stock_in FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON stock_out FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INSERT DATA CONTOH (Opsional)
-- ============================================

-- Kategori contoh
INSERT INTO categories (nama) VALUES
  ('Elektronik'),
  ('Furniture'),
  ('ATK'),
  ('Makanan'),
  ('Minuman');

-- Barang contoh
INSERT INTO products (kode_barang, nama_barang, kategori_id, satuan, harga, stok) VALUES
  ('BRG001', 'Laptop ASUS', (SELECT id FROM categories WHERE nama = 'Elektronik'), 'Unit', 8500000, 10),
  ('BRG002', 'Meja Kerja', (SELECT id FROM categories WHERE nama = 'Furniture'), 'Unit', 1500000, 25),
  ('BRG003', 'Pulpen Pilot', (SELECT id FROM categories WHERE nama = 'ATK'), 'Pack', 25000, 100),
  ('BRG004', 'Kopi Arabica', (SELECT id FROM categories WHERE nama = 'Makanan'), 'Pack', 85000, 50),
  ('BRG005', 'Teh Pucuk', (SELECT id FROM categories WHERE nama = 'Minuman'), 'Dus', 45000, 30);
