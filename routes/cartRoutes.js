const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute keranjang wajib menggunakan JWT Token
router.use(protect);

router.route('/')
  .get(getCart)      // Ambil isi keranjang
  .post(addToCart);  // Tambah item ke keranjang

router.delete('/:productId', removeFromCart); // Hapus item tertentu dari keranjang

module.exports = router;