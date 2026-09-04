const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'crud-pg',
});

// Otomatis buat tabel jika belum ada di database 'crud-pg'
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ms_produk_foil (
        id SERIAL PRIMARY KEY,
        jenis_foil VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tr_perintah_produksi (
        id SERIAL PRIMARY KEY,
        no_pp VARCHAR(50) NOT NULL UNIQUE,
        no_po_sakti VARCHAR(100) NOT NULL,
        produk_id INT REFERENCES ms_produk_foil(id) ON DELETE SET NULL,
        jenis_foil VARCHAR(100),
        qty INT NOT NULL DEFAULT 0,
        satuan VARCHAR(20) DEFAULT 'Roll',
        status_pp VARCHAR(30) DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Inisialisasi Database "crud-pg" Berhasil');
  } catch (err) {
    console.error('Gagal Inisialisasi Tabel DB:', err.message);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'root',
//   database: 'crud', // Dipaksa (hardcoded) mengarah ke database crud
// });

// pool.on('connect', () => {
//   console.log('Terhubung ke Database PostgreSQL (crud)');
// });

// pool.on('error', (err) => {
//   console.error('Database error:', err);
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   getClient: () => pool.connect(),
// };