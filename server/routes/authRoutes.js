const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

// Public authentication entry points - protected by rate limiting to mitigate brute-force attacks
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Authenticated session check
router.get('/me', verifyToken, getMe);

module.exports = router;
