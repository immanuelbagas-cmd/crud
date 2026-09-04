const db = require('../config/db');

class StokModel {
  static async getRekapStok(bulan, tahun, gudangId) {
    let query = `
      SELECT 
        s.id,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        g.nama_gudang,
        s.periode_bulan,
        s.periode_tahun,
        s.saldo_awal,
        s.qty_debit,
        s.qty_kredit,
        s.saldo_akhir
      FROM tr_stok_bulanan s
      JOIN ms_barang b ON s.barang_id = b.id
      JOIN ms_gudang g ON s.gudang_id = g.id
      WHERE s.periode_bulan = $1 AND s.periode_tahun = $2
    `;

    const params = [parseInt(bulan), parseInt(tahun)];

    if (gudangId) {
      query += ` AND s.gudang_id = $3`;
      params.push(parseInt(gudangId));
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = StokModel;