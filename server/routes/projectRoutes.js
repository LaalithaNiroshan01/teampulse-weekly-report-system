const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { verifyToken, requireManager } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const { validateObjectId } = require('../middleware/security');

// All project interactions require an active user session
router.use(verifyToken);

// Validate MongoDB ObjectId on :id parameters
router.param('id', validateObjectId('id'));

// Project listing (all users) and creation (managers only)
router.route('/')
  .get(getProjects)
  .post(requireManager, validateProject, createProject);

// Project updates and deletions are strictly restricted to managers
router.route('/:id')
  .put(requireManager, validateProject, updateProject)
  .delete(requireManager, deleteProject);

module.exports = router;
