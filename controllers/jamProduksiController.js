const JamProduksiModel = require('../models/jamProduksiModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getAll = async (req, res, next) => {
  try {
    const data = await JamProduksiModel.findAll();
    return successResponse(res, "Data jam produksi berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { no_pp, tgl_produksi, mesin_id, shift, details } = req.body;
    if (!no_pp || !details || details.length === 0) {
      return errorResponse(res, "No PP dan Detail Jam Produksi wajib diisi", 400);
    }

    const payload = { ...req.body, user_id: req.user.username };
    const result = await JamProduksiModel.createTransaction(payload);
    return successResponse(res, "Jam produksi berhasil disimpan", result, 201);
  } catch (error) {
    next(error);
  }
};