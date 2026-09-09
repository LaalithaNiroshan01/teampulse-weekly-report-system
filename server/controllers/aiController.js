const Report = require('../models/Report');
const { submittedContent } = require('../services/reportAnalytics');
const User = require('../models/User');
const Project = require('../models/Project');
const { REPORT_STATUS } = require('../config/constants');
const { processAiQuery } = require('../services/aiService');

/**
 * AI conversational analysis over submitted weekly work reports.
 * Strictly filters out drafts to uphold author privacy guarantees.
 */
const chatWithReports = async (req, res, next) => {
  try {
    const { message, weekNumber, year } = req.body;

    // Sanitize and constrain user prompt length to prevent token exhaustion or buffer attacks
    const sanitizedPrompt = typeof message === 'string' ? message.trim().slice(0, 1500) : '';

    // Load current organizational metadata for context injection
    const [allUsers, allProjects] = await Promise.all([
      User.find({ isActive: true }).select('name email role title department').lean(),
      Project.find().select('name code color status').lean()
    ]);

    // Query submitted/reviewed reports only (drafts are author-private)
    const query = { status: { $ne: REPORT_STATUS.DRAFT } };
    if (weekNumber) query.weekNumber = parseInt(weekNumber, 10);
    if (year) query.year = parseInt(year, 10);

    const reports = await Report.find(query)
      .populate('userId', 'name email title department')
      .populate('projectId', 'name')
      .lean();

    if (reports.length === 0) {
      return res.json({
        success: true,
        reply: `No submitted reports found for Week ${weekNumber || 'selected'}, ${year || 'current year'}. Once team members submit their reports, I can analyze progress, blockers, and workload.`,
        engine: 'smart_heuristic',
        modelName: 'TeamPulse Intelligence Engine'
      });
    }

    const result = await processAiQuery({
      reports: reports.map(submittedContent),
      query: sanitizedPrompt,
      weekNumber: parseInt(weekNumber, 10) || 37,
      year: parseInt(year, 10) || 2026,
      allUsers,
      allProjects
    });

    res.json({
      success: true,
      reply: result.reply,
      engine: result.engine,
      modelName: result.modelName
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithReports
};
