const User = require('../models/User');
const Report = require('../models/Report');
const { period, submittedContent, summarize, id } = require('../services/reportAnalytics');

/**
 * Helper to retrieve normalized dataset for analytics across a requested date range.
 * Fetches active team members and their corresponding submitted/draft report snapshots.
 */
async function getDataset(query) {
  const range = period(query);
  const memberQuery = { role: 'member', isActive: true };
  if (query.memberId) {
    memberQuery._id = query.memberId;
  }

  const members = await User.find(memberQuery)
    .select('name email title department createdAt')
    .lean();

  const rawReports = await Report.find({
    userId: { $in: members.map((m) => m._id) },
    $or: range.weeks.map((w) => ({ year: w.year, weekNumber: w.weekNumber }))
  })
    .populate('userId', 'name email title department')
    .populate('projectId', 'name color')
    .populate('versions.reviewedBy', 'name')
    .lean();

  // Normalize report contents: use submitted snapshot for submitted/approved reports
  const reports = rawReports
    .map((r) => (r.status === 'draft' ? r : submittedContent(r)))
    .filter((r) => {
      const matchesProject = !query.projectId || id(r.projectId) === query.projectId;
      const withinDateRange =
        new Date(r.weekStartDate) <= range.end && new Date(r.weekEndDate) >= range.start;
      return matchesProject && withinDateRange;
    });

  return { range, members, reports };
}

// Filter to non-draft reports visible for team aggregated analytics
const getVisibleReports = (reports, query) =>
  reports.filter((r) => r.status !== 'draft' && (!query.status || r.status === query.status));

// Team overview statistics (cards, submission rate, submission status breakdown)
const getDashboardStats = async (req, res, next) => {
  try {
    const { range, members, reports } = await getDataset(req.query);
    const summaryData = summarize(members, reports, range, req.query);

    res.json({
      success: true,
      data: summaryData
    });
  } catch (error) {
    next(error);
  }
};

// Aggregate chart metrics: completion trends, project distribution, and time allocation breakdown
const getDashboardCharts = async (req, res, next) => {
  try {
    const { range, members, reports } = await getDataset(req.query);
    const content = getVisibleReports(reports, req.query);

    // Initialize trend map for the date range
    const trendMap = new Map(
      range.weeks.map((w) => [
        `${w.year}-${w.weekNumber}`,
        {
          weekNumber: `${w.year} W${w.weekNumber}`,
          tasksCompleted: 0,
          hoursLogged: 0,
          reportsSubmitted: 0
        }
      ])
    );

    const projectTotals = {};
    const totalHoursByType = {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0
    };

    for (const report of content) {
      const reportTotalHours = Object.values(report.hoursBreakdown || {})
        .filter((val) => typeof val === 'number')
        .reduce((sum, val) => sum + val, 0);

      const trendEntry = trendMap.get(`${report.year}-${report.weekNumber}`);
      if (trendEntry) {
        trendEntry.tasksCompleted += (report.tasksCompleted || []).filter(
          (t) => t.status === 'Done'
        ).length;
        trendEntry.hoursLogged += reportTotalHours;
        trendEntry.reportsSubmitted += 1;
      }

      // Group hours and task count by project
      const projectIdKey = id(report.projectId);
      const projectEntry = (projectTotals[projectIdKey] ||= {
        name: report.projectId?.name || 'Archived / Unassigned',
        color: report.projectId?.color || '#94A3B8',
        taskCount: 0,
        hours: 0
      });
      projectEntry.taskCount += report.tasksCompleted?.length || 0;
      projectEntry.hours += reportTotalHours;

      // Accumulate hours by activity category
      for (const category of Object.keys(totalHoursByType)) {
        totalHoursByType[category] += report.hoursBreakdown?.[category] || 0;
      }
    }

    const { matrix } = summarize(members, reports, range, req.query);
    const memberStatusChart = members.map((member) => {
      const row = {
        name: member.name,
        approved: 0,
        submitted: 0,
        needsCorrection: 0,
        draft: 0,
        notStarted: 0
      };
      const statusKeyMap = {
        approved: 'approved',
        submitted: 'submitted',
        needs_correction: 'needsCorrection',
        draft: 'draft',
        not_started: 'notStarted'
      };
      matrix
        .filter((item) => id(item.member) === id(member))
        .forEach((item) => {
          row[statusKeyMap[item.status]]++;
        });
      return row;
    });

    res.json({
      success: true,
      data: {
        tasksTrend: [...trendMap.values()],
        projectDistribution: Object.values(projectTotals),
        timeSpentChart: Object.entries(totalHoursByType).map(([cat, hours]) => ({
          taskType: cat.charAt(0).toUpperCase() + cat.slice(1),
          hours
        })),
        memberStatusChart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Side-by-side comparison feed highlighting blockers and key accomplishments
const getSideBySide = async (req, res, next) => {
  try {
    const { reports } = await getDataset(req.query);
    const visibleReports = getVisibleReports(reports, req.query);

    const sideBySideList = visibleReports.map((r) => ({
      reportId: r._id,
      member: r.userId,
      project: r.projectId,
      status: r.status,
      blockers: r.blockers || [],
      achievements: r.achievements || [],
      keyIssue: r.blockers?.find((b) => b.isKeyIssue),
      keyAchievement: r.achievements?.find((a) => a.isKeyAchievement)
    }));

    res.json({
      success: true,
      data: sideBySideList
    });
  } catch (error) {
    next(error);
  }
};

// Real-time activity timeline feed of submissions and manager approvals/reviews
const getRecentActivity = async (req, res, next) => {
  try {
    const { reports } = await getDataset(req.query);
    const visibleReports = getVisibleReports(reports, req.query);
    const events = [];

    for (const report of visibleReports) {
      for (const version of report.versions || []) {
        const base = {
          reportId: report._id,
          status: report.status,
          member: report.userId,
          project: report.projectId
        };

        // Submission event
        events.push({
          ...base,
          id: `${report._id}-${version.versionNumber}-submit`,
          type: 'submitted',
          title: `${report.userId.name} ${version.versionNumber > 1 ? 'resubmitted' : 'submitted'} report`,
          detail: `Week ${report.weekNumber}, Version ${version.versionNumber}`,
          timestamp: version.submittedAt
        });

        // Review decision event (if already reviewed)
        if (version.reviewedAt) {
          const isApproved = version.reviewAction === 'approved';
          events.push({
            ...base,
            id: `${report._id}-${version.versionNumber}-review`,
            type: isApproved ? 'approved' : 'correction_requested',
            title: isApproved
              ? `Report approved by ${version.reviewedBy?.name || 'Manager'}`
              : `Changes requested for ${report.userId.name}`,
            detail: version.reviewComment,
            timestamp: version.reviewedAt
          });
        }
      }
    }

    // Sort descending by timestamp, capped at 20 events
    const sortedActivity = events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);

    res.json({
      success: true,
      data: sortedActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardCharts,
  getSideBySide,
  getRecentActivity
};
