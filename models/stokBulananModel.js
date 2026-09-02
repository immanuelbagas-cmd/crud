const db = require('../config/db');

class StokBulananModel {
  static async getStokByPeriode(bulan, tahun, gudangId) {
    const query = `
      SELECT 
        s.id, b.kode_barang, b.nama_barang, b.satuan, g.nama_gudang,
        s.periode_bulan, s.periode_tahun, s.saldo_awal, s.qty_debit, s.qty_kredit, s.saldo_akhir
      FROM tr_stok_bulanan s
      JOIN ms_barang b ON s.barang_id = b.id
      JOIN ms_gudang g ON s.gudang_id = g.id
      WHERE s.periode_bulan = $1 AND s.periode_tahun = $2 AND s.gudang_id = $3
      ORDER BY b.nama_barang ASC
    `;
    const result = await db.query(query, [bulan, tahun, gudangId]);
    return result.rows;
  }

  static async closingPeriode(bulanAsal, tahunAsal, bulanTujuan, tahunTujuan) {
    const query = `
      INSERT INTO tr_stok_bulanan (barang_id, gudang_id, periode_bulan, periode_tahun, saldo_awal)
      SELECT barang_id, gudang_id, $3 AS periode_bulan, $4 AS periode_tahun, saldo_akhir AS saldo_awal
      FROM tr_stok_bulanan
      WHERE periode_bulan = $1 AND periode_tahun = $2
      ON CONFLICT (barang_id, gudang_id, periode_bulan, periode_tahun) 
      DO UPDATE SET saldo_awal = EXCLUDED.saldo_awal;
    `;
    const result = await db.query(query, [bulanAsal, tahunAsal, bulanTujuan, tahunTujuan]);
    return result.rowCount;
  }
}

module.exports = StokBulananModel;