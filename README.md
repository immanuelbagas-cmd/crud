$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7


-- 1. Tambah kolom nama_lengkap (diperlukan oleh controller)
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(255);

-- 2. Update data admin dengan nama_lengkap dan hash password '123'
UPDATE ms_users 
SET password = '$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7',
    nama_lengkap = 'Administrator System',
    is_active = true 
WHERE username = 'admin';


const UserModel = require('./models/userModel');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function fixAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123', salt);

    await db.query(`
      INSERT INTO ms_users (username, password, role, is_active, nama_lengkap)
      VALUES ('admin', $1, 'admin', true, 'Administrator System')
      ON CONFLICT (username) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        is_active = true,
        nama_lengkap = EXCLUDED.nama_lengkap;
    `, [hashedPassword]);

    console.log("✅ USER ADMIN BERHASIL DISINKRONKAN DENGAN BCRYPTJS!");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

fixAdmin();
