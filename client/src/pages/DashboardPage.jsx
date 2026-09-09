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

  const pendingReviews = (statsData?.matrix || []).filter((r) => r.status === 'submitted');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-800" />
            <span>Team Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Week {weekNumber}, {year} · Compliance tracking, review queue, and engineering workload
          </p>
        </div>

        {/* Week navigation & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector Bar */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 text-xs">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Week {weekNumber}, {year}</span>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Side by side comparison button */}
          <button
            onClick={() => setIsSideBySideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
            title="Compare blockers and achievements across members"
          >
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span>Compare</span>
          </button>

          {/* AI Assistant button */}
          {onOpenAi && (
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer border border-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Actionable Review Queue Banner */}
      {!isLoading && pendingReviews.length > 0 && (
        <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
            <span className="font-semibold">
              {pendingReviews.length} weekly report{pendingReviews.length > 1 ? 's are' : ' is'} waiting for your review.
            </span>
          </div>
          <span className="text-[11px] text-sky-700 font-medium">
            Take action in the submission table below
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider px-1">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">From</span>
          <input
            aria-label="Start date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent text-slate-700 font-medium text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">To</span>
          <input
            aria-label="End date"
            type="date"
            min={startDate}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent text-slate-700 font-medium text-xs focus:outline-hidden"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition"
          >
            Clear dates
          </button>
        )}

        {/* Member filter */}
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:ring-1 focus:ring-slate-900 transition cursor-pointer"
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
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:ring-1 focus:ring-slate-900 transition cursor-pointer"
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
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:ring-1 focus:ring-slate-900 transition cursor-pointer"
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
            className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto px-2 py-1 rounded-lg hover:bg-rose-50 transition"
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
