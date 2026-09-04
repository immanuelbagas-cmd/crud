const db = require('../config/db');

class UserModel {
  static async findByUsername(username) {
    const query = 'SELECT * FROM ms_users WHERE username = $1 AND is_active = TRUE';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, nama_lengkap, role FROM ms_users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UserModel;