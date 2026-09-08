const Report = require('../models/Report');
const Project = require('../models/Project');
const { submittedContent, period, weekInfo } = require('../services/reportAnalytics');
const { ROLES, REPORT_STATUS, REVIEW_ACTIONS } = require('../config/constants');
const { validateReportSubmission } = require('../middleware/validation');

/**
 * Strips potentially dangerous protocols (javascript:, vbscript:, data:)
 * from user-supplied documentation and PR links.
 */
const sanitizeLinks = (rawLinks) => {
  if (!Array.isArray(rawLinks)) return [];
  return rawLinks
    .filter((l) => l && typeof l === 'object' && typeof l.url === 'string')
    .map((l) => {
      const url = l.url.trim();
      const isSafeProtocol = /^(https?:\/\/)/i.test(url);
      return {
        title: (l.title || '').trim().slice(0, 150),
        url: isSafeProtocol ? url : ''
      };
    })
    .filter((l) => l.url.length > 0);
};

// Retrieve paginated reports with RBAC visibility rules applied.
// Team members only see their own reports.
// Managers see all reports, with draft contents redacted to respect work-in-progress privacy.
const getReports = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};

    // Enforce role-based query filter
    if (req.user.role === ROLES.MEMBER) {
      query.userId = req.user._id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.weekNumber) {
      query.weekNumber = parseInt(req.query.weekNumber, 10);
    }
    if (req.query.year) {
      query.year = parseInt(req.query.year, 10);
    }

    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    if (req.query.startDate || req.query.endDate) {
      const range = period(req.query);
      query.weekStartDate = { $lte: range.end };
      query.weekEndDate = { $gte: range.start };
    }

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('userId', 'name email title department')
      .populate('projectId', 'name color')
      .populate('latestReviewedBy', 'name email')
      .sort({ year: -1, weekNumber: -1, createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Redact draft content if someone other than the owner is viewing the list
    const sanitizedReports = reports.map((rpt) => {
      const isOwner = rpt.userId && rpt.userId._id.toString() === req.user._id.toString();
      if (rpt.status === REPORT_STATUS.DRAFT && !isOwner) {
        return {
          _id: rpt._id,
          userId: rpt.userId,
          projectId: rpt.projectId,
          weekStartDate: rpt.weekStartDate,
          weekEndDate: rpt.weekEndDate,
          weekNumber: rpt.weekNumber,
          year: rpt.year,
          status: rpt.status,
          updatedAt: rpt.updatedAt,
          isDraftPrivate: true
        };
      }
      return isOwner ? rpt : submittedContent(rpt);
    });

    res.json({
      success: true,
      data: sanitizedReports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fetch full details of a specific report.
// Access is restricted to the author or managers.
// Draft content remains strictly confidential to the author until formally submitted.
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name email title department')
      .populate('projectId', 'name color description')
      .populate('latestReviewedBy', 'name email')
      .populate('versions.reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const isOwner = report.userId._id.toString() === req.user._id.toString();
    const isManager = req.user.role === ROLES.MANAGER;

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reports.'
      });
    }

    // Privacy boundary: unsubmitted drafts cannot be inspected by managers
    if (report.status === REPORT_STATUS.DRAFT && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Draft reports are private to their author and cannot be viewed until submitted.'
      });
    }

    res.json({
      success: true,
      data: isOwner ? report : submittedContent(report.toObject())
    });
  } catch (error) {
    next(error);
  }
};

// Create a new report record initialized in 'draft' status.
// Enforces single-key-issue and single-key-achievement rules, and sanitizes reference links.
const createReport = async (req, res, next) => {
  try {
    const {
      weekStartDate,
      weekEndDate,
      weekNumber,
      year,
      projectId,
      tasksCompleted,
      tasksPlannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes,
      links
    } = req.body;

    // Enforce business constraint: at most one key issue flagged
    let cleanedBlockers = blockers || [];
    let foundKeyIssue = false;
    cleanedBlockers = cleanedBlockers.map((b) => {
      if (b.isKeyIssue) {
        if (!foundKeyIssue) {
          foundKeyIssue = true;
          return { ...b, isKeyIssue: true };
        }
        return { ...b, isKeyIssue: false };
      }
      return b;
    });

    // Enforce business constraint: at most one key achievement flagged
    let cleanedAchievements = achievements || [];
    let foundKeyAch = false;
    cleanedAchievements = cleanedAchievements.map((a) => {
      if (a.isKeyAchievement) {
        if (!foundKeyAch) {
          foundKeyAch = true;
          return { ...a, isKeyAchievement: true };
        }
        return { ...a, isKeyAchievement: false };
      }
      return a;
    });

    const report = await Report.create({
      userId: req.user._id,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      weekNumber: parseInt(weekNumber, 10),
      year: parseInt(year, 10),
      projectId: projectId || null,
      status: REPORT_STATUS.DRAFT,
      tasksCompleted: tasksCompleted || [],
      tasksPlannedNextWeek: tasksPlannedNextWeek || [],
      blockers: cleanedBlockers,
      achievements: cleanedAchievements,
      hoursBreakdown: hoursBreakdown || {},
      notes: notes || '',
      links: sanitizeLinks(links),
      versions: []
    });

    res.status(201).json({
      success: true,
      message: 'Report saved as draft',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Modify an existing draft or a report returned for corrections.
// Submitted or approved reports cannot be edited directly; they must undergo manager review.
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Only the authoring member can modify report contents
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own reports.'
      });
    }

    // Protect immutable state: prevent modifications while under review or after final approval
    if (
      report.status !== REPORT_STATUS.DRAFT &&
      report.status !== REPORT_STATUS.NEEDS_CORRECTION
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a report that is currently in '${report.status}' status.`
      });
    }

    const {
      weekStartDate,
      weekEndDate,
      weekNumber,
      year,
      projectId,
      tasksCompleted,
      tasksPlannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes,
      links
    } = req.body;

    let cleanedBlockers = blockers !== undefined ? blockers : report.blockers;
    let foundKeyIssue = false;
    cleanedBlockers = cleanedBlockers.map((b) => {
      if (b.isKeyIssue) {
        if (!foundKeyIssue) {
          foundKeyIssue = true;
          return { ...b, isKeyIssue: true };
        }
        return { ...b, isKeyIssue: false };
      }
      return b;
    });

    let cleanedAchievements = achievements !== undefined ? achievements : report.achievements;
    let foundKeyAch = false;
    cleanedAchievements = cleanedAchievements.map((a) => {
      if (a.isKeyAchievement) {
        if (!foundKeyAch) {
          foundKeyAch = true;
          return { ...a, isKeyAchievement: true };
        }
        return { ...a, isKeyAchievement: false };
      }
      return a;
    });

    if (weekStartDate) report.weekStartDate = new Date(weekStartDate);
    if (weekEndDate) report.weekEndDate = new Date(weekEndDate);
    if (weekNumber !== undefined) report.weekNumber = parseInt(weekNumber, 10);
    if (year !== undefined) report.year = parseInt(year, 10);
    if (projectId !== undefined) report.projectId = projectId || null;
    if (tasksCompleted !== undefined) report.tasksCompleted = tasksCompleted;
    if (tasksPlannedNextWeek !== undefined) report.tasksPlannedNextWeek = tasksPlannedNextWeek;
    if (blockers !== undefined) report.blockers = cleanedBlockers;
    if (achievements !== undefined) report.achievements = cleanedAchievements;
    if (hoursBreakdown !== undefined) report.hoursBreakdown = hoursBreakdown;
    if (notes !== undefined) report.notes = notes;
    if (links !== undefined) report.links = sanitizeLinks(links);

    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Formally submit a report for managerial sign-off.
// Validates all required fields, attaches an immutable version snapshot, and transitions status to 'submitted'.
const submitReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only submit your own report.'
      });
    }

    // State machine check: only drafts or reports needing correction can be submitted
    if (
      report.status !== REPORT_STATUS.DRAFT &&
      report.status !== REPORT_STATUS.NEEDS_CORRECTION
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition. Cannot submit a report in '${report.status}' status.`
      });
    }

    // Incorporate any last-minute payload updates passed alongside the submit request
    if (req.body && Object.keys(req.body).length > 0) {
      const {
        projectId,
        tasksCompleted,
        tasksPlannedNextWeek,
        blockers,
        achievements,
        hoursBreakdown,
        notes,
        links
      } = req.body;
      if (projectId !== undefined) report.projectId = projectId;
      if (tasksCompleted !== undefined) report.tasksCompleted = tasksCompleted;
      if (tasksPlannedNextWeek !== undefined) report.tasksPlannedNextWeek = tasksPlannedNextWeek;
      if (blockers !== undefined) report.blockers = blockers;
      if (achievements !== undefined) report.achievements = achievements;
      if (hoursBreakdown !== undefined) report.hoursBreakdown = hoursBreakdown;
      if (notes !== undefined) report.notes = notes;
      if (links !== undefined) report.links = sanitizeLinks(links);
    }

    // Strict validation check required before formal submission
    const validationErrors = validateReportSubmission(report);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Submission validation failed. Please fill in all required fields.',
        errors: validationErrors
      });
    }

    const project = await Project.findById(report.projectId);
    if (!project || !project.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Select an active project before submission'
      });
    }

    // Construct an immutable snapshot of this version to preserve historical auditability
    const nextVersionNumber = (report.versions.length || 0) + 1;

    const snapshotData = {
      weekStartDate: report.weekStartDate,
      weekEndDate: report.weekEndDate,
      weekNumber: report.weekNumber,
      year: report.year,
      projectId: report.projectId,
      project: { _id: project._id, name: project.name, color: project.color },
      tasksCompleted: report.tasksCompleted.map((t) => (t.toObject ? t.toObject() : t)),
      tasksPlannedNextWeek: report.tasksPlannedNextWeek.map((t) => (t.toObject ? t.toObject() : t)),
      blockers: report.blockers.map((b) => (b.toObject ? b.toObject() : b)),
      achievements: report.achievements.map((a) => (a.toObject ? a.toObject() : a)),
      hoursBreakdown: report.hoursBreakdown,
      notes: report.notes,
      links: report.links
    };

    report.versions.push({
      versionNumber: nextVersionNumber,
      submittedAt: new Date(),
      snapshot: snapshotData,
      reviewAction: 'pending',
      reviewComment: ''
    });

    report.status = REPORT_STATUS.SUBMITTED;
    await report.save();

    res.json({
      success: true,
      message: `Report submitted for review as Version ${nextVersionNumber}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Manager review decision handler (Approve or Request Changes).
// Updates overall report status and logs review audit metadata into the active version snapshot.
const reviewReport = async (req, res, next) => {
  try {
    const { action, comment } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== REPORT_STATUS.SUBMITTED) {
      return res.status(400).json({
        success: false,
        message: `Only submitted reports can be reviewed. Current status is '${report.status}'.`
      });
    }

    const latestVersion = report.versions[report.versions.length - 1];

    if (action === REVIEW_ACTIONS.APPROVE) {
      report.status = REPORT_STATUS.APPROVED;
      report.latestReviewComment = comment || 'Approved by manager';
      report.latestReviewedAt = new Date();
      report.latestReviewedBy = req.user._id;

      if (latestVersion) {
        latestVersion.reviewAction = 'approved';
        latestVersion.reviewComment = comment || 'Approved by manager';
        latestVersion.reviewedBy = req.user._id;
        latestVersion.reviewedAt = new Date();
      }
    } else if (action === REVIEW_ACTIONS.REQUEST_CHANGES) {
      if (!comment || comment.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'A general comment explaining the requested changes is required.'
        });
      }

      report.status = REPORT_STATUS.NEEDS_CORRECTION;
      report.latestReviewComment = comment.trim();
      report.latestReviewedAt = new Date();
      report.latestReviewedBy = req.user._id;

      if (latestVersion) {
        latestVersion.reviewAction = 'changes_requested';
        latestVersion.reviewComment = comment.trim();
        latestVersion.reviewedBy = req.user._id;
        latestVersion.reviewedAt = new Date();
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid review action: ${action}`
      });
    }

    await report.save();

    res.json({
      success: true,
      message: action === REVIEW_ACTIONS.APPROVE
        ? 'Report approved successfully'
        : 'Changes requested. Report sent back to member for correction.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve version audit history and point-in-time snapshots for a given report
const getReportVersions = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('versions.reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const isOwner = report.userId.toString() === req.user._id.toString();
    const isManager = req.user.role === ROLES.MANAGER;

    if (!isOwner && !isManager) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: report.versions
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a report.
// Strict business invariant: ONLY reports in 'draft' status may be removed.
// Submitted, approved, or historical reports are preserved for audit integrity.
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const isOwner = report.userId.toString() === req.user._id.toString();
    const isManager = req.user.role === ROLES.MANAGER;

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own draft reports.'
      });
    }

    if (report.status !== REPORT_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Only draft reports can be deleted. Submitted, approved, or in-review reports cannot be deleted.'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Draft report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  submitReport,
  reviewReport,
  getReportVersions,
  deleteReport
};
