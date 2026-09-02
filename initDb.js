const db = require('./config/db');

async function initFullDatabase() {
  try {
    console.log('Sedang membuat seluruh tabel database PLPP...');

    await db.query(`
      -- 1. Master Users
      CREATE TABLE IF NOT EXISTS ms_users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nama_lengkap VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Master Mesin
      CREATE TABLE IF NOT EXISTS ms_mesin (
        id SERIAL PRIMARY KEY,
        kode_mesin VARCHAR(20) UNIQUE NOT NULL,
        nama_mesin VARCHAR(100) NOT NULL,
        lokasi VARCHAR(50),
        status VARCHAR(20) DEFAULT 'READY'
      );

      -- 3. Master Barang
      CREATE TABLE IF NOT EXISTS ms_barang (
        id SERIAL PRIMARY KEY,
        kode_barang VARCHAR(50) UNIQUE NOT NULL,
        nama_barang VARCHAR(150) NOT NULL,
        kategori VARCHAR(50),
        satuan VARCHAR(20) NOT NULL,
        stok_minimal INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 4. Master Gudang
      CREATE TABLE IF NOT EXISTS ms_gudang (
        id SERIAL PRIMARY KEY,
        kode_gudang VARCHAR(20) UNIQUE NOT NULL,
        nama_gudang VARCHAR(100) NOT NULL,
        lokasi VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE
      );

      -- 5. Transaksi Stok Bulanan
      CREATE TABLE IF NOT EXISTS tr_stok_bulanan (
        id BIGSERIAL PRIMARY KEY,
        barang_id INT NOT NULL REFERENCES ms_barang(id) ON DELETE RESTRICT,
        gudang_id INT NOT NULL REFERENCES ms_gudang(id) ON DELETE RESTRICT,
        periode_bulan INT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
        periode_tahun INT NOT NULL CHECK (periode_tahun >= 2000),
        saldo_awal INT NOT NULL DEFAULT 0,
        qty_debit INT NOT NULL DEFAULT 0,
        qty_kredit INT NOT NULL DEFAULT 0,
        saldo_akhir INT GENERATED ALWAYS AS (saldo_awal + qty_debit - qty_kredit) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_stok_periode UNIQUE (barang_id, gudang_id, periode_bulan, periode_tahun)
      );
    `);

    console.log('SELURUH TABEL BERHASIL DIBUAT!');
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat tabel:', err.message);
    process.exit(1);
  }
}

initFullDatabase();