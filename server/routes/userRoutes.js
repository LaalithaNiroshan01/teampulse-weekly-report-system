const express = require('express');
const router = express.Router();
const {
  getUsers,
  inviteUser,
  updateUserRole,
  toggleUserStatus,
  getMemberProfile
} = require('../controllers/userController');
const { verifyToken, requireManager } = require('../middleware/auth');
const { validateInviteUser, validateRoleUpdate } = require('../middleware/validation');
const { validateObjectId } = require('../middleware/security');

// User operations require authentication
router.use(verifyToken);

// Validate MongoDB ObjectId on all :id route segments
router.param('id', validateObjectId('id'));

// Manager-only team management routes
router.get('/', requireManager, getUsers);
router.post('/invite', requireManager, validateInviteUser, inviteUser);
router.patch('/:id/role', requireManager, validateRoleUpdate, updateUserRole);
router.patch('/:id/status', requireManager, toggleUserStatus);

// Member profile & report portfolio (accessible by the account owner or any manager)
router.get('/:id/profile', getMemberProfile);

module.exports = router;
