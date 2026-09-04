const db = require('./config/db');

async function createTable() {
  try {
    console.log('Sedang membuat tabel tr_jam_produksi...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS tr_jam_produksi (
        id BIGSERIAL PRIMARY KEY,
        mesin_id INT NOT NULL REFERENCES ms_mesin(id) ON DELETE RESTRICT,
        tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
        jam_mulai TIME NOT NULL,
        jam_selesai TIME NOT NULL,
        total_jam NUMERIC(4,2) GENERATED ALWAYS AS (
            EXTRACT(EPOCH FROM (jam_selesai - jam_mulai)) / 3600
        ) STORED,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('TABEL TR_JAM_PRODUKSI BERHASIL DIBUAT!');
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat tabel:', err.message);
    process.exit(1);
  }
}

createTable();