-- ============================================
-- INVORA - Tambah Tabel Customers & Orders
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Customers (Pelanggan)
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

-- 2. Tabel Orders (Pesanan)
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

-- 3. Tabel Order Items (Item Pesanan)
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
-- INDEX
-- ============================================
DO $$
BEGIN
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
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated" ON orders;
DROP POLICY IF EXISTS "Allow all for authenticated" ON order_items;

CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SELESAI!
-- ============================================
