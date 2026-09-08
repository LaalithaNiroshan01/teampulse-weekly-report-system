const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  submitReport,
  reviewReport,
  getReportVersions,
  deleteReport
} = require('../controllers/reportController');
const { verifyToken, requireManager } = require('../middleware/auth');
const { validateReviewAction } = require('../middleware/validation');
const { validateObjectId } = require('../middleware/security');

// Global authentication gate for all report interactions
router.use(verifyToken);

// Validate MongoDB ObjectId on any route containing :id to prevent CastErrors
router.param('id', validateObjectId('id'));

// Collection endpoints: query list with RBAC visibility and initialize new reports
router.route('/')
  .get(getReports)
  .post(createReport);

// Individual report lifecycle endpoints
router.route('/:id')
  .get(getReportById)
  .put(updateReport)
  .delete(deleteReport);

// State transition workflows
router.post('/:id/submit', submitReport);
router.post('/:id/review', requireManager, validateReviewAction, reviewReport);
router.get('/:id/versions', getReportVersions);

module.exports = router;
