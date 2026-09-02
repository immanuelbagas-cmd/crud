const express = require('express');
const router = express.Router();
const controller = require('../controllers/stokBulananController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/rekap', controller.getStokPeriode);
router.post('/closing', controller.prosesClosingBulan);

module.exports = router;