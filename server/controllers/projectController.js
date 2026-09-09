const mongoose = require('mongoose');
const Project = require('../models/Project');
const Report = require('../models/Report');

/**
 * Escape regular expression special characters to protect against ReDoS.
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Fetch active projects with associated usage metrics.
 */
const getProjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    const projects = await Project.find(filter)
      .populate('assignedMembers', 'name email title')
      .sort({ name: 1 });

    // Calculate report counts per project for management insight
    const projectStats = await Report.aggregate([
      { $match: { projectId: { $ne: null } } },
      { $group: { _id: '$projectId', reportCount: { $sum: 1 } } }
    ]);

    const countMap = {};
    projectStats.forEach((p) => {
      countMap[p._id.toString()] = p.reportCount;
    });

    const enrichedProjects = projects.map((proj) => ({
      ...proj.toObject(),
      reportCount: countMap[proj._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: enrichedProjects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project category with unique name enforcement.
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, color, assignedMembers } = req.body;
    const trimmedName = (name || '').trim();

    if (!trimmedName) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    // Secure case-insensitive search with escaped regex
    const safeRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');
    const existing = await Project.findOne({ name: safeRegex });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A project with this name already exists'
      });
    }

    const project = await Project.create({
      name: trimmedName,
      description: (description || '').trim(),
      color: color || '#3B82F6',
      assignedMembers: Array.isArray(assignedMembers) ? assignedMembers : [],
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project metadata, ensuring no name collision with other projects.
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { name, description, color, isActive, assignedMembers } = req.body;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name) {
      const trimmedName = name.trim();
      const safeRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');
      const duplicate = await Project.findOne({
        _id: { $ne: project._id },
        name: safeRegex
      });
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Another project already has this name' });
      }
      project.name = trimmedName;
    }

    if (description !== undefined) project.description = description.trim();
    if (color !== undefined) project.color = color;
    if (isActive !== undefined) project.isActive = Boolean(isActive);
    if (assignedMembers !== undefined) project.assignedMembers = Array.isArray(assignedMembers) ? assignedMembers : [];

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete or soft-deactivate a project.
 * If reports reference this project, soft-deactivate to maintain report audit history.
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const usageCount = await Report.countDocuments({ projectId: project._id });

    if (usageCount > 0) {
      // Soft-deactivate to protect historical references
      project.isActive = false;
      await project.save();

      return res.json({
        success: true,
        message: `Project has ${usageCount} associated report(s). It has been deactivated to preserve history.`,
        data: project
      });
    }

    await Project.findByIdAndDelete(project._id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
