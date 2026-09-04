const db = require('../config/db');

// Get All Master Foil
exports.getFoil = async (req, res) => {
  try {
    const result = await db.query('SELECT id, jenis_foil FROM ms_produk_foil ORDER BY jenis_foil ASC');
    return res.status(200).json({ 
      success: true, 
      data: result.rows 
    });
  } catch (error) {
    console.error('ERROR API GET /api/foil:', error.message);
    // Kembalikan array kosong agar frontend tidak crash
    return res.status(200).json({ 
      success: false, 
      message: error.message, 
      data: [] 
    });
  }
};