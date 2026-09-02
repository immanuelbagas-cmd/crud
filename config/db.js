const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: 'crud',
});

// Debugging koneksi aktif
pool.query('SELECT current_database(), current_schema()', (err, res) => {
  if (err) {
    console.error('Gagal koneksi:', err.message);
  } else {
    console.log('-------------------------------------------');
    console.log('Database Aktif di Node.js :', res.rows[0].current_database);
    console.log('Schema Aktif di Node.js   :', res.rows[0].current_schema);
    console.log('-------------------------------------------');
  }
});

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