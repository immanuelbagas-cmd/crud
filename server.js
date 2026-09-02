const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Semua Routes Modul Proyek
const authRoutes = require('./routes/authRoutes');
const orderTaskRoutes = require('./routes/orderTaskRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const jamProduksiRoutes =  require('./routes/jamProduksiRoutes') // ISI

dotenv.config();
connectDB();

const app = express();

// Middleware Utama
app.use(express.json());
app.use(cors());

// Test Route Utama
app.get('/', (req, res) => {
  res.send('API E-Commerce Berhasil Dijalankan!');
});

// Pendaftaran Rute API (API Endpoints)
app.use('/api/auth', authRoutes);         // Autentikasi Pengguna
app.use('/api/tasks', orderTaskRoutes);     // CRUD OrderTask (Tracking Pesanan)
app.use('/api/products', productRoutes);   // Katalog Produk
app.use('/api/cart', cartRoutes);         // Keranjang Belanja
app.use('/api/payment', paymentRoutes);   // Pembayaran Stripe API
app.use('/api/',jamProduksiRoutes); // ISI


// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});