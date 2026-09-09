const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardCharts,
  getSideBySide,
  getRecentActivity
} = require('../controllers/dashboardController');
const { verifyToken, requireManager } = require('../middleware/auth');

router.use(verifyToken, requireManager);

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);
router.get('/side-by-side', getSideBySide);
router.get('/activity', getRecentActivity);

module.exports = router;
