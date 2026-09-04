const db = require('../config/db');

class MesinModel {
  static async getAll() {
    const query = 'SELECT id, kode_mesin, nama_mesin FROM ms_mesin WHERE status = \'READY\' ORDER BY nama_mesin ASC';
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = MesinModel;