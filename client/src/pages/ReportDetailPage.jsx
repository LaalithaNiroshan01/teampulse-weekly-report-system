import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import ReportPrintDesignerModal from '../components/reports/ReportPrintDesignerModal';
import {
  FileText,
  ArrowLeft,
  Calendar,
  FolderKanban,
  User,
  Printer,
  FileEdit,
  CheckSquare,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
  Trash2
} from 'lucide-react';

export const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner text="Loading report..." />;
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Cannot View Report</h2>
        <p className="text-xs text-slate-500">{error || 'Report not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = report.userId?._id?.toString() === user?._id?.toString();
  const canEdit = isOwner && (report.status === 'draft' || report.status === 'needs_correction');

  const handleDeleteDraft = async () => {
    if (!window.confirm('Are you sure you want to delete this draft report? This action cannot be undone.')) return;
    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports', {
        replace: true,
        state: { message: 'Draft report deleted successfully.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete draft report');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-800" />
              Week {report.weekNumber}, {report.year} Report
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted by {report.userId?.name} ({report.userId?.title || report.userId?.department || 'Team Member'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-subtle"
            title="Open Report Print Designer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>

          {isOwner && report.status === 'draft' && (
            <button
              type="button"
              onClick={handleDeleteDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Draft
            </button>
          )}

          {canEdit && (
            <Link
              to={`/reports/${report._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Edit Report
            </Link>
          )}

          {isManager && report.status === 'submitted' && (
            <Link
              to={`/review/${report._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Review Report
            </Link>
          )}
        </div>
      </div>

      {/* Manager Feedback Banner (if changes requested or approved with comment) */}
      {report.latestReviewComment && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            report.status === 'needs_correction'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider">
              {report.status === 'needs_correction'
                ? 'Feedback: Changes Requested'
                : 'Manager Approval Notes'}
            </p>
            <p className="font-medium bg-white/70 p-2.5 rounded-xl border border-black/5">
              "{report.latestReviewComment}"
            </p>
          </div>
        </div>
      )}

      {/* Meta Header Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Author
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
              {report.userId?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{report.userId?.name}</p>
              <p className="text-[11px] text-slate-500">{report.userId?.email}</p>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Reporting Period
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Week {report.weekNumber}, {report.year}
          </div>
          <span className="text-[11px] text-slate-500">
            {new Date(report.weekStartDate).toLocaleDateString(undefined, { timeZone:'UTC'})} -{' '}
            {new Date(report.weekEndDate).toLocaleDateString(undefined, { timeZone:'UTC'})}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Project / Category
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
            Report Status
          </span>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Standardized Content Sections (Read-Only) */}
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

      {/* Notes & Links */}
      {(report.notes || (report.links && report.links.length > 0)) && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            6. Notes & Links
          </h2>
          {report.notes && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Notes:</span>
              <p className="text-slate-800 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                {report.notes}
              </p>
            </div>
          )}
          {report.links?.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Reference Links:
              </span>
              <div className="flex flex-wrap gap-2">
                {report.links.map((l, i) => {
                  const isSafe = typeof l.url === 'string' && /^(https?:\/\/)/i.test(l.url.trim());
                  return isSafe ? (
                    <a
                      key={i}
                      href={l.url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition text-xs font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{l.title || l.url}</span>
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium"
                    >
                      <span>{l.title || l.url}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Immutable Version Snapshots */}
      {report.versions?.length > 0 && (
        <VersionHistoryViewer
          versions={report.versions}
          currentVersionNumber={report.versions.length}
        />
      )}

      {/* Print Designer Modal */}
      <ReportPrintDesignerModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={report}
      />
    </div>
  );
};

export default ReportDetailPage;
