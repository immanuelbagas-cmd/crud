const Cart = require('../models/Cart');

// @desc    Membuat Payment Intent Stripe dari Keranjang Belanja
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    // Inisialisasi Stripe di dalam handler
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // 1. Ambil keranjang belanja milik user
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja Anda kosong' });
    }

    // 2. Hitung total harga dari keranjang (diubah ke cents)
    const totalAmount = Math.round(cart.totalPrice * 100);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Jumlah pembayaran tidak valid' });
    }

    // 3. Buat Payment Intent melalui Stripe API
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        cartId: cart._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4. Kirim clientSecret ke response
    res.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: cart.totalPrice,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Skenario konfirmasi keranjang setelah pembayaran berhasil
// @route   POST /api/payment/success
// @access  Private
const handlePaymentSuccess = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }

    res.json({ message: 'Pembayaran berhasil dikonfirmasi dan keranjang telah dikosongkan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  handlePaymentSuccess,
};