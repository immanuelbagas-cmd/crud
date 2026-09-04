const db = require('../config/db');

// Get All Master Foil
const getProdukFoil = async (req, res) => {
  try {
    const result = await db.query('SELECT id, jenis_foil FROM ms_produk_foil ORDER BY jenis_foil ASC');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error Get Produk Foil:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Master Foil Baru
const createProdukFoil = async (req, res) => {
  try {
    const { jenis_foil } = req.body;
    if (!jenis_foil) {
      return res.status(400).json({ success: false, message: 'Jenis foil wajib diisi!' });
    }
    const result = await db.query(
      'INSERT INTO ms_produk_foil (jenis_foil) VALUES ($1) RETURNING *',
      [jenis_foil.trim()]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Master Foil
const updateProdukFoil = async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis_foil } = req.body;
    const result = await db.query(
      'UPDATE ms_produk_foil SET jenis_foil = $1 WHERE id = $2 RETURNING *',
      [jenis_foil, id]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Master Foil
const deleteProdukFoil = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ms_produk_foil WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProdukFoil,
  createProdukFoil,
  updateProdukFoil,
  deleteProdukFoil
};