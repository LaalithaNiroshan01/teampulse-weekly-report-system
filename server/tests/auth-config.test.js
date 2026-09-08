const {getJwtSecret}=require('../config/auth');
test('JWT configuration rejects missing and public sample secrets',()=>{
 const original=process.env.JWT_SECRET;
 try{delete process.env.JWT_SECRET;expect(()=>getJwtSecret()).toThrow();process.env.JWT_SECRET='super_secret_jwt_key_weekly_report_generator_2026';expect(()=>getJwtSecret()).toThrow();process.env.JWT_SECRET='test-only-unique-value-over-thirty-two-characters';expect(getJwtSecret()).toBe(process.env.JWT_SECRET);}finally{if(original===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=original;}
});
