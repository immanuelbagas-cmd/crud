const db = require('../config/db');
const generateNoPP = require('../utils/generateNoPP');

// Get All Data PP
const getPP = async (req, res) => {
  try {
    const query = `
      SELECT 
        pp.id,
        pp.no_pp,
        pp.no_po_sakti,
        COALESCE(pp.jenis_foil, p.jenis_foil) AS jenis_foil,
        pp.qty,
        pp.status_pp,
        pp.created_at
      FROM tr_perintah_produksi pp
      LEFT JOIN ms_produk_foil p ON pp.produk_id = p.id
      ORDER BY pp.id DESC
    `;
    const result = await db.query(query);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create PP
const createPP = async (req, res) => {
  try {
    const { no_po_sakti, produk_id, qty } = req.body;
    const jenis_foil_baru = (req.body.jenis_foil_baru || req.body.jenis_foil_kustom || '').trim();

    if (!no_po_sakti || !qty) {
      return res.status(400).json({ success: false, message: 'Nomor PO dan Qty wajib diisi!' });
    }

    let finalProdukId = null;
    let namaJenisFoil = '';

    if (String(produk_id).toUpperCase() === 'CUSTOM' || !produk_id) {
      if (!jenis_foil_baru) {
        return res.status(400).json({ success: false, message: 'Nama jenis foil baru wajib diisi!' });
      }

      namaJenisFoil = jenis_foil_baru;

      const checkFoil = await db.query(
        'SELECT id, jenis_foil FROM ms_produk_foil WHERE LOWER(jenis_foil) = LOWER($1)',
        [namaJenisFoil]
      );

      if (checkFoil.rows.length > 0) {
        finalProdukId = checkFoil.rows[0].id;
      } else {
        const insertFoil = await db.query(
          'INSERT INTO ms_produk_foil (jenis_foil) VALUES ($1) RETURNING id',
          [namaJenisFoil]
        );
        finalProdukId = insertFoil.rows[0].id;
      }
    } else {
      finalProdukId = parseInt(produk_id, 10);
      const getFoil = await db.query('SELECT jenis_foil FROM ms_produk_foil WHERE id = $1', [finalProdukId]);
      if (getFoil.rows.length > 0) {
        namaJenisFoil = getFoil.rows[0].jenis_foil;
      }
    }

    const no_pp = await generateNoPP(no_po_sakti);

    const result = await db.query(
      `INSERT INTO tr_perintah_produksi (no_pp, no_po_sakti, produk_id, jenis_foil, qty, status_pp)
       VALUES ($1, $2, $3, $4, $5, 'DRAFT') RETURNING *`,
      [no_pp, no_po_sakti, finalProdukId, namaJenisFoil, qty]
    );

    return res.status(201).json({
      success: true,
      message: 'Perintah Produksi Berhasil Dibuat',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('ERROR CREATE PP:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ACC PP
const accPP = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_acc } = req.body;
    await db.query('UPDATE tr_perintah_produksi SET status_pp = $1 WHERE id = $2', [status_acc || 'ACC_PIMPINAN', id]);
    return res.status(200).json({ success: true, message: 'Status ACC PP Berhasil Diperbarui' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPP, createPP, accPP };