import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { History, Plus, FileEdit, Eye, AlertCircle, Calendar, Trash2 } from 'lucide-react';

export const ReportHistoryPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({pages: 1});
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20, userId: user._id };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/reports', { params });
      setReports(res.data.data || []);
      setPagination(res.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this draft report?')) return;
    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete draft report');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, page]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header & New Report Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-slate-800" />
            Report History
          </h1>
          <p className="text-xs text-slate-500">
            Past reports, submission records, and review feedback.
          </p>
        </div>
        <Link
          to="/reports/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
          Status:
        </span>
        {[
          { label: 'All Reports', value: '' },
          { label: 'Drafts', value: 'draft' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Needs Correction', value: 'needs_correction' },
          { label: 'Approved', value: 'approved' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white font-medium shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-center"><button className="px-3 py-2 border rounded disabled:opacity-40" disabled={page <= 1 || isLoading} onClick={() => setPage(page-1)}>Previous</button><span>Page {page} of {Math.max(1,pagination.pages || 1)}</span><button className="px-3 py-2 border rounded disabled:opacity-40" disabled={page >= pagination.pages || isLoading} onClick={() => setPage(page+1)}>Next</button></div>
      {/* Error Notice */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Table / Cards */}
      {isLoading ? (
        <LoadingSpinner text="Loading report history..." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={History}
          title="No reports found"
          description="You haven't created any reports matching this status filter yet."
          action={
            <Link
              to="/reports/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Report
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Period / Week</th>
                  <th className="py-3 px-3">Project / Category</th>
                  <th className="py-3 px-3">Tasks Completed</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Manager Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rpt) => {
                  const isEditable = rpt.status === 'draft' || rpt.status === 'needs_correction';
                  const taskCount = rpt.tasksCompleted ? rpt.tasksCompleted.length : 0;
                  const doneCount = rpt.tasksCompleted
                    ? rpt.tasksCompleted.filter((t) => t.status === 'Done').length
                    : 0;

                  return (
                    <tr key={rpt._id} className="hover:bg-slate-50/60 transition">
                      {/* Week info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            W{rpt.weekNumber}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Week {rpt.weekNumber}, {rpt.year}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(rpt.weekStartDate).toLocaleDateString(undefined, { timeZone:'UTC',
                                month: 'short',
                                day: 'numeric'
                              })}{' '}
                              -{' '}
                              {new Date(rpt.weekEndDate).toLocaleDateString(undefined, { timeZone:'UTC',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-3">
                        {rpt.projectId ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                            style={{
                              backgroundColor: `${rpt.projectId.color || '#3B82F6'}15`,
                              borderColor: `${rpt.projectId.color || '#3B82F6'}40`,
                              color: rpt.projectId.color || '#1E40AF'
                            }}
                          >
                            {rpt.projectId.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Tasks count */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">
                          {doneCount} / {taskCount} done
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={rpt.status} size="sm" />
                      </td>

                      {/* Review Comment */}
                      <td className="py-3.5 px-3 max-w-xs">
                        {rpt.latestReviewComment ? (
                          <span
                            className={`block truncate text-xs ${
                              rpt.status === 'needs_correction'
                                ? 'text-amber-800 font-semibold'
                                : 'text-slate-600'
                            }`}
                            title={rpt.latestReviewComment}
                          >
                            "{rpt.latestReviewComment}"
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditable && (
                            <Link
                              to={`/reports/${rpt._id}/edit`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs"
                            >
                              <FileEdit className="w-3 h-3" />
                              Edit
                            </Link>
                          )}
                          {rpt.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(rpt._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            to={`/reports/${rpt._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHistoryPage;
