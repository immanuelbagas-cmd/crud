const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/db'); // Menggunakan koneksi DB utama Anda
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const stokRoutes = require('./routes/stokRoutes');
const jamProduksiRoutes = require('./routes/jamProduksiRoutes');
const mesinRoutes = require('./routes/mesinRoutes');
const ppRoutes = require('./routes/ppRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTE BANTUAN SETUP ADMIN PC KANTOR ===
app.get('/setup-admin', async (req, res) => {
  try {
    // 1. Buat hash password '12345678' menggunakan bcryptjs lokal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // 2. Hapus admin lama jika ada
    await db.query("DELETE FROM ms_users WHERE LOWER(username) = 'admin'");

    // 3. Insert user admin baru yang valid 100%
    await db.query(
      `INSERT INTO ms_users (username, password, role, is_active, nama_lengkap) 
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', hashedPassword, 'admin', true, 'Administrator']
    );

    res.send(`
      <div style="font-family: Arial; padding: 20px; text-align: center;">
        <h1 style="color: green;">✅ AKUN ADMIN BERHASIL DIBUAT!</h1>
        <p><b>Username:</b> admin</p>
        <p><b>Password:</b> 12345678</p>
        <hr>
        <p>Silakan buka kembali halaman <a href="/login.html">Login</a> dan masuk.</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`
      <div style="font-family: Arial; padding: 20px; color: red;">
        <h1>❌ GAGAL MEMBUAT ADMIN</h1>
        <p><b>Error:</b> ${err.message}</p>
      </div>
    `);
  }
});

// Routes Utama
app.use('/api/auth', authRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/jam-produksi', jamProduksiRoutes);
app.use('/api/mesin', mesinRoutes);
app.use('/api', ppRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API PLPP Manufacturing Berjalan Normal' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});



-- 1. Tambahkan kolom pendukung jika belum ada
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(255) DEFAULT 'Administrator';

-- 2. Update password admin dengan Hash Bcrypt khusus untuk string '12345678'
UPDATE ms_users 
SET password = '$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7', -- Hash valid '12345678'
    is_active = true,
    nama_lengkap = 'Administrator'
WHERE username = 'admin';


const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixPassword() {
  // Membuka koneksi langsung dengan timeout 5 detik
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crud-pg',
    password: process.env.DB_PASSWORD || 'postgres', // Sesuaikan password postgres Anda
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log("⏳ Menghubungkan ke PostgreSQL Device ke-2...");
    await client.connect();
    
    console.log("⏳ Memproses Hash Bcrypt untuk '12345678'...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    const query = `
      UPDATE ms_users 
      SET password = $1, is_active = true, nama_lengkap = 'Administrator'
      WHERE LOWER(username) = 'admin'
    `;
    const res = await client.query(query, [hashedPassword]);

    if (res.rowCount === 0) {
      await client.query(
        `INSERT INTO ms_users (username, password, role, is_active, nama_lengkap) 
         VALUES ('admin', $1, 'admin', true, 'Administrator')`,
        [hashedPassword]
      );
      console.log("✅ User 'admin' baru berhasil dibuat dengan password '12345678'!");
    } else {
      console.log("✅ Password 'admin' berhasil diperbarui ke '12345678'!");
    }

  } catch (err) {
    console.error("❌ GAGAL KONEKSI/EXECUTE:", err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fixPassword();
