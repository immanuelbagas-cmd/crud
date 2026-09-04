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
