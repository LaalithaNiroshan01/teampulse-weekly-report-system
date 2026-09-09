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

const COLORS = ['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export const DashboardCharts = ({ chartsData = {} }) => {
  const {
    tasksTrend = [],
    projectDistribution = [],
    timeSpentChart = [],
    memberStatusChart = []
  } = chartsData;

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155',
    color: '#ffffff',
    fontSize: '11px',
    padding: '8px 12px'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Tasks Completed Trend Over Time */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <TrendingUp className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tasks Completed Trend
            </h3>
            <p className="text-xs text-slate-500">Weekly team task volume across past cycles</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {tasksTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasksTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="weekNumber" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="tasksCompleted"
                  name="Tasks Completed"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fill="#0284c7"
                  fillOpacity={0.08}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend data available for this period
            </div>
          )}
        </div>
      </div>

      {/* 2. Workload / Task Distribution by Project */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <PieIcon className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tasks by Project
            </h3>
            <p className="text-xs text-slate-500">Distribution across active project categories</p>
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
                  paddingAngle={3}
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val, name, item) => [`${val} tasks (${item.payload.hours || 0}h)`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No project distribution logged for this week
            </div>
          )}
        </div>
      </div>

      {/* 3. Team Time Spent by Task Type */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Logged Hours by Category
            </h3>
            <p className="text-xs text-slate-500">Effort breakdown across development, testing, and meetings</p>
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
                  contentStyle={tooltipStyle}
                  formatter={(val) => [`${val} hours`, 'Time Spent']}
                />
                <Bar dataKey="hours" name="Hours Logged" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No hourly breakdown logged for this week
            </div>
          )}
        </div>
      </div>

      {/* 4. Report Submission Status by Member */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <BarChart3 className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Status by Team Member
            </h3>
            <p className="text-xs text-slate-500">Submission states across active team roster</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {memberStatusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStatusChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" stackId="a" />
                <Bar dataKey="submitted" name="Submitted" fill="#0284c7" stackId="a" />
                <Bar dataKey="needsCorrection" name="Needs Correction" fill="#f59e0b" stackId="a" />
                <Bar dataKey="draft" name="Draft" fill="#94a3b8" stackId="a" />
                <Bar dataKey="notStarted" name="Not Started" fill="#f43f5e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No member status records for this week
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
