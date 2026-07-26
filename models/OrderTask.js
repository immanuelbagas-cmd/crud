const mongoose = require('mongoose');

const orderTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Judul tugas wajib diisi'],
      trim: true, // Contoh: "Lacak Pesanan #123"
    },
    description: {
      type: String,
      required: [true, 'Deskripsi tugas wajib diisi'], // Contoh: "Detail pengiriman ekspedisi"
    },
    category: {
      type: String,
      enum: ['belanja', 'mendesak', 'umum'],
      default: 'belanja',
    },
    status: {
      type: String,
      enum: ['tertunda', 'terkirim', 'selesai'],
      default: 'tertunda',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('OrderTask', orderTaskSchema);