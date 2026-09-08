const { body, validationResult } = require('express-validator');
const { REVIEW_ACTIONS, REPORT_STATUS } = require('../config/constants');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth Validations
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Project Validations
const validateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim(),
  validate
];

// User Invite / Role Update Validations
const validateInviteUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['member', 'manager'])
    .withMessage('Role must be either member or manager'),
  body('title')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  validate
];

const validateRoleUpdate = [
  body('role')
    .isIn(['member', 'manager'])
    .withMessage('Role must be either member or manager'),
  validate
];

// Review Action Validation (Manager)
const validateReviewAction = [
  body('action')
    .isIn([REVIEW_ACTIONS.APPROVE, REVIEW_ACTIONS.REQUEST_CHANGES])
    .withMessage(`Action must be either '${REVIEW_ACTIONS.APPROVE}' or '${REVIEW_ACTIONS.REQUEST_CHANGES}'`),
  body('comment')
    .if(body('action').equals(REVIEW_ACTIONS.REQUEST_CHANGES))
    .trim()
    .notEmpty()
    .withMessage('A review comment explaining requested corrections is required when requesting changes'),
  validate
];

/**
 * Report Submission Validation:
 * Stricter than draft saving. Ensures all required standardized fields are present and valid.
 */
const validateReportSubmission = (reportData) => {
  const errors = [];

  if (!reportData.projectId) {
    errors.push({ field: 'projectId', message: 'Project/category selection is required for submission' });
  }

  if (!reportData.weekStartDate || !reportData.weekEndDate) {
    errors.push({ field: 'weekRange', message: 'Week date range is required' });
  }

  if (!Array.isArray(reportData.tasksCompleted) || reportData.tasksCompleted.length === 0) {
    errors.push({ field: 'tasksCompleted', message: 'At least one completed task entry is required' });
  } else {
    reportData.tasksCompleted.forEach((task, idx) => {
      if (!task.taskName || task.taskName.trim() === '') {
        errors.push({ field: `tasksCompleted[${idx}].taskName`, message: `Task #${idx + 1} name is required` });
      }
      if (task.plannedPercentage < 0 || task.plannedPercentage > 100) {
        errors.push({ field: `tasksCompleted[${idx}].plannedPercentage`, message: 'Planned percentage must be between 0 and 100' });
      }
      if (task.actualPercentage < 0 || task.actualPercentage > 100) {
        errors.push({ field: `tasksCompleted[${idx}].actualPercentage`, message: 'Actual percentage must be between 0 and 100' });
      }
    });
  }

  // Key Issue rule: at most one key issue
  if (Array.isArray(reportData.blockers)) {
    const keyIssuesCount = reportData.blockers.filter((b) => b.isKeyIssue).length;
    if (keyIssuesCount > 1) {
      errors.push({ field: 'blockers', message: 'Only one blocker can be flagged as the key issue' });
    }
  }

  // Key Achievement rule: at most one key achievement
  if (Array.isArray(reportData.achievements)) {
    const keyAchCount = reportData.achievements.filter((a) => a.isKeyAchievement).length;
    if (keyAchCount > 1) {
      errors.push({ field: 'achievements', message: 'Only one achievement can be flagged as the key achievement' });
    }
  }

  return errors;
};

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateProject,
  validateInviteUser,
  validateRoleUpdate,
  validateReviewAction,
  validateReportSubmission
};
