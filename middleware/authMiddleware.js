const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Memeriksa apakah token dikirim melalui Header Authorization (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil data user dari database berdasarkan ID di token (tanpa membawa password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Pengguna tidak ditemukan' });
      }

      next(); // Lanjut ke controller berikutnya
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token tidak valid atau kadaluwarsa' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }
};

module.exports = { protect };