const express = require('express');
const router = express.Router();
const {
  createOrderTask,
  getOrderTasks,
  getOrderTaskById,
  updateOrderTask,
  deleteOrderTask,
} = require('../controllers/orderTaskController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute di bawah wajib menggunakan JWT Token
router.use(protect);

// Endpoint /api/tasks
router.route('/')
  .post(createOrderTask) // Buat tugas baru
  .get(getOrderTasks);   // Ambil semua tugas (dukung filter ?status=... & ?category=...)

// Endpoint /api/tasks/:id
router.route('/:id')
  .get(getOrderTaskById) // Ambil detail satu tugas
  .put(updateOrderTask)  // Perbarui detail / status tugas
  .delete(deleteOrderTask); // Hapus tugas

module.exports = router;