const OrderTask = require('../models/OrderTask');

// @desc    Buat tugas pesanan baru
// @route   POST /api/tasks
// @access  Private
const createOrderTask = async (req, res) => {
  try {
    const { title, description, category, trackingNumber } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Judul dan deskripsi wajib diisi' });
    }

    const task = await OrderTask.create({
      user: req.user._id, // Diambil dari JWT Token (authMiddleware)
      title,
      description,
      category: category || 'belanja',
      trackingNumber: trackingNumber || '',
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ambil semua tugas pengguna (dengan fitur filter status & kategori)
// @route   GET /api/tasks
// @access  Private
const getOrderTasks = async (req, res) => {
  try {
    const { status, category } = req.query;

    // Filter berdasarkan pengguna yang sedang login
    let filter = { user: req.user._id };

    // Saring berdasarkan status jika disediakan di query params (?status=terkirim)
    if (status) {
      filter.status = status;
    }

    // Saring berdasarkan kategori jika disediakan di query params (?category=belanja)
    if (category) {
      filter.category = category;
    }

    const tasks = await OrderTask.find(filter).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ambil satu tugas berdasarkan ID
// @route   GET /api/tasks/:id
// @access  Private
const getOrderTaskById = async (req, res) => {
  try {
    const task = await OrderTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Memastikan pengguna hanya bisa mengakses tugas miliknya sendiri
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Akses ditolak ke tugas ini' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Perbarui detail tugas atau ubah status (selesai/tertunda)
// @route   PUT /api/tasks/:id
// @access  Private
const updateOrderTask = async (req, res) => {
  try {
    const task = await OrderTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Verifikasi kepemilikan tugas
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Update field yang dikirimkan
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.category = req.body.category || task.category;
    task.status = req.body.status || task.status;
    task.trackingNumber = req.body.trackingNumber !== undefined ? req.body.trackingNumber : task.trackingNumber;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hapus tugas pesanan berdasarkan ID
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteOrderTask = async (req, res) => {
  try {
    const task = await OrderTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Verifikasi kepemilikan tugas
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    await task.deleteOne();
    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrderTask,
  getOrderTasks,
  getOrderTaskById,
  updateOrderTask,
  deleteOrderTask,
};