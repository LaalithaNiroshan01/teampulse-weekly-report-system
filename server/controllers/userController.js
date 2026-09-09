const User = require('../models/User');
const Report = require('../models/Report');
const { submittedContent } = require('../services/reportAnalytics');
const { ROLES, REPORT_STATUS } = require('../config/constants');

// Retrieve all team members along with live metrics (total, submitted, and approved report counts)
const getUsers = async (req, res, next) => {
  try {
    // Exclude password hash from user query result
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate report submissions per member to avoid N+1 database queries
    const reportStats = await Report.aggregate([
      {
        $group: {
          _id: '$userId',
          totalReports: { $sum: 1 },
          submittedCount: {
            $sum: { $cond: [{ $in: ['$status', [REPORT_STATUS.SUBMITTED, REPORT_STATUS.APPROVED]] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', REPORT_STATUS.APPROVED] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = {};
    reportStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enrichedUsers = users.map((u) => {
      const st = statsMap[u._id.toString()] || { totalReports: 0, submittedCount: 0, approvedCount: 0 };
      return {
        ...u.toObject(),
        totalReports: st.totalReports,
        submittedCount: st.submittedCount,
        approvedCount: st.approvedCount
      };
    });

    res.json({
      success: true,
      data: enrichedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Onboard a new team member with pre-assigned role, department, and temporary credentials
const inviteUser = async (req, res, next) => {
  try {
    const { name, email, role, title, department, initialPassword } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    // Default password policy fallback if not explicitly defined by the inviting manager
    const defaultPassword = (initialPassword && initialPassword.length >= 6)
      ? initialPassword
      : 'TempPass123!';

    const assignedRole = [ROLES.MEMBER, ROLES.MANAGER].includes(role) ? role : ROLES.MEMBER;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: defaultPassword,
      role: assignedRole,
      title: (title || 'Software Engineer').trim(),
      department: (department || 'Engineering').trim(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: `User created successfully with role '${user.role}'. Temporary password: ${defaultPassword}`,
      data: user.toSafeObject(),
      initialPassword: defaultPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update member permissions (member <-> manager). Includes safeguard against orphaned managers.
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (![ROLES.MEMBER, ROLES.MANAGER].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Critical security check: prevent the last remaining active manager from demoting themselves
    if (targetUser._id.toString() === req.user._id.toString() && role !== ROLES.MANAGER) {
      const managerCount = await User.countDocuments({ role: ROLES.MANAGER, isActive: true });
      if (managerCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the only remaining active Manager/Admin account.'
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role successfully updated to '${role}'.`,
      data: targetUser.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// Toggle active/inactive account status. Users are strictly barred from deactivating their own account.
const toggleUserStatus = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.'
      });
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    res.json({
      success: true,
      message: `User account has been ${targetUser.isActive ? 'reactivated' : 'deactivated'}.`,
      data: targetUser.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// Fetch individual member profile, historical reports, and completion ratios.
// Enforces confidentiality: draft reports of other members remain masked even from managers.
const getMemberProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isSelf = user._id.toString() === req.user._id.toString();
    const isManager = req.user.role === ROLES.MANAGER;

    if (!isSelf && !isManager) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const reports = await Report.find({ userId: user._id })
      .populate('projectId', 'name color')
      .populate('latestReviewedBy', 'name')
      .sort({ year: -1, weekNumber: -1 })
      .lean();

    // Preserve draft privacy: if a manager views another member's profile, hide work-in-progress draft details
    const sanitizedReports = reports.map((rpt) => {
      if (rpt.status === REPORT_STATUS.DRAFT && !isSelf) {
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
      return isSelf ? rpt : submittedContent(rpt);
    });

    const nonDraftReports = reports.filter((r) => r.status !== REPORT_STATUS.DRAFT).map(submittedContent);
    const approvedReports = reports.filter((r) => r.status === REPORT_STATUS.APPROVED);
    const correctionReports = reports.filter((r) => r.status === REPORT_STATUS.NEEDS_CORRECTION);

    let totalHoursLogged = 0;
    let totalTasksCompleted = 0;

    nonDraftReports.forEach((rpt) => {
      if (rpt.hoursBreakdown) {
        const hb = rpt.hoursBreakdown;
        totalHoursLogged += (hb.development || 0) + (hb.testing || 0) + (hb.meetings || 0) + (hb.documentation || 0) + (hb.other || 0);
      }
      if (Array.isArray(rpt.tasksCompleted)) {
        totalTasksCompleted += rpt.tasksCompleted.filter((t) => t.status === 'Done').length;
      }
    });

    const stats = {
      totalReports: reports.length,
      approvedCount: approvedReports.length,
      needsCorrectionCount: correctionReports.length,
      totalHoursLogged,
      totalTasksCompleted,
      approvalRate: nonDraftReports.length > 0
        ? Math.round((approvedReports.length / nonDraftReports.length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: {
        user: user.toSafeObject ? user.toSafeObject() : user,
        stats,
        reports: sanitizedReports
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  inviteUser,
  updateUserRole,
  toggleUserStatus,
  getMemberProfile
};
