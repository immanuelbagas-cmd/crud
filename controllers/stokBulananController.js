const StokBulananModel = require('../models/stokBulananModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getStokPeriode = async (req, res, next) => {
  try {
    const { bulan, tahun, gudang_id } = req.query;
    if (!bulan || !tahun || !gudang_id) {
      return errorResponse(res, "Parameter bulan, tahun, dan gudang_id wajib diisi", 400);
    }

    const data = await StokBulananModel.getStokByPeriode(bulan, tahun, gudang_id);
    return successResponse(res, "Data rekap stok berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

exports.prosesClosingBulan = async (req, res, next) => {
  try {
    const { bulan_asal, tahun_asal, bulan_tujuan, tahun_tujuan } = req.body;
    const count = await StokBulananModel.closingPeriode(bulan_asal, tahun_asal, bulan_tujuan, tahun_tujuan);
    return successResponse(res, `Closing periode berhasil! ${count} barang dipindahkan.`);
  } catch (error) {
    next(error);
  }
};