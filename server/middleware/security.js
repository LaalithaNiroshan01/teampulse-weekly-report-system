const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

/**
 * Recursive sanitizer to neutralize NoSQL injection attempts.
 * Strips or cleans object keys starting with '$' or containing '.'
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value;
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

// Validate MongoDB ObjectIDs before queries run to eliminate CastError 500s
const validateObjectId = (paramName = 'id') => {
  return (req, res, next, val) => {
    const idToTest = val !== undefined ? val : req.params?.[paramName];
    if (idToTest && !mongoose.Types.ObjectId.isValid(idToTest)) {
      return res.status(400).json({
        success: false,
        message: `Invalid identifier format for '${paramName}'. Must be a valid 24-char hex string.`
      });
    }
    next();
  };
};

/**
 * Validate that an external URL uses only safe web protocols (http or https).
 * Blocks javascript:, data:, and vbscript: XSS injection vectors.
 */
const isValidSafeUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  // Quick protocol check before full URL parsing
  if (!/^(https?:\/\/)/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Rate limiters configured for sensitive endpoints.
 * Skipped automatically during test runs for rapid execution.
 */
const isTestEnv = () => process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    success: false,
    message: 'AI query limit reached. Please wait a moment before sending more queries.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnv,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

module.exports = {
  sanitizeInput,
  validateObjectId,
  isValidSafeUrl,
  authLimiter,
  aiLimiter,
  apiLimiter
};
