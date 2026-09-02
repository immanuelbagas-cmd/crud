const db = require('../config/db');

class JamProduksiModel {
  static async findAll() {
    const query = `
      SELECT h.*, m.nama_mesin 
      FROM tr_jam_produksi h
      LEFT JOIN ms_mesin m ON h.mesin_id = m.id
      ORDER BY h.id DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async createTransaction(payload) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const insertHeader = `
        INSERT INTO tr_jam_produksi (no_pp, tgl_produksi, mesin_id, shift, created_by)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `;
      const resHeader = await client.query(insertHeader, [
        payload.no_pp, payload.tgl_produksi, payload.mesin_id, payload.shift, payload.user_id
      ]);
      const headerId = resHeader.rows[0].id;

      const insertDetail = `
        INSERT INTO tr_jam_produksi_detail (jam_produksi_id, jam_mulai, jam_selesai, qty_good, qty_waste)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (let item of payload.details) {
        await client.query(insertDetail, [
          headerId, item.jam_mulai, item.jam_selesai, item.qty_good, item.qty_waste
        ]);
      }

      await client.query(`UPDATE tr_pp SET status = 'IN_PROGRESS' WHERE no_pp = $1`, [payload.no_pp]);

      await client.query('COMMIT');
      return { id: headerId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = JamProduksiModel;