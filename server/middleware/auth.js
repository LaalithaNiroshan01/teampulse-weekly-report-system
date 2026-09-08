const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth');
const User = require('../models/User');
const { ROLES, REPORT_STATUS } = require('../config/constants');

/**
 * Verify JWT token and attach authenticated user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Role-Based Access Control middleware
 * @param {string|string[]} roles - allowed roles (e.g. 'manager' or ['manager'])
 */
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowed.join(' or ')}.`
      });
    }

    next();
  };
};

/**
 * Helper specifically for Manager / Admin access
 */
const requireManager = requireRole([ROLES.MANAGER]);

/**
 * Guard draft content privacy:
 * If a report is in Draft status, only the report owner can view its content.
 * Managers can see metadata in dashboard/lists, but cannot read draft report body.
 */
const checkDraftPrivacy = (report, user) => {
  if (report.status === REPORT_STATUS.DRAFT) {
    const isOwner = report.userId.toString() === user._id.toString();
    return isOwner;
  }
  return true; // submitted, needs_correction, approved can be viewed by manager or owner
};

module.exports = {
  verifyToken,
  requireRole,
  requireManager,
  checkDraftPrivacy
};
