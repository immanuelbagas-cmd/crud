const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    await db.query(
      `UPDATE ms_users SET password = $1 WHERE username = 'admin'`,
      [hashedPassword]
    );

    console.log('Password admin berhasil diperbarui menjadi: 12345678');
    process.exit(0);
  } catch (err) {
    console.error('Gagal update password:', err.message);
    process.exit(1);
  }
}

fixPassword();