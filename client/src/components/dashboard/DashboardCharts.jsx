import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Clock } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

export const DashboardCharts = ({ chartsData = {} }) => {
  const {
    tasksTrend = [],
    projectDistribution = [],
    timeSpentChart = [],
    memberStatusChart = []
  } = chartsData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Tasks Completed Trend Over Time */}
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Tasks Completed Trend
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Weekly velocity and completed tasks</p>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          {tasksTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasksTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="taskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="weekNumber" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tasksCompleted"
                  name="Tasks Completed"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#taskTrendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* 2. Workload / Task Distribution by Project */}
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Tasks by Project
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Distribution across active projects</p>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          {projectDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  dataKey="taskCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#fff',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                  formatter={(val, name, item) => [`${val} tasks (${item.payload.hours || 0}h)`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No project task data for this week
            </div>
          )}
        </div>
      </div>

      {/* 3. Team Time Spent by Task Type */}
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Logged Hours by Category
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Development, testing, and meetings breakdown</p>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          {timeSpentChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSpentChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="taskType" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#fff',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                  formatter={(val) => [`${val} hours`, 'Time Spent']}
                />
                <Bar dataKey="hours" name="Hours Logged" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No time breakdown logged for this week
            </div>
          )}
        </div>
      </div>

      {/* 4. Report Submission Status by Member */}
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Status by Member
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Submission state across team roster</p>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          {memberStatusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStatusChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="approved" name="Approved" fill="#10B981" stackId="a" />
                <Bar dataKey="submitted" name="Submitted" fill="#0284C7" stackId="a" />
                <Bar dataKey="needsCorrection" name="Needs Correction" fill="#F59E0B" stackId="a" />
                <Bar dataKey="draft" name="Draft" fill="#94A3B8" stackId="a" />
                <Bar dataKey="notStarted" name="Not Started" fill="#F43F5E" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No member status data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
