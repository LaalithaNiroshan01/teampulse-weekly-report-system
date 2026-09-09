const ROLES = {
  MEMBER: 'member',
  MANAGER: 'manager'
};

const REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  NEEDS_CORRECTION: 'needs_correction',
  APPROVED: 'approved'
};

const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  REQUEST_CHANGES: 'request_changes'
};

const TASK_PRIORITY = ['Low', 'Medium', 'High', 'Urgent'];
const TASK_STATUS = ['Done', 'In Progress', 'Blocked'];

const HOURS_BREAKDOWN_KEYS = ['development', 'testing', 'meetings', 'documentation', 'other'];

module.exports = {
  ROLES,
  REPORT_STATUS,
  REVIEW_ACTIONS,
  TASK_PRIORITY,
  TASK_STATUS,
  HOURS_BREAKDOWN_KEYS
};
