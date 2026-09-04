const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      });
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const secretKey = process.env.JWT_SECRET || 'secret_jwt_inds';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secretKey,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nama: user.nama_lengkap,
          role: user.role
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { login };



// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Fungsi pembantu untuk membuat JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d', // Token berlaku selama 30 hari
//   });
// };

// // @desc    Mendaftarkan pengguna baru
// // @route   POST /api/auth/register
// // @access  Public
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // 1. Validasi input sederhana
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Harap isi semua kolom' });
//     }

//     // 2. Cek apakah email sudah terdaftar
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'Email sudah terdaftar' });
//     }

//     // 3. Buat pengguna baru (password otomatis di-hash oleh Mongoose Pre-save Hook)
//     const user = await User.create({
//       name,
//       email,
//       password,
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(400).json({ message: 'Gagal membuat pengguna' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Autentikasi pengguna & dapatkan token (Login)
// // @route   POST /api/auth/login
// // @access  Public
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Cek apakah user ada (sertakan password untuk dicek)
//     const user = await User.findOne({ email }).select('+password');

//     // 2. Verifikasi password dengan method matchPassword di model User
//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ message: 'Email atau password salah' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Mendapatkan profil pengguna yang sedang login
// // @route   GET /api/auth/profile
// // @access  Private (Membutuhkan JWT)
// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (user) {
//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(404).json({ message: 'Pengguna tidak ditemukan' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile,
// };