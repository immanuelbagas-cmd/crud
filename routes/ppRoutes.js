const express = require('express');
const router = express.Router();

// Import Controllers
const ppController = require('../controllers/ppController');
const foilController = require('../controllers/produkFoilController');
const verifyToken = require('../middleware/authMiddleware');

// Route Produk Foil (Master Data)
router.get('/foil', verifyToken, foilController.getProdukFoil);
router.post('/foil', verifyToken, foilController.createProdukFoil);
router.put('/foil/:id', verifyToken, foilController.updateProdukFoil);
router.delete('/foil/:id', verifyToken, foilController.deleteProdukFoil);

// Route Perintah Produksi (PP)
router.get('/pp', verifyToken, ppController.getPP); // <-- Pastikan getPP tidak bernilai undefined
router.post('/pp', verifyToken, ppController.createPP);
router.put('/pp/acc/:id', verifyToken, ppController.accPP);

module.exports = router;