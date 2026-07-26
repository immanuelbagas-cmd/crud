const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Ambil keranjang belanja milik pengguna yang sedang login
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price imageUrl');

    if (!cart) {
      // Jika keranjang belum ada, buat keranjang kosong baru
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tambah produk ke keranjang belanja
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // Cek keberadaan produk
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Cari keranjang belanja user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Cek apakah item sudah ada di keranjang
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Jika sudah ada, tambahkan jumlah kuantitas
      cart.items[itemIndex].quantity += qty;
    } else {
      // Jika belum ada, tambahkan item baru
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
    }

    await cart.save();
    
    // Kembalikan data keranjang beserta detail produk
    cart = await cart.populate('items.product', 'name price imageUrl');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hapus item dari keranjang belanja berdasarkan ID Produk
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    }

    // Filter item, buang yang sesuai dengan productId
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    cart = await cart.populate('items.product', 'name price imageUrl');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};