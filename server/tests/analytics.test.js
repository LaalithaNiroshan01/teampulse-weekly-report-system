const { period, summarize, submittedContent } = require('../services/reportAnalytics');
const members = [{_id:'a', name:'A'}, {_id:'b', name:'B'}];
const range = period({weekNumber:36,year:2026});
const report = {_id:'r',userId:'a',weekNumber:36,year:2026,status:'needs_correction',versions:[{submittedAt:'2026-09-04T10:00:00Z'}],blockers:[{description:'open'},{description:'fixed',isResolved:true}]};
test('correction submissions count, duplicates cannot inflate member compliance, and only unresolved blockers count',()=>{
 const data=summarize(members,[report,{...report,_id:'r2',blockers:[]}],range,{},new Date('2026-09-08'));
 expect(data.metrics.totalSubmitted).toBe(2); expect(data.metrics.complianceRate).toBe(50);
 expect(data.metrics.openBlockersCount).toBe(1);expect(data.metrics.overdueCount).toBe(1);
 expect(data.matrix).toHaveLength(3);
});
test('late first submission remains late after approval and resubmission',()=>{
 const data=summarize(members,[{...report,status:'approved',versions:[{submittedAt:'2026-09-08T10:00:00Z'},{submittedAt:'2026-09-09T10:00:00Z'}]}],range,{},new Date('2026-09-10'));
 expect(data.metrics.lateCount).toBe(1);expect(data.metrics.complianceRate).toBe(0);
});
test('period supports year boundaries and rejects invalid ranges',()=>{
 expect(period({startDate:'2026-12-28',endDate:'2027-01-10'}).weeks.map(w=>[w.year,w.weekNumber])).toEqual([[2026,53],[2027,1]]);
 expect(()=>period({startDate:'2026-09-20',endDate:'2026-09-01'})).toThrow();
 expect(()=>period({weekNumber:53,year:2025})).toThrow();
});
test('team reads use submitted snapshot instead of working correction edits',()=>{
 const r={...report,notes:'unsubmitted edit',versions:[{snapshot:{notes:'submitted notes',blockers:[]}}]};
 expect(submittedContent(r).notes).toBe('submitted notes');expect(r.notes).toBe('unsubmitted edit');
});
test('status filter does not change the expected compliance denominator',()=>{
 const data=summarize(members,[report],range,{status:'not_started'},new Date('2026-09-08'));
 expect(data.matrix).toHaveLength(1);expect(data.metrics.complianceRate).toBe(50);expect(data.metrics.totalSubmitted).toBe(0);
});
