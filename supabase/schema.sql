-- ============================================
-- INVORA - Sistem Manajemen Stok Barang
-- SQL Schema untuk Supabase PostgreSQL
-- ============================================

-- 1. Tabel Categories (Kategori Barang)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Products (Data Barang)
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS stock_in (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  supplier VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Stock Out (Barang Keluar)
CREATE TABLE IF NOT EXISTS stock_out (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  penerima VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX untuk performa (CREATE IF NOT EXISTS)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_kategori') THEN
    CREATE INDEX idx_products_kategori ON products(kategori_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_nama') THEN
    CREATE INDEX idx_products_nama ON products(nama_barang);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_kode') THEN
    CREATE INDEX idx_products_kode ON products(kode_barang);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_in_product') THEN
    CREATE INDEX idx_stock_in_product ON stock_in(product_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_in_tanggal') THEN
    CREATE INDEX idx_stock_in_tanggal ON stock_in(tanggal);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_out_product') THEN
    CREATE INDEX idx_stock_out_product ON stock_out(product_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stock_out_tanggal') THEN
    CREATE INDEX idx_stock_out_tanggal ON stock_out(tanggal);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_customers_nama') THEN
    CREATE INDEX idx_customers_nama ON customers(nama);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_customer') THEN
    CREATE INDEX idx_orders_customer ON orders(customer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
    CREATE INDEX idx_orders_status ON orders(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_tanggal') THEN
    CREATE INDEX idx_orders_tanggal ON orders(tanggal);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_items_order') THEN
    CREATE INDEX idx_order_items_order ON order_items(order_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_items_product') THEN
    CREATE INDEX idx_order_items_product ON order_items(product_id);
  END IF;
END $$;

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
DROP TRIGGER IF EXISTS trigger_stock_in ON stock_in;
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
DROP TRIGGER IF EXISTS trigger_stock_out ON stock_out;
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
DROP TRIGGER IF EXISTS trigger_validate_stok ON stock_out;
CREATE TRIGGER trigger_validate_stok
  BEFORE INSERT ON stock_out
  FOR EACH ROW
  EXECUTE FUNCTION validate_stok_before_stock_out();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Aktifkan RLS (tidak error jika sudah aktif)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Hapus policy lama jika ada, lalu buat baru
DROP POLICY IF EXISTS "Allow all for authenticated" ON categories;
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated" ON stock_in;
DROP POLICY IF EXISTS "Allow all for authenticated" ON stock_out;
DROP POLICY IF EXISTS "Allow all for authenticated" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated" ON orders;
DROP POLICY IF EXISTS "Allow all for authenticated" ON order_items;

CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON stock_in FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON stock_out FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- 5. Tabel Customers (Pelanggan)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  telepon VARCHAR(50),
  alamat TEXT,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Orders (Pesanan)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_pesanan VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal NUMERIC(12, 2) DEFAULT 0,
  diskon NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Order Items (Item Pesanan)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  harga_satuan NUMERIC(12, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX untuk performa (CREATE IF NOT EXISTS)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
    INSERT INTO categories (nama) VALUES
      ('Elektronik'),
      ('Furniture'),
      ('ATK'),
      ('Makanan'),
      ('Minuman');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (kode_barang, nama_barang, kategori_id, satuan, harga, stok) VALUES
      ('BRG001', 'Laptop ASUS', (SELECT id FROM categories WHERE nama = 'Elektronik'), 'Unit', 8500000, 10),
      ('BRG002', 'Meja Kerja', (SELECT id FROM categories WHERE nama = 'Furniture'), 'Unit', 1500000, 25),
      ('BRG003', 'Pulpen Pilot', (SELECT id FROM categories WHERE nama = 'ATK'), 'Pack', 25000, 100),
      ('BRG004', 'Kopi Arabica', (SELECT id FROM categories WHERE nama = 'Makanan'), 'Pack', 85000, 50),
      ('BRG005', 'Teh Pucuk', (SELECT id FROM categories WHERE nama = 'Minuman'), 'Dus', 45000, 30);
  END IF;
END $$;
