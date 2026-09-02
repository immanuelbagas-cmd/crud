const db = require('../config/db');

class UserModel {
  static async findByUsername(username) {
    // Tambahkan prefix 'public.' pada tabel ms_users
    const query = 'SELECT * FROM public.ms_users WHERE username = $1 AND is_active = TRUE';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }
}

module.exports = UserModel;