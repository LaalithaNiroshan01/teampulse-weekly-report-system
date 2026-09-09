/**
 * Centralized Weekly Reporting & Analytics Service
 * 
 * Implements ISO 8601 week calculations, compliance metrics,
 * draft privacy isolation, and submitted content snapshotting.
 */

const ONE_DAY_MS = 86400000;

/**
 * Safely converts an ObjectId or object with _id into a string
 */
const toIdString = (value) => String(value?._id || value || '');

/**
 * Calculates ISO 8601 week number and year in UTC
 * Monday is the start of the week, Thursday determines the year
 */
function getWeekInfo(dateInput = new Date()) {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);

  // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);

  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / ONE_DAY_MS + 1) / 7);

  return { year, weekNumber };
}

/**
 * Returns Monday 00:00:00 UTC for a given date
 */
function getMonday(dateInput) {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dayOfWeek + 1);
  return d;
}

/**
 * Parses and validates reporting period from query parameters (either weekNumber+year or startDate+endDate)
 */
function parseReportingPeriod(query = {}) {
  let start;
  let end;

  if (query.startDate || query.endDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!query.startDate || !query.endDate || !dateRegex.test(query.startDate) || !dateRegex.test(query.endDate)) {
      const err = new Error('Provide both startDate and endDate formatted as YYYY-MM-DD');
      err.statusCode = 400;
      throw err;
    }

    start = new Date(query.startDate + 'T00:00:00Z');
    end = new Date(query.endDate + 'T23:59:59.999Z');

    if (!Number.isFinite(+start) || !Number.isFinite(+end) || 
        start.toISOString().slice(0, 10) !== query.startDate || 
        end.toISOString().slice(0, 10) !== query.endDate) {
      const err = new Error('Invalid calendar date specified');
      err.statusCode = 400;
      throw err;
    }
  } else {
    const current = getWeekInfo();
    const year = Number(query.year || current.year);
    const week = Number(query.weekNumber || current.weekNumber);

    if (!Number.isInteger(year) || year < 1900 || year > 2200 || !Number.isInteger(week) || week < 1 || week > 53) {
      const err = new Error('Invalid reporting week or year');
      err.statusCode = 400;
      throw err;
    }

    // Determine Monday of ISO week
    start = getMonday(new Date(Date.UTC(year, 0, 4)));
    start.setUTCDate(start.getUTCDate() + (week - 1) * 7);

    if (getWeekInfo(start).year !== year) {
      const err = new Error(`Year ${year} does not contain ISO week 53`);
      err.statusCode = 400;
      throw err;
    }

    end = new Date(+start + 7 * ONE_DAY_MS - 1);
  }

  if (!Number.isFinite(+start) || !Number.isFinite(+end) || start > end || (end - start) > 366 * ONE_DAY_MS) {
    const err = new Error('Date range must be chronological, valid, and at most one year in duration');
    err.statusCode = 400;
    throw err;
  }

  // Generate list of weeks overlapping this period
  const weeks = [];
  for (let d = getMonday(start); d <= end; d = new Date(+d + 7 * ONE_DAY_MS)) {
    weeks.push({
      ...getWeekInfo(d),
      start: d,
      deadline: new Date(+d + 7 * ONE_DAY_MS)
    });
  }

  return { start, end, weeks };
}

/**
 * Extracts and returns the submitted snapshot content for public/manager analytics.
 * This guarantees draft edits currently in progress do not leak into team dashboards.
 */
function getSubmittedContent(report) {
  const latestVersion = report.versions && report.versions.length > 0
    ? report.versions[report.versions.length - 1]
    : null;

  const snapshot = latestVersion?.snapshot || {};

  const content = {
    tasksCompleted: [],
    tasksPlannedNextWeek: [],
    blockers: [],
    achievements: [],
    hoursBreakdown: {},
    notes: '',
    links: []
  };

  // Populate fields preserved in immutable snapshot
  for (const key of Object.keys(content)) {
    if (snapshot[key] !== undefined) {
      content[key] = snapshot[key];
    }
  }

  return {
    ...report,
    ...content,
    weekStartDate: snapshot.weekStartDate || report.weekStartDate,
    weekEndDate: snapshot.weekEndDate || report.weekEndDate,
    year: snapshot.year || report.year,
    weekNumber: snapshot.weekNumber || report.weekNumber,
    projectId: snapshot.project || (toIdString(snapshot.projectId) === toIdString(report.projectId) ? report.projectId : snapshot.projectId),
    _id: report._id,
    userId: report.userId,
    status: report.status,
    versions: report.versions
  };
}

/**
 * Summarizes compliance rates, submission matrix, and aggregate team metrics.
 * 
 * Compliance calculations are based on member/weeks to prevent duplicate submissions
 * from artificially inflating the compliance percentage.
 */
function summarizeDashboard(members, reports, range, query = {}, now = new Date()) {
  const rows = [];
  const complianceUnits = [];

  for (const week of range.weeks) {
    for (const member of members) {
      // Ignore members who joined after the submission deadline for that week
      if (member.createdAt && new Date(member.createdAt) >= week.deadline) {
        continue;
      }

      const ownReports = reports.filter(r => 
        toIdString(r.userId) === toIdString(member) &&
        r.year === week.year &&
        r.weekNumber === week.weekNumber
      );

      const submittedReports = ownReports.filter(r => r.status !== 'draft');
      const submissionTimes = submittedReports
        .map(r => new Date(r.versions?.[0]?.submittedAt))
        .filter(d => Number.isFinite(+d));

      const firstSubmissionTime = submissionTimes.length > 0 ? new Date(Math.min(...submissionTimes)) : null;

      let complianceState;
      if (submittedReports.length > 0) {
        complianceState = (firstSubmissionTime && firstSubmissionTime >= week.deadline) ? 'late' : 'submitted';
      } else {
        complianceState = (now >= week.deadline) ? 'overdue' : 'pending';
      }

      complianceUnits.push(complianceState);

      const displayReports = ownReports.length > 0 ? ownReports : [null];
      for (const report of displayReports) {
        rows.push({
          member,
          weekNumber: week.weekNumber,
          year: week.year,
          status: report?.status || 'not_started',
          reportId: report?._id || null,
          project: report?.projectId || null,
          updatedAt: report?.updatedAt,
          latestReviewComment: report?.status === 'draft' ? null : report?.latestReviewComment,
          isDraftPrivate: report?.status === 'draft',
          compliance: complianceState
        });
      }
    }
  }

  // Filter matrix by status if requested
  const filteredRows = rows.filter(r => !query.status || r.status === query.status);
  const visibleReportIds = new Set(filteredRows.map(r => toIdString(r.reportId)));
  const visibleReports = reports.filter(r => visibleReportIds.has(toIdString(r._id)));
  const submittedVisible = visibleReports.filter(r => r.status !== 'draft');

  const onTimeSubmittedCount = complianceUnits.filter(x => x === 'submitted').length;
  const complianceRate = complianceUnits.length > 0
    ? Math.round((onTimeSubmittedCount / complianceUnits.length) * 100)
    : 0;

  return {
    matrix: filteredRows,
    metrics: {
      totalSubmitted: submittedVisible.length,
      totalMembers: members.length,
      expectedMemberWeeks: complianceUnits.length,
      submittedCount: onTimeSubmittedCount,
      lateCount: complianceUnits.filter(x => x === 'late').length,
      overdueCount: complianceUnits.filter(x => x === 'overdue').length,
      pendingCount: complianceUnits.filter(x => x === 'pending').length,
      complianceRate,
      needsCorrectionCount: visibleReports.filter(r => r.status === 'needs_correction').length,
      draftCount: visibleReports.filter(r => r.status === 'draft').length,
      notStartedCount: filteredRows.filter(r => r.status === 'not_started').length,
      openBlockersCount: submittedVisible.reduce((sum, r) => {
        const unresolved = (r.blockers || []).filter(b => b.description?.trim() && !b.isResolved);
        return sum + unresolved.length;
      }, 0)
    }
  };
}

module.exports = {
  period: parseReportingPeriod,
  weekInfo: getWeekInfo,
  submittedContent: getSubmittedContent,
  summarize: summarizeDashboard,
  id: toIdString
};
