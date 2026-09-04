const express = require('express');
const router = express.Router();
const jamProduksiController = require('../controllers/jamProduksiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, jamProduksiController.createJamProduksi);
router.get('/', verifyToken, jamProduksiController.getJamProduksi);
// PERBAIKAN: Hapus argumen 'jamProduksiController' yang dobel di bawah ini
router.delete('/:id', verifyToken, jamProduksiController.deleteJamProduksi);
router.put('/:id', verifyToken, jamProduksiController.deleteJamProduksi);

module.exports = router;