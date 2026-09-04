const JamProduksiModel = require('../models/jamProduksiModel');
const db = require('../config/db');

const createJamProduksi = async (req, res) => {
  try {
    let { mesin_id, nama_mesin_baru, tanggal, jam_mulai, jam_selesai, keterangan } = req.body;

    if (!mesin_id || !tanggal || !jam_mulai || !jam_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Data mesin, tanggal, jam mulai, dan jam selesai wajib diisi!'
      });
    }

    // Jika user memilih "+ Tambah Mesin Baru..."
    if (mesin_id === 'NEW') {
      if (!nama_mesin_baru || nama_mesin_baru.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama mesin baru wajib diisi!'
        });
      }

      // Generate kode mesin otomatis
      const kodeMesin = 'MSN-' + Math.floor(1000 + Math.random() * 9000);

      // Simpan mesin baru ke tabel ms_mesin
      const newMesin = await db.query(
        'INSERT INTO ms_mesin (kode_mesin, nama_mesin, lokasi) VALUES ($1, $2, $3) RETURNING id',
        [kodeMesin, nama_mesin_baru.trim(), 'Line Utama']
      );

      // Ambil ID dari mesin yang baru dibuat
      mesin_id = newMesin.rows[0].id;
    }

    // Simpan Transaksi Jam Produksi dengan mesin_id yang valid
    const newRecord = await JamProduksiModel.create({
      mesin_id,
      tanggal,
      jam_mulai,
      jam_selesai,
      keterangan
    });

    return res.status(201).json({
      success: true,
      message: 'Data jam produksi berhasil dicatat',
      data: newRecord
    });
  } catch (error) {
    console.error('Error createJamProduksi:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getJamProduksi = async (req, res) => {
  try {
    const data = await JamProduksiModel.getAll();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data jam produksi',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fitur Delete Jam Produksi
const deleteJamProduksi = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tr_jam_produksi WHERE id = $1', [id]);
    return res.status(200).json({
      success: true,
      message: 'Data jam produksi berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createJamProduksi, getJamProduksi, deleteJamProduksi };