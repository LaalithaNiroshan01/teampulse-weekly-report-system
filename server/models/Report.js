const mongoose = require('mongoose');
const { REPORT_STATUS, TASK_PRIORITY, TASK_STATUS } = require('../config/constants');

const taskCompletedSchema = new mongoose.Schema(
  {
    taskName: { type: String, trim: true, default: '' },
    priority: { type: String, enum: TASK_PRIORITY, default: 'Medium' },
    plannedPercentage: { type: Number, min: 0, max: 100, default: 0 },
    actualPercentage: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: TASK_STATUS, default: 'In Progress' },
    plannedTime: { type: Number, min: 0, default: 0 }, // in hours
    timeSpent: { type: Number, min: 0, default: 0 },    // in hours
    outputDeliverable: { type: String, trim: true, default: '' }
  },
  { _id: true }
);

const taskPlannedSchema = new mongoose.Schema(
  {
    taskName: { type: String, trim: true, default: '' },
    priority: { type: String, enum: TASK_PRIORITY, default: 'Medium' },
    plannedTime: { type: Number, min: 0, default: 0 },
    details: { type: String, trim: true, default: '' }
  },
  { _id: true }
);

const blockerSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, default: '' },
    impact: { type: String, trim: true, default: '' },
    isKeyIssue: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false }
  },
  { _id: true }
);

const achievementSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, default: '' },
    isKeyAchievement: { type: Boolean, default: false }
  },
  { _id: true }
);

const hoursBreakdownSchema = new mongoose.Schema(
  {
    development: { type: Number, min: 0, default: 0 },
    testing: { type: Number, min: 0, default: 0 },
    meetings: { type: Number, min: 0, default: 0 },
    documentation: { type: Number, min: 0, default: 0 },
    other: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const reportVersionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    reviewAction: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending'
    },
    reviewComment: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
  },
  { _id: true }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required']
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required']
    },
    weekNumber: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.DRAFT,
      index: true
    },
    // Standardized fields
    tasksCompleted: [taskCompletedSchema],
    tasksPlannedNextWeek: [taskPlannedSchema],
    blockers: [blockerSchema],
    achievements: [achievementSchema],
    hoursBreakdown: {
      type: hoursBreakdownSchema,
      default: () => ({})
    },
    notes: {
      type: String,
      default: ''
    },
    links: [linkSchema],

    // Review tracking
    latestReviewComment: {
      type: String,
      default: ''
    },
    latestReviewedAt: {
      type: Date
    },
    latestReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Immutable version snapshots
    versions: [reportVersionSchema]
  },
  {
    timestamps: true
  }
);

reportSchema.pre('validate', function(next) {
  if (this.weekStartDate && this.weekEndDate) {
    if (this.weekEndDate < this.weekStartDate) this.invalidate('weekEndDate', 'End date must be on or after start date');
    const { weekInfo } = require('../services/reportAnalytics');
    Object.assign(this, weekInfo(this.weekStartDate));
  }
  next();
});

// Compound index for user + week lookup
reportSchema.index({ userId: 1, year: 1, weekNumber: 1 });

module.exports = mongoose.model('Report', reportSchema);
