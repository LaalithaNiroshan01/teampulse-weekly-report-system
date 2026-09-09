process.env.NODE_ENV='test';process.env.MONGODB_URI='';
const {connectDB,disconnectDB}=require('../config/db');
const seed=require('../seed/seedData');
const Report=require('../models/Report');
const User=require('../models/User');
test('fresh demo has three weeks and complete snapshots with usable historical membership',async()=>{
 const logging=jest.spyOn(console,'log').mockImplementation(()=>{});
 try {
  await connectDB();await seed();
  const reports=await Report.find().lean();
  expect(new Set(reports.map(r=>`${r.year}-${r.weekNumber}`)).size).toBe(3);
  for(const r of reports)for(const v of r.versions){
   for(const key of ['tasksCompleted','tasksPlannedNextWeek','blockers','achievements','hoursBreakdown','notes','links','weekStartDate','weekEndDate','project'])expect(v.snapshot).toHaveProperty(key);
  }
  const earliest=Math.min(...reports.map(r=>+r.weekStartDate));
  expect((await User.find().lean()).every(u=>+u.createdAt<earliest)).toBe(true);
 }finally{await disconnectDB();logging.mockRestore();}
});
