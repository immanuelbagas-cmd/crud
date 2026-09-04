const db = require('../config/db');

// --- 1. MARKETING: INPUT PO SIMPG ---
const createPOSimpg = async (req, res) => {
  try {
    const { no_po_sakti, nama_customer, tanggal_po } = req.body;
    const result = await db.query(
      'INSERT INTO tr_po_simpg (no_po_sakti, nama_customer, tanggal_po) VALUES ($1, $2, $3) RETURNING *',
      [no_po_sakti, nama_customer, tanggal_po]
    );
    return res.status(201).json({ success: true, message: 'PO SIMPG Berhasil Diinput', data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPOSimpg = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tr_po_simpg ORDER BY id DESC');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. PENGADAAN: INPUT SURAT IZIN PEMBELIAN (SIP) ---
const createSIP = async (req, res) => {
  try {
    const { pemohon_dept, produk_id, qty_minta } = req.body;
    const no_sip = 'SIP-' + Math.floor(10000 + Math.random() * 90000);

    const result = await db.query(
      'INSERT INTO tr_sip_pengadaan (no_sip, pemohon_dept, produk_id, qty_minta) VALUES ($1, $2, $3, $4) RETURNING *',
      [no_sip, pemohon_dept, produk_id, qty_minta]
    );
    return res.status(201).json({ success: true, message: 'SIP Berhasil Diajukan', data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. DELIVERY: ENTRY SURAT JALAN (SP) ---
const createSuratJalan = async (req, res) => {
  try {
    const { pp_id, nama_driver, no_kendaraan } = req.body;
    const no_sp = 'SP-' + Math.floor(10000 + Math.random() * 90000);

    const result = await db.query(
      'INSERT INTO tr_surat_jalan (no_sp, pp_id, nama_driver, no_kendaraan, status_delivery) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [no_sp, pp_id, nama_driver, no_kendaraan, 'TERKIRIM']
    );

    // Update status PP menjadi Barang Terkirim
    await db.query('UPDATE tr_perintah_produksi SET status_pp = $1 WHERE id = $2', ['BARANG_TERKIRIM', pp_id]);

    return res.status(201).json({ success: true, message: 'Surat Jalan Berhasil Terbit & Barang Terkirim!', data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPOSimpg, getPOSimpg, createSIP, createSuratJalan };