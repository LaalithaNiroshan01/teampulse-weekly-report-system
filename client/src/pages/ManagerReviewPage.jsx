import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskCompletedTable from '../components/reports/TaskCompletedTable';
import TaskPlannedTable from '../components/reports/TaskPlannedTable';
import BlockersSection from '../components/reports/BlockersSection';
import AchievementsSection from '../components/reports/AchievementsSection';
import HoursBreakdownInput from '../components/reports/HoursBreakdownInput';
import VersionHistoryViewer from '../components/reports/VersionHistoryViewer';
import ReviewActionModal from '../components/reports/ReviewActionModal';
import {
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  History,
  Lock
} from 'lucide-react';

export const ManagerReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Protect route
  useEffect(() => {
    if (!isManager) {
      navigate('/reports', { replace: true });
    }
  }, [isManager, navigate]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report for review');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleReviewDecision = async ({ action, comment }) => {
    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/reports/${id}/review`, { action, comment });
      await fetchReport();
      setIsModalOpen(false);
      setSuccessMessage(
        action === 'approve'
          ? 'Report successfully approved!'
          : 'Changes requested. The report has been returned to the member for correction.'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review decision');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading submitted report for review..." />;
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Cannot Review Report</h2>
        <p className="text-xs text-slate-500">{error || 'Report not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isSubmitted = report.status === 'submitted';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-slate-800" />
              Review Report: {report.userId?.name}
            </h1>
            <p className="text-xs text-slate-500">
              Review submitted work and approve or request revisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          {isSubmitted ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Take Review Action
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Reviewed ({report.status})
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Manager Non-Rewriting Rule Callout */}
      <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <span>
            <strong>Review Mode:</strong> Report content is read-only. Reviews record decisions and feedback on this snapshot.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-700">
          Version {report.versions?.length || 1}
        </span>
      </div>

      {/* Author & Period Summary Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Team Member
          </span>
          <Link
            to={`/team/${report.userId?._id}`}
            className="font-bold text-slate-900 hover:text-slate-700 transition block"
          >
            {report.userId?.name}
          </Link>
          <span className="text-[11px] text-slate-500">{report.userId?.title}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Week / Dates
          </span>
          <span className="font-bold text-slate-800 block">
            Week {report.weekNumber}, {report.year}
          </span>
          <span className="text-[11px] text-slate-500">
            {new Date(report.weekStartDate).toLocaleDateString(undefined, { timeZone:'UTC'})} -{' '}
            {new Date(report.weekEndDate).toLocaleDateString(undefined, { timeZone:'UTC'})}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Project Category
          </span>
          {report.projectId ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
              style={{
                backgroundColor: `${report.projectId.color || '#3B82F6'}15`,
                borderColor: `${report.projectId.color || '#3B82F6'}40`,
                color: report.projectId.color || '#1E40AF'
              }}
            >
              {report.projectId.name}
            </span>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Latest Review Decision
          </span>
          {report.latestReviewComment ? (
            <span className="text-slate-800 font-medium truncate block" title={report.latestReviewComment}>
              "{report.latestReviewComment}"
            </span>
          ) : (
            <span className="text-slate-400 italic">Pending review</span>
          )}
        </div>
      </div>

      {/* Standardized Content Sections */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          1. Tasks Completed
        </h2>
        <TaskCompletedTable tasks={report.tasksCompleted} readOnly={true} />
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          2. Planned for Next Week
        </h2>
        <TaskPlannedTable tasks={report.tasksPlannedNextWeek} readOnly={true} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Blockers & Challenges
          </h2>
          <BlockersSection blockers={report.blockers} readOnly={true} />
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            4. Achievements & Highlights
          </h2>
          <AchievementsSection achievements={report.achievements} readOnly={true} />
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          5. Hours Breakdown
        </h2>
        <HoursBreakdownInput value={report.hoursBreakdown || {}} readOnly={true} />
      </div>

      <section className="bg-white rounded-xl p-5 text-sm space-y-3"><h2 className="font-bold">Notes & Links</h2><p className="whitespace-pre-wrap">{report.notes || 'None'}</p>{(report.links || []).map((link,i) => <p key={i}>{link.title}: {/^(https?):\/\//i.test(link.url) ? <a href={link.url} target="_blank" rel="noreferrer" className="text-sky-700 underline">{link.url}</a> : link.url}</p>)}</section>
      {/* Version Snapshots Audit List */}
      {report.versions?.length > 0 && (
        <VersionHistoryViewer
          versions={report.versions}
          currentVersionNumber={report.versions.length}
        />
      )}

      {/* Review Modal */}
      <ReviewActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewDecision}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
};

export default ManagerReviewPage;
