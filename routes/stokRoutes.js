const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');
const verifyToken = require('../middleware/authMiddleware');

// Endpoint dilindungi oleh middleware verifyToken
router.get('/rekap', verifyToken, stokController.getRekapStok);

module.exports = router;