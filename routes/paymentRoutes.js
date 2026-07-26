const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handlePaymentSuccess,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute pembayaran wajib menggunakan JWT Token
router.use(protect);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/success', handlePaymentSuccess);

module.exports = router;