const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Route publik untuk melihat daftar dan detail produk
router.get('/', getProducts);
router.get('/:id', getProductById);

// Route khusus untuk menambah produk (perlu autentikasi)
router.post('/', protect, createProduct);

module.exports = router;