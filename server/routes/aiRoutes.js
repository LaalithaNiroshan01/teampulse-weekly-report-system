const express = require('express');
const router = express.Router();
const { chatWithReports } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');

// Ensure only authenticated users can interact with AI reporting insights
router.use(verifyToken);

// Rate-limited AI completion query endpoint to avoid rapid prompt abuse
router.post('/chat', aiLimiter, chatWithReports);

module.exports = router;
