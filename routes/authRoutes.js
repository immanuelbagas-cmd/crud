const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const {
//   registerUser,
//   loginUser,
//   getUserProfile,
// } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// // Endpoint Public
// router.post('/register', registerUser);
// router.post('/login', loginUser);

// // Endpoint Private (Menggunakan JWT Middleware)
// router.get('/profile', protect, getUserProfile);

// module.exports = router;