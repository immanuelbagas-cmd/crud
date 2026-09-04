const db = require('../config/db');

class JamProduksiModel {
  static async create(data) {
    const { mesin_id, tanggal, jam_mulai, jam_selesai, keterangan } = data;
    const query = `
      INSERT INTO tr_jam_produksi (mesin_id, tanggal, jam_mulai, jam_selesai, keterangan)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [mesin_id, tanggal, jam_mulai, jam_selesai, keterangan];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT 
        j.id,
        m.kode_mesin,
        m.nama_mesin,
        j.tanggal,
        j.jam_mulai,
        j.jam_selesai,
        j.total_jam,
        j.keterangan
      FROM tr_jam_produksi j
      JOIN ms_mesin m ON j.mesin_id = m.id
      ORDER BY j.tanggal DESC, j.id DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = JamProduksiModel;