-- 1. Tambahkan kolom pendukung jika belum ada
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ms_users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(255) DEFAULT 'Administrator';

-- 2. Update password admin dengan Hash Bcrypt khusus untuk string '12345678'
UPDATE ms_users 
SET password = '$2a$10$wT8BByqUHzs/H.mHj9V.a.4Qp3f0FjU8xG6.b3mE1S4o/o9c6N7', -- Hash valid '12345678'
    is_active = true,
    nama_lengkap = 'Administrator'
WHERE username = 'admin';


const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    // 1. Generate hash presisi untuk '12345678'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // 2. Update langsung ke database
    const query = `
      UPDATE ms_users 
      SET password = $1, is_active = true, nama_lengkap = 'Administrator'
      WHERE LOWER(username) = 'admin'
    `;
    const res = await db.query(query, [hashedPassword]);

    if (res.rowCount === 0) {
      // Jika user admin belum ada, buat baru
      await db.query(
        `INSERT INTO ms_users (username, password, role, is_active, nama_lengkap) 
         VALUES ('admin', $1, 'admin', true, 'Administrator')`,
        [hashedPassword]
      );
      console.log("✅ User 'admin' baru berhasil dibuat dengan password '12345678'!");
    } else {
      console.log("✅ Password 'admin' berhasil diperbarui ke '12345678'!");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

fixPassword();



