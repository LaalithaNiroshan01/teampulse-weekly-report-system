process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.JWT_SECRET = 'isolated-tests-only-secret-with-more-than-32-characters';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');
const { ROLES, REPORT_STATUS } = require('../config/constants');

let managerToken;
let member1Token;
let member2Token;

let managerUser;
let member1User;
let member2User;

let testProject;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  await User.deleteMany({});
  await Project.deleteMany({});
  await Report.deleteMany({});

  // Seed Manager
  managerUser = await User.create({
    name: 'Test Manager',
    email: 'test.manager@company.com',
    password: 'Password123!',
    role: ROLES.MANAGER,
    title: 'Manager',
    department: 'Engineering'
  });

  // Seed Member 1
  member1User = await User.create({
    name: 'Member One',
    email: 'member1@company.com',
    password: 'Password123!',
    role: ROLES.MEMBER,
    title: 'Engineer 1',
    department: 'Engineering'
  });

  // Seed Member 2
  member2User = await User.create({
    name: 'Member Two',
    email: 'member2@company.com',
    password: 'Password123!',
    role: ROLES.MEMBER,
    title: 'Engineer 2',
    department: 'Engineering'
  });

  testProject = await Project.create({
    name: 'Core System',
    description: 'Core backend system'
  });

  // Login to get tokens
  const mgrRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test.manager@company.com', password: 'Password123!' });
  managerToken = mgrRes.body.token;

  const m1Res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'member1@company.com', password: 'Password123!' });
  member1Token = m1Res.body.token;

  const m2Res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'member2@company.com', password: 'Password123!' });
  member2Token = m2Res.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Role-Based Access Control (RBAC) & Privacy Tests', () => {
  let member1DraftReport;

  beforeEach(async () => {
    // Create a fresh draft report for Member 1
    member1DraftReport = await Report.create({
      userId: member1User._id,
      weekStartDate: new Date('2026-09-01'),
      weekEndDate: new Date('2026-09-07'),
      weekNumber: 36,
      year: 2026,
      projectId: testProject._id,
      status: REPORT_STATUS.DRAFT,
      tasksCompleted: [
        {
          taskName: 'Secret private in-progress task',
          priority: 'High',
          status: 'In Progress',
          timeSpent: 4
        }
      ]
    });
  });

  afterEach(async () => {
    await Report.deleteMany({});
  });

  test('1. Member CANNOT access another member draft report (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${member2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('2. Manager CANNOT view private draft content of a member (Draft Privacy 403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/draft reports are private/i);
  });

  test('3. Member CANNOT edit another member report (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${member2Token}`)
      .send({ notes: 'Malicious modification' });

    expect(res.status).toBe(403);
  });

  test('4. Manager CANNOT rewrite a member report content directly (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ notes: 'Manager trying to alter member content' });

    expect(res.status).toBe(403);
  });

  test('5. Member CANNOT call manager review action (Approve/Request Changes) (403 Forbidden)', async () => {
    // Set report to submitted
    member1DraftReport.status = REPORT_STATUS.SUBMITTED;
    await member1DraftReport.save();

    const res = await request(app)
      .post(`/api/reports/${member1DraftReport._id}/review`)
      .set('Authorization', `Bearer ${member1Token}`)
      .send({ action: 'approve' });

    expect(res.status).toBe(403);
  });

  test('6. Member CANNOT access manager-only endpoints (Users, Dashboard, Create Project) (403 Forbidden)', async () => {
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${member1Token}`);
    expect(usersRes.status).toBe(403);

    const dashRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${member1Token}`);
    expect(dashRes.status).toBe(403);

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${member1Token}`)
      .send({ name: 'Unauthorized Project' });
    expect(projRes.status).toBe(403);
  });

  test('7. End-to-End Review Cycle: Draft -> Submit (v1) -> Changes Requested -> Edit & Resubmit (v2) -> Manager Approves', async () => {
    // A) Member 1 submits report
    const submitRes = await request(app)
      .post(`/api/reports/${member1DraftReport._id}/submit`)
      .set('Authorization', `Bearer ${member1Token}`)
      .send({
        projectId: testProject._id,
        tasksCompleted: [
          {
            taskName: 'Feature A initial implementation',
            priority: 'Medium',
            plannedPercentage: 100,
            actualPercentage: 100,
            status: 'Done',
            plannedTime: 10,
            timeSpent: 10,
            outputDeliverable: 'Initial commit'
          }
        ]
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('submitted');
    expect(submitRes.body.data.versions.length).toBe(1);
    expect(submitRes.body.data.versions[0].versionNumber).toBe(1);

    // B) Manager requests changes with comment
    const requestChangesRes = await request(app)
      .post(`/api/reports/${member1DraftReport._id}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        action: 'request_changes',
        comment: 'Please add deliverable documentation link'
      });

    expect(requestChangesRes.status).toBe(200);
    expect(requestChangesRes.body.data.status).toBe('needs_correction');
    expect(requestChangesRes.body.data.latestReviewComment).toBe('Please add deliverable documentation link');
    expect(requestChangesRes.body.data.versions[0].reviewAction).toBe('changes_requested');

    // C) Member 1 sees feedback, edits and resubmits
    const updateRes = await request(app)
      .put(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${member1Token}`)
      .send({
        tasksCompleted: [
          {
            taskName: 'Feature A initial implementation',
            priority: 'Medium',
            plannedPercentage: 100,
            actualPercentage: 100,
            status: 'Done',
            plannedTime: 10,
            timeSpent: 10,
            outputDeliverable: 'https://docs.company.internal/feature-a'
          }
        ]
      });
    expect(updateRes.status).toBe(200);

    const resubmitRes = await request(app)
      .post(`/api/reports/${member1DraftReport._id}/submit`)
      .set('Authorization', `Bearer ${member1Token}`)
      .send();

    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.data.status).toBe('submitted');
    expect(resubmitRes.body.data.versions.length).toBe(2);
    expect(resubmitRes.body.data.versions[1].versionNumber).toBe(2);

    // D) Manager approves version 2
    const approveRes = await request(app)
      .post(`/api/reports/${member1DraftReport._id}/review`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        action: 'approve',
        comment: 'Approved! Great documentation.'
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('approved');
    expect(approveRes.body.data.versions[1].reviewAction).toBe('approved');

    // E) Member cannot edit an approved report
    const blockedEditRes = await request(app)
      .put(`/api/reports/${member1DraftReport._id}`)
      .set('Authorization', `Bearer ${member1Token}`)
      .send({ notes: 'Trying to edit approved report' });

    expect(blockedEditRes.status).toBe(400);
  });
  test('8. Paginated history exposes older reports without leaking another member', async () => {
    for (let i=0;i<21;i++) await Report.create({userId:member1User._id,weekStartDate:new Date('2026-08-31'),weekEndDate:new Date('2026-09-06'),weekNumber:36,year:2026,notes:`History ${i}`});
    const first=await request(app).get('/api/reports?page=1&limit=20').set('Authorization',`Bearer ${member1Token}`);
    const second=await request(app).get('/api/reports?page=2&limit=20').set('Authorization',`Bearer ${member1Token}`);
    expect(first.body.pagination.total).toBe(22);expect(first.body.data).toHaveLength(20);expect(second.body.data).toHaveLength(2);
    const firstIds=first.body.data.map(r=>r._id);expect(second.body.data.every(r=>!firstIds.includes(r._id))).toBe(true);
  });
  test('9. Correction working edits never overwrite snapshots or manager-visible content', async () => {
    await request(app).post(`/api/reports/${member1DraftReport._id}/submit`).set('Authorization',`Bearer ${member1Token}`).send();
    const noComment=await request(app).post(`/api/reports/${member1DraftReport._id}/review`).set('Authorization',`Bearer ${managerToken}`).send({action:'request_changes',comment:'   '});
    expect(noComment.status).toBe(400);
    await request(app).post(`/api/reports/${member1DraftReport._id}/review`).set('Authorization',`Bearer ${managerToken}`).send({action:'request_changes',comment:'Add details'});
    const before=await Report.findById(member1DraftReport._id).lean();
    await request(app).put(`/api/reports/${member1DraftReport._id}`).set('Authorization',`Bearer ${member1Token}`).send({notes:'UNSUBMITTED',achievements:[{description:'New private working achievement'}]});
    const managerView=await request(app).get(`/api/reports/${member1DraftReport._id}`).set('Authorization',`Bearer ${managerToken}`);
    expect(managerView.body.data.notes).not.toBe('UNSUBMITTED');
    await request(app).post(`/api/reports/${member1DraftReport._id}/submit`).set('Authorization',`Bearer ${member1Token}`).send();
    const after=await Report.findById(member1DraftReport._id).lean();
    expect(after.versions[0].snapshot).toEqual(before.versions[0].snapshot);
    expect(after.versions[1].snapshot.notes).toBe('UNSUBMITTED');
  });
  test('10. Dashboard date, project, member and status filters apply to charts and comparisons', async () => {
    await User.collection.updateMany({}, {$set:{createdAt:new Date('2026-01-01')}});
    await request(app).post(`/api/reports/${member1DraftReport._id}/submit`).set('Authorization',`Bearer ${member1Token}`).send();
    const query=`startDate=2026-08-31&endDate=2026-09-07&projectId=${testProject._id}&memberId=${member1User._id}`;
    const stats=await request(app).get(`/api/dashboard/stats?${query}`).set('Authorization',`Bearer ${managerToken}`);
    expect(stats.status).toBe(200);expect(stats.body.data.metrics.totalSubmitted).toBe(1);
    const charts=await request(app).get(`/api/dashboard/charts?${query}`).set('Authorization',`Bearer ${managerToken}`);
    expect(charts.body.data.projectDistribution).toHaveLength(1);
    const none=await request(app).get(`/api/dashboard/charts?${query}&status=approved`).set('Authorization',`Bearer ${managerToken}`);
    expect(none.body.data.projectDistribution).toHaveLength(0);
    const other=await request(app).get(`/api/dashboard/side-by-side?weekNumber=36&year=2026&memberId=${member2User._id}`).set('Authorization',`Bearer ${managerToken}`);
    expect(other.body.data).toEqual([]);
  });
  test('11. Project list contains accurate usage counts',async()=>{
    const res=await request(app).get('/api/projects').set('Authorization',`Bearer ${managerToken}`);
    expect(res.status).toBe(200);expect(res.body.data.find(p=>p._id===String(testProject._id)).reportCount).toBe(1);
  });

  test('12. Only draft reports can be deleted, non-draft reports and other members drafts reject deletion', async () => {
    // Create a draft for member1
    const draft = await Report.create({
      userId: member1User._id,
      weekStartDate: new Date('2026-09-07'),
      weekEndDate: new Date('2026-09-13'),
      weekNumber: 37,
      year: 2026,
      status: REPORT_STATUS.DRAFT,
      notes: 'Draft to delete'
    });

    // Another member cannot delete member1's draft
    const forbiddenRes = await request(app)
      .delete(`/api/reports/${draft._id}`)
      .set('Authorization', `Bearer ${member2Token}`);
    expect(forbiddenRes.status).toBe(403);

    // Member1 can successfully delete their draft
    const successRes = await request(app)
      .delete(`/api/reports/${draft._id}`)
      .set('Authorization', `Bearer ${member1Token}`);
    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);

    // Verify draft is deleted
    const checkDeleted = await Report.findById(draft._id);
    expect(checkDeleted).toBeNull();

    // Create a submitted report
    const submittedRpt = await Report.create({
      userId: member1User._id,
      weekStartDate: new Date('2026-09-07'),
      weekEndDate: new Date('2026-09-13'),
      weekNumber: 37,
      year: 2026,
      status: REPORT_STATUS.SUBMITTED,
      notes: 'Submitted report cannot be deleted'
    });

    // Attempt to delete submitted report should be blocked (400)
    const blockSubmittedRes = await request(app)
      .delete(`/api/reports/${submittedRpt._id}`)
      .set('Authorization', `Bearer ${member1Token}`);
    expect(blockSubmittedRes.status).toBe(400);
    expect(blockSubmittedRes.body.message).toMatch(/Only draft reports can be deleted/i);
  });

});

