const db = require('./config/db');

async function seed() {
  try {
    console.log('Sedang mengisi data master...');

    // 1. Master Mesin
    await db.query(`
      INSERT INTO ms_mesin (kode_mesin, nama_mesin, lokasi) 
      VALUES ('MSN-01', 'Mesin Extruder A', 'Line 1')
      ON CONFLICT (kode_mesin) DO NOTHING;
    `);

    // 2. Master Barang
    await db.query(`
      INSERT INTO ms_barang (kode_barang, nama_barang, kategori, satuan, stok_minimal) 
      VALUES ('BRG-001', 'Biji Plastik PP', 'BAHAN_BAKU', 'KG', 100)
      ON CONFLICT (kode_barang) DO NOTHING;
    `);

    // 3. Master Gudang
    await db.query(`
      INSERT INTO ms_gudang (kode_gudang, nama_gudang, lokasi) 
      VALUES ('GDG-PMC-01', 'Gudang Bahan Baku PMC', 'Area A')
      ON CONFLICT (kode_gudang) DO NOTHING;
    `);

    // 4. Stok Bulanan Awal
    await db.query(`
      INSERT INTO tr_stok_bulanan (barang_id, gudang_id, periode_bulan, periode_tahun, saldo_awal, qty_debit, qty_kredit) 
      VALUES (1, 1, 1, 2026, 1000, 500, 200)
      ON CONFLICT DO NOTHING;
    `);

    console.log('SEED DATA BERHASIL DISIMPANKAN!');
    process.exit(0);
  } catch (err) {
    console.error('Gagal seed data:', err.message);
    process.exit(1);
  }
}

seed();