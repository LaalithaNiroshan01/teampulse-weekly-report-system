require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');
const { connectDB, disconnectDB } = require('../config/db');
const { ROLES, REPORT_STATUS } = require('../config/constants');

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') throw new Error('Demo seeding is disabled in production');
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Report.deleteMany({});

    console.log('Seeding Users...');
    // Seed 1 Manager + 4 Team Members
    const managerAlex = await User.create({
      name: 'Alex Rivera',
      email: 'alex.manager@company.com',
      password: 'Password123!',
      role: ROLES.MANAGER,
      title: 'Engineering Manager',
      department: 'Platform Engineering'
    });

    const memberSarah = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@company.com',
      password: 'Password123!',
      role: ROLES.MEMBER,
      title: 'Senior Backend Engineer',
      department: 'Platform Engineering'
    });

    const memberDavid = await User.create({
      name: 'David Miller',
      email: 'david@company.com',
      password: 'Password123!',
      role: ROLES.MEMBER,
      title: 'Frontend Engineer',
      department: 'Product Experience'
    });

    const memberElena = await User.create({
      name: 'Elena Rostova',
      email: 'elena@company.com',
      password: 'Password123!',
      role: ROLES.MEMBER,
      title: 'Full Stack Engineer',
      department: 'Platform Engineering'
    });

    const memberMarcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@company.com',
      password: 'Password123!',
      role: ROLES.MEMBER,
      title: 'DevOps & QA Engineer',
      department: 'Infrastructure'
    });

    console.log('Seeding Projects...');
    const projClientA = await Project.create({
      name: 'Client A - Enterprise Portal',
      description: 'Single sign-on, tenant provisioning and reporting dashboard for enterprise clients.',
      color: '#3B82F6' // Blue
    });

    const projInternal = await Project.create({
      name: 'Internal Tooling',
      description: 'Internal developer velocity tooling, CI/CD telemetry, and reporting automation.',
      color: '#10B981' // Green
    });

    const projRnD = await Project.create({
      name: 'R&D - GenAI Workflows',
      description: 'Experimental integration of AI assistant copilots into workflow automation.',
      color: '#8B5CF6' // Purple
    });

    const projMarketing = await Project.create({
      name: 'Marketing Analytics',
      description: 'Customer journey data pipelines and conversion analytics engine.',
      color: '#F59E0B' // Amber
    });

    console.log('Seeding Weekly Reports...');

    // Week 36 (Current week) dates: Aug 31 - Sep 6, 2026
    const w36Start = new Date('2026-08-31T00:00:00Z');
    const w36End = new Date('2026-09-06T23:59:59Z');

    // Week 35 dates: Aug 24 - Aug 30, 2026
    const w35Start = new Date('2026-08-24T00:00:00Z');
    const w35End = new Date('2026-08-30T23:59:59Z');

    // Week 34 dates: Aug 17 - Aug 23, 2026
    const w34Start = new Date('2026-08-17T00:00:00Z');
    const w34End = new Date('2026-08-23T23:59:59Z');

    // 1. Current Week: Sarah - SUBMITTED (Ready for Alex's review)
    await Report.create({
      userId: memberSarah._id,
      weekStartDate: w36Start,
      weekEndDate: w36End,
      weekNumber: 36,
      year: 2026,
      projectId: projClientA._id,
      status: REPORT_STATUS.SUBMITTED,
      tasksCompleted: [
        {
          taskName: 'Implement OAuth 2.0 PKCE Authorization Endpoint',
          priority: 'High',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 16,
          timeSpent: 18,
          outputDeliverable: 'PR #142 merged with 98% unit test coverage'
        },
        {
          taskName: 'Database migration for multi-tenant organizations',
          priority: 'Urgent',
          plannedPercentage: 100,
          actualPercentage: 90,
          status: 'In Progress',
          plannedTime: 12,
          timeSpent: 14,
          outputDeliverable: 'Schema scripts staged in sandbox'
        }
      ],
      tasksPlannedNextWeek: [
        {
          taskName: 'Finalize zero-downtime database migration in staging',
          priority: 'Urgent',
          plannedTime: 10,
          details: 'Run automated rollback drills with QA team'
        },
        {
          taskName: 'API rate limiting and burst token bucket',
          priority: 'Medium',
          plannedTime: 14,
          details: 'Redis token bucket middleware implementation'
        }
      ],
      blockers: [
        {
          description: 'Awaiting staging VPC peering approval from Cloud Infrastructure team',
          impact: 'Delays staging validation of multi-region database migration',
          isKeyIssue: true
        }
      ],
      achievements: [
        {
          description: 'Reduced OAuth token validation latency by 45% using cached public JWKs',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: {
        development: 24,
        testing: 8,
        meetings: 4,
        documentation: 4,
        other: 0
      },
      notes: 'Please review PR #142 when convenient.',
      links: [
        { title: 'Auth Architecture Spec', url: 'https://wiki.company.internal/auth-spec' },
        { title: 'PR #142', url: 'https://github.com/company/repo/pull/142' }
      ],
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-09-04T17:30:00Z'),
          reviewAction: 'pending',
          snapshot: {
            weekStartDate: w36Start,
            weekEndDate: w36End,
            weekNumber: 36,
            year: 2026,
            projectId: projClientA._id,
            tasksCompleted: [
              {
                taskName: 'Implement OAuth 2.0 PKCE Authorization Endpoint',
                priority: 'High',
                plannedPercentage: 100,
                actualPercentage: 100,
                status: 'Done',
                plannedTime: 16,
                timeSpent: 18,
                outputDeliverable: 'PR #142 merged with 98% unit test coverage'
              }
            ]
          }
        }
      ]
    });

    // 2. Current Week: David - NEEDS_CORRECTION (Manager requested changes, David can edit & resubmit)
    await Report.create({
      userId: memberDavid._id,
      weekStartDate: w36Start,
      weekEndDate: w36End,
      weekNumber: 36,
      year: 2026,
      projectId: projClientA._id,
      status: REPORT_STATUS.NEEDS_CORRECTION,
      latestReviewComment: 'Great work on the UI components David, but please break down the output deliverables for the design system tokens and adjust the planned hours for next week.',
      latestReviewedAt: new Date('2026-09-05T10:15:00Z'),
      latestReviewedBy: managerAlex._id,
      tasksCompleted: [
        {
          taskName: 'Refactor Dashboard Navigation to use Tailwind Grid',
          priority: 'Medium',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 12,
          timeSpent: 11,
          outputDeliverable: 'Component library updated'
        },
        {
          taskName: 'Accessibility audit and WCAG AA contrast compliance',
          priority: 'High',
          plannedPercentage: 80,
          actualPercentage: 60,
          status: 'In Progress',
          plannedTime: 14,
          timeSpent: 16,
          outputDeliverable: 'Initial report generated'
        }
      ],
      tasksPlannedNextWeek: [
        {
          taskName: 'Finish color contrast fixes for dark mode',
          priority: 'High',
          plannedTime: 12,
          details: 'Address remaining 4 flagged components'
        }
      ],
      blockers: [
        {
          description: 'Figma tokens sync script failing due to updated API version',
          impact: 'Manual color value verification required',
          isKeyIssue: true
        }
      ],
      achievements: [
        {
          description: 'Achieved 100% keyboard accessibility on all primary navigation tabs',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: {
        development: 20,
        testing: 6,
        meetings: 6,
        documentation: 4,
        other: 2
      },
      notes: 'Updating deliverables as requested by Alex.',
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-09-04T16:00:00Z'),
          reviewAction: 'changes_requested',
          reviewComment: 'Great work on the UI components David, but please break down the output deliverables for the design system tokens and adjust the planned hours for next week.',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-09-05T10:15:00Z'),
          snapshot: {
            weekStartDate: w36Start,
            weekEndDate: w36End,
            weekNumber: 36,
            year: 2026,
            projectId: projClientA._id,
            tasksCompleted: [
              {
                taskName: 'Refactor Dashboard Navigation to use Tailwind Grid',
                priority: 'Medium',
                plannedPercentage: 100,
                actualPercentage: 100,
                status: 'Done',
                plannedTime: 12,
                timeSpent: 11,
                outputDeliverable: 'Component library updated'
              }
            ]
          }
        }
      ]
    });

    // 3. Current Week: Elena - DRAFT (Elena is working on draft; private from Alex!)
    await Report.create({
      userId: memberElena._id,
      weekStartDate: w36Start,
      weekEndDate: w36End,
      weekNumber: 36,
      year: 2026,
      projectId: projRnD._id,
      status: REPORT_STATUS.DRAFT,
      tasksCompleted: [
        {
          taskName: 'Evaluate vector embeddings models for report search',
          priority: 'High',
          plannedPercentage: 50,
          actualPercentage: 40,
          status: 'In Progress',
          plannedTime: 20,
          timeSpent: 15,
          outputDeliverable: 'Benchmark draft on private branch'
        }
      ],
      tasksPlannedNextWeek: [],
      blockers: [
        {
          description: 'API rate limits on experimental provider',
          impact: 'Slowing batch embedding generation',
          isKeyIssue: true
        }
      ],
      achievements: [],
      hoursBreakdown: {
        development: 15,
        testing: 0,
        meetings: 2,
        documentation: 1,
        other: 0
      },
      notes: 'Still drafting, need to add remaining testing hours before submitting.'
    });

    // 4. Current Week: Marcus - "Not yet started" (No record exists for Marcus in week 36!)

    // 5. Previous Week 35: David - Completed Review Cycle (Version 1 -> Needs Correction -> Version 2 -> Approved!)
    await Report.create({
      userId: memberDavid._id,
      weekStartDate: w35Start,
      weekEndDate: w35End,
      weekNumber: 35,
      year: 2026,
      projectId: projInternal._id,
      status: REPORT_STATUS.APPROVED,
      latestReviewComment: 'Approved. Thanks for making the requested updates to the test coverage metrics!',
      latestReviewedAt: new Date('2026-08-29T14:00:00Z'),
      latestReviewedBy: managerAlex._id,
      tasksCompleted: [
        {
          taskName: 'Migrate report viewer to React 18 concurrent features',
          priority: 'High',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 20,
          timeSpent: 22,
          outputDeliverable: 'Zero re-render regressions verified in Chrome Profiler'
        },
        {
          taskName: 'Unit test suite coverage increase to 85%',
          priority: 'Medium',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 12,
          timeSpent: 10,
          outputDeliverable: 'Added 24 component spec tests'
        }
      ],
      tasksPlannedNextWeek: [
        {
          taskName: 'Refactor Dashboard Navigation',
          priority: 'Medium',
          plannedTime: 12,
          details: 'Prepare for week 36 sprint'
        }
      ],
      blockers: [],
      achievements: [
        {
          description: 'Frontend load time dropped from 1.8s to 0.7s',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: {
        development: 22,
        testing: 10,
        meetings: 4,
        documentation: 4,
        other: 0
      },
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-08-28T16:00:00Z'),
          reviewAction: 'changes_requested',
          reviewComment: 'Please elaborate on the test suite deliverable and mention the exact test count added.',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-08-28T18:30:00Z'),
          snapshot: {
            weekStartDate: w35Start,
            weekEndDate: w35End,
            weekNumber: 35,
            year: 2026,
            projectId: projInternal._id,
            tasksCompleted: [
              {
                taskName: 'Migrate report viewer to React 18 concurrent features',
                priority: 'High',
                plannedPercentage: 100,
                actualPercentage: 100,
                status: 'Done',
                plannedTime: 20,
                timeSpent: 22,
                outputDeliverable: 'Completed migration'
              }
            ]
          }
        },
        {
          versionNumber: 2,
          submittedAt: new Date('2026-08-29T11:00:00Z'),
          reviewAction: 'approved',
          reviewComment: 'Approved. Thanks for making the requested updates to the test coverage metrics!',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-08-29T14:00:00Z'),
          snapshot: {
            weekStartDate: w35Start,
            weekEndDate: w35End,
            weekNumber: 35,
            year: 2026,
            projectId: projInternal._id,
            tasksCompleted: [
              {
                taskName: 'Migrate report viewer to React 18 concurrent features',
                priority: 'High',
                plannedPercentage: 100,
                actualPercentage: 100,
                status: 'Done',
                plannedTime: 20,
                timeSpent: 22,
                outputDeliverable: 'Zero re-render regressions verified in Chrome Profiler'
              },
              {
                taskName: 'Unit test suite coverage increase to 85%',
                priority: 'Medium',
                plannedPercentage: 100,
                actualPercentage: 100,
                status: 'Done',
                plannedTime: 12,
                timeSpent: 10,
                outputDeliverable: 'Added 24 component spec tests'
              }
            ]
          }
        }
      ]
    });

    // 6. Previous Week 35: Sarah - APPROVED
    await Report.create({
      userId: memberSarah._id,
      weekStartDate: w35Start,
      weekEndDate: w35End,
      weekNumber: 35,
      year: 2026,
      projectId: projClientA._id,
      status: REPORT_STATUS.APPROVED,
      latestReviewComment: 'Solid delivery on the Redis cache layer.',
      latestReviewedAt: new Date('2026-08-29T15:00:00Z'),
      latestReviewedBy: managerAlex._id,
      tasksCompleted: [
        {
          taskName: 'Redis session cache cluster deployment',
          priority: 'High',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 18,
          timeSpent: 17,
          outputDeliverable: 'Deployed via Terraform to production'
        }
      ],
      tasksPlannedNextWeek: [],
      blockers: [],
      achievements: [
        {
          description: 'Zero failover downtime during Redis cluster switch',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: { development: 26, testing: 8, meetings: 4, documentation: 2, other: 0 },
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-08-28T17:00:00Z'),
          reviewAction: 'approved',
          reviewComment: 'Solid delivery on the Redis cache layer.',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-08-29T15:00:00Z'),
          snapshot: { weekNumber: 35, year: 2026 }
        }
      ]
    });

    // 7. Previous Week 35: Elena - APPROVED
    await Report.create({
      userId: memberElena._id,
      weekStartDate: w35Start,
      weekEndDate: w35End,
      weekNumber: 35,
      year: 2026,
      projectId: projRnD._id,
      status: REPORT_STATUS.APPROVED,
      latestReviewComment: 'Exciting AI prototype benchmark results.',
      latestReviewedAt: new Date('2026-08-29T16:00:00Z'),
      latestReviewedBy: managerAlex._id,
      tasksCompleted: [
        {
          taskName: 'Build LLM chat assistant prototype for manager dashboard',
          priority: 'Medium',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 25,
          timeSpent: 24,
          outputDeliverable: 'Working POC demoed to leadership'
        }
      ],
      tasksPlannedNextWeek: [],
      blockers: [],
      achievements: [
        {
          description: 'Successfully integrated smart fallback NLP pipeline',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: { development: 24, testing: 6, meetings: 5, documentation: 5, other: 0 },
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-08-28T15:00:00Z'),
          reviewAction: 'approved',
          reviewComment: 'Exciting AI prototype benchmark results.',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-08-29T16:00:00Z'),
          snapshot: { weekNumber: 35, year: 2026 }
        }
      ]
    });

    // 8. Previous Week 35: Marcus - APPROVED
    await Report.create({
      userId: memberMarcus._id,
      weekStartDate: w35Start,
      weekEndDate: w35End,
      weekNumber: 35,
      year: 2026,
      projectId: projInternal._id,
      status: REPORT_STATUS.APPROVED,
      latestReviewComment: 'CI build speed improvements are already noticeable team-wide.',
      latestReviewedAt: new Date('2026-08-29T17:00:00Z'),
      latestReviewedBy: managerAlex._id,
      tasksCompleted: [
        {
          taskName: 'Parallelize GitHub Actions CI matrix builds',
          priority: 'High',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'Done',
          plannedTime: 16,
          timeSpent: 15,
          outputDeliverable: 'CI run duration cut down by 60%'
        }
      ],
      tasksPlannedNextWeek: [],
      blockers: [],
      achievements: [
        {
          description: 'Reduced team CI wait time by 12 hours weekly',
          isKeyAchievement: true
        }
      ],
      hoursBreakdown: { development: 15, testing: 12, meetings: 5, documentation: 4, other: 2 },
      versions: [
        {
          versionNumber: 1,
          submittedAt: new Date('2026-08-28T16:45:00Z'),
          reviewAction: 'approved',
          reviewComment: 'CI build speed improvements are already noticeable team-wide.',
          reviewedBy: managerAlex._id,
          reviewedAt: new Date('2026-08-29T17:00:00Z'),
          snapshot: { weekNumber: 35, year: 2026 }
        }
      ]
    });

    // Include a third historical week without replacing any live user records.
    const historical = await Report.findOne({weekNumber:35}).lean();
    if (historical) {
      delete historical._id; delete historical.__v;
      historical.weekNumber=34; historical.weekStartDate=w34Start; historical.weekEndDate=w34End;
      historical.status='approved'; historical.latestReviewComment='Historical demo report approved';
      historical.versions=[{versionNumber:1,submittedAt:new Date('2026-08-21T15:00:00Z'),reviewAction:'approved',reviewedAt:new Date('2026-08-21T16:00:00Z'),reviewedBy:managerAlex._id,reviewComment:'Historical demo report approved',snapshot:{}}];
      await Report.create(historical);
    }
    const seededReports = await Report.find();
    const fields = ['weekStartDate','weekEndDate','weekNumber','year','projectId','tasksCompleted','tasksPlannedNextWeek','blockers','achievements','hoursBreakdown','notes','links'];
    for (const report of seededReports) {
      const raw = report.toObject(); const base = Object.fromEntries(fields.map(k => [k, raw[k]]));
      const project = await Project.findById(report.projectId).lean();
      for (const version of report.versions) {
        const original = version.versionNumber === report.versions.length ? {} : (version.snapshot || {});
        version.snapshot = { ...base, ...original, project: project && {_id: project._id, name: project.name, color: project.color} };
      }
      report.markModified('versions'); await report.save();
    }
    // Move the reference demo weeks to the current UTC reporting week.
    const {period,weekInfo}=require('../services/reportAnalytics');
    const currentStart=period().start;
    const shift=+currentStart-+w36Start;
    for(const report of await Report.find()) {
      report.weekStartDate=new Date(+report.weekStartDate+shift);
      report.weekEndDate=new Date(+report.weekEndDate+shift);
      Object.assign(report,weekInfo(report.weekStartDate));
      for(const version of report.versions) {
        const submission=new Date(+version.submittedAt+shift);
        version.submittedAt=submission>new Date()?new Date():submission;
        if(version.reviewedAt) version.reviewedAt=new Date(Math.min(+new Date(),+version.reviewedAt+shift));
        version.snapshot={...version.snapshot,weekStartDate:report.weekStartDate,weekEndDate:report.weekEndDate,weekNumber:report.weekNumber,year:report.year};
      }
      if(report.latestReviewedAt) report.latestReviewedAt=new Date(Math.min(+new Date(),+report.latestReviewedAt+shift));
      report.markModified('versions');await report.save();
    }
    // The demo members already belonged to the team during the seeded weeks.
    await User.collection.updateMany({}, {$set:{createdAt: new Date(+currentStart-35*86400000)}});
    console.log('Database seeded successfully!');
    console.log('=========================================');
    console.log('Demo Credentials:');
    console.log('Manager / Admin: alex.manager@company.com / Password123!');
    console.log('Member (Sarah):  sarah@company.com        / Password123!');
    console.log('Member (David):  david@company.com        / Password123!');
    console.log('Member (Elena):  elena@company.com        / Password123!');
    console.log('Member (Marcus): marcus@company.com       / Password123!');
    console.log('=========================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('Database seeding failed:', err);
    if (require.main === module) {
      await disconnectDB();
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
