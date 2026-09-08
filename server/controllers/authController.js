const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

// Pre-computed dummy hash to mitigate timing-based user enumeration attacks
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Handle new user registration.
 * Default role is restricted to 'member' to prevent privilege escalation.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, title, department } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const user = await User.create({
      name: (name || '').trim(),
      email: normalizedEmail,
      password,
      role: ROLES.MEMBER,
      title: (title || 'Software Engineer').trim(),
      department: (department || 'Engineering').trim()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user credentials and return a signed JWT.
 * Mitigates timing discrepancies when account is not found.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      // Execute dummy comparison to equalize response timing with valid accounts
      await bcrypt.compare(password || '', DUMMY_HASH);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your manager.'
      });
    }

    const isMatch = await user.comparePassword(password || '');
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return current authenticated user session details
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeObject()
  });
};

module.exports = {
  register,
  login,
  getMe
};
