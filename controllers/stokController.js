const StokModel = require('../models/stokModel');

const getRekapStok = async (req, res) => {
  try {
    const { bulan, tahun, gudang_id } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({
        success: false,
        message: 'Parameter bulan dan tahun wajib diisi'
      });
    }

    const data = await StokModel.getRekapStok(bulan, tahun, gudang_id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data rekap stok',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getRekapStok };