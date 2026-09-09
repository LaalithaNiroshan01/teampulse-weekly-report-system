import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Lock, Eye, CheckSquare, Clock } from 'lucide-react';

export const SubmissionMatrix = ({ matrix = [] }) => {
  const pendingReviewCount = matrix.filter((r) => r.status === 'submitted').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Team Submission Status
            </h3>
            {pendingReviewCount > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {pendingReviewCount} awaiting review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Member report status, deliverables, and review actions for the selected week.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Drafts are private to author</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Team Member</th>
              <th className="py-3 px-3">Project / Category</th>
              <th className="py-3 px-3">Submission Status</th>
              <th className="py-3 px-3">Latest Update / Feedback</th>
              <th className="py-3 px-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((row) => {
              const { member, status, reportId, project, updatedAt, latestReviewComment } = row;
              const isSubmitted = status === 'submitted';
              const isApproved = status === 'approved';
              const isNeedsCorrection = status === 'needs_correction';
              const isDraft = status === 'draft';
              const isNotStarted = status === 'not_started';

              return (
                <tr
                  key={`${member._id}-${row.year}-${row.weekNumber}-${reportId || 'none'}`}
                  className={`transition-colors ${isSubmitted ? 'bg-sky-50/20 hover:bg-sky-50/40' : 'hover:bg-slate-50/60'}`}
                >
                  {/* Member info & Profile link */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/team/${member._id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center font-bold text-xs border border-slate-200 transition-colors">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-slate-700 transition block">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {member.title || member.department || 'Engineer'}
                        </span>
                      </div>
                    </Link>
                  </td>

                  {/* Project Tag */}
                  <td className="py-3.5 px-3">
                    {project ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${project.color || '#3B82F6'}15`,
                          borderColor: `${project.color || '#3B82F6'}35`,
                          color: project.color || '#1E40AF'
                        }}
                      >
                        {project.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3">
                    <StatusBadge status={status} size="sm" />
                  </td>

                  {/* Latest Update or Feedback */}
                  <td className="py-3.5 px-3 max-w-xs">
                    {isDraft ? (
                      <span className="text-slate-400 italic flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        In-progress draft (Private)
                      </span>
                    ) : latestReviewComment ? (
                      <span
                        className={`truncate block ${isNeedsCorrection ? 'text-amber-800 font-medium' : 'text-slate-600'}`}
                        title={latestReviewComment}
                      >
                        "{latestReviewComment}"
                      </span>
                    ) : updatedAt ? (
                      <span className="text-slate-500">
                        {new Date(updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {isSubmitted && (
                      <Link
                        to={`/review/${reportId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Review Report</span>
                      </Link>
                    )}

                    {(isApproved || isNeedsCorrection) && (
                      <Link
                        to={`/reports/${reportId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </Link>
                    )}

                    {isDraft && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 bg-slate-100/60 border border-slate-200/60"
                        title="Draft content is strictly private to the author until submitted."
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Draft</span>
                      </span>
                    )}

                    {isNotStarted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Not Started</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionMatrix;
