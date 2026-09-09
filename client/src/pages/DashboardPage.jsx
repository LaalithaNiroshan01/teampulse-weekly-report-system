import React, { useState, useEffect } from 'react';
import { weekInfo, shiftWeek } from '../utils/weeks';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MetricsCards from '../components/dashboard/MetricsCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import SubmissionMatrix from '../components/dashboard/SubmissionMatrix';
import SideBySideModal from '../components/dashboard/SideBySideModal';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Columns,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const DashboardPage = ({ onOpenAi }) => {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    if (!isManager) {
      navigate('/reports', { replace: true });
    }
  }, [isManager, navigate]);

  // Current week state
  const [weekNumber, setWeekNumber] = useState(weekInfo().weekNumber);
  const [year, setYear] = useState(weekInfo().year);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown options
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Dashboard datasets
  const [statsData, setStatsData] = useState(null);
  const [chartsData, setChartsData] = useState({});
  const [sideBySideData, setSideBySideData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSideBySideOpen, setIsSideBySideOpen] = useState(false);
  const [error, setError] = useState('');

  // Fetch filter dropdown options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [usersRes, projRes] = await Promise.all([
          api.get('/users'),
          api.get('/projects')
        ]);
        setMembers(usersRes.data.data?.filter((u) => u.role === 'member') || []);
        setProjects(projRes.data.data || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch all dashboard data when filters or week changes
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = startDate && endDate ? {startDate, endDate} : {weekNumber, year};
      if (selectedMember) params.memberId = selectedMember;
      if (selectedProject) params.projectId = selectedProject;
      if (selectedStatus) params.status = selectedStatus;

      const [statsRes, chartsRes, sideRes, actRes] = await Promise.all([
        api.get('/dashboard/stats', { params }),
        api.get('/dashboard/charts', { params }),
        api.get('/dashboard/side-by-side', { params }),
        api.get('/dashboard/activity', { params })
      ]);

      setStatsData(statsRes.data.data);
      setChartsData(chartsRes.data.data);
      setSideBySideData(sideRes.data.data || []);
      setActivityData(actRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [weekNumber, year, selectedMember, selectedProject, selectedStatus, startDate, endDate]);

  const changeWeek = delta => { const next = shiftWeek(year, weekNumber, delta); setYear(next.year); setWeekNumber(next.weekNumber); setStartDate(''); setEndDate(''); };
  const handlePrevWeek = () => changeWeek(-1);
  const handleNextWeek = () => changeWeek(1);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Team Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Weekly compliance, workload distribution, and member reviews.
          </p>
        </div>

        {/* Week navigation & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector Bar */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-xs p-1 text-xs">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition active:scale-95"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Week {weekNumber}, {year}</span>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition active:scale-95"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Side by side comparison button */}
          <button
            onClick={() => setIsSideBySideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Compare blockers and achievements across members"
          >
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare</span>
          </button>

          {/* AI Assistant button */}
          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs active:scale-95 cursor-pointer border border-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl border border-slate-200/80 bg-white/95 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition active:scale-95 shadow-xs"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider px-1">
          <Filter className="w-3.5 h-3.5 text-sky-600" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/90 px-2.5 py-1.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</span>
          <input
            aria-label="Start date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent text-slate-700 font-semibold text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50/90 px-2.5 py-1.5 rounded-xl border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</span>
          <input
            aria-label="End date"
            type="date"
            min={startDate}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent text-slate-700 font-semibold text-xs focus:outline-hidden"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200/60 transition active:scale-95"
          >
            Clear dates
          </button>
        )}

        {/* Member filter */}
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-700 font-semibold text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-2xs cursor-pointer"
        >
          <option value="">All Team Members</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Project filter */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-700 font-semibold text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-2xs cursor-pointer"
        >
          <option value="">All Projects / Categories</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-700 font-semibold text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-2xs cursor-pointer"
        >
          <option value="">All Submission Statuses</option>
          <option value="draft">Draft (Private)</option>
          <option value="submitted">Submitted</option>
          <option value="needs_correction">Needs Correction</option>
          <option value="approved">Approved</option>
          <option value="not_started">Not Yet Started</option>
        </select>

        {(selectedMember || selectedProject || selectedStatus) && (
          <button
            onClick={() => {
              setSelectedMember('');
              setSelectedProject('');
              setSelectedStatus('');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto px-2 py-1 rounded-lg hover:bg-rose-50 transition"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <LoadingSpinner text="Refreshing dashboard metrics..." />
      ) : (
        <>
          {/* 1. Metric Summary Cards */}
          <MetricsCards metrics={statsData?.metrics || {}} />

          {/* 2. Team Member Submission Matrix */}
          <SubmissionMatrix matrix={statsData?.matrix || []} />

          {/* 3. Visual Charts Insights */}
          <DashboardCharts chartsData={chartsData} />

          {/* 4. Recent Activity Feed */}
          <ActivityFeed activities={activityData} />
        </>
      )}

      {/* Bonus Side-by-Side Modal */}
      <SideBySideModal
        isOpen={isSideBySideOpen}
        onClose={() => setIsSideBySideOpen(false)}
        data={sideBySideData}
        weekNumber={weekNumber}
        year={year}
      />
    </div>
  );
};

export default DashboardPage;
