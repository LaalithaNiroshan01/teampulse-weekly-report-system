import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Lock, Eye, CheckSquare, Clock, User } from 'lucide-react';

export const SubmissionMatrix = ({ matrix = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Team Member Submission Status
          </h3>
          <p className="text-xs text-slate-500">
            Weekly member submission and review status.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
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
              const { member, status, reportId, project, updatedAt, latestReviewComment, isDraftPrivate } = row;
              const isSubmitted = status === 'submitted';
              const isApproved = status === 'approved';
              const isNeedsCorrection = status === 'needs_correction';
              const isDraft = status === 'draft';
              const isNotStarted = status === 'not_started';

              return (
                <tr key={`${member._id}-${row.year}-${row.weekNumber}-${reportId || "none"}`} className="hover:bg-slate-50/80 transition-colors">
                  {/* Member info & Profile link */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/team/${member._id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:border-slate-900 transition-all duration-200">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-slate-700 transition block">
                          {member.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {row.year} W{row.weekNumber} · {member.title || member.department}
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
                          borderColor: `${project.color || '#3B82F6'}40`,
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
                      <span className="text-slate-700 truncate block" title={latestReviewComment}>
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs active:scale-95 transition-all"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>
                    )}

                    {(isApproved || isNeedsCorrection) && (
                      <Link
                        to={`/reports/${reportId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/80 transition-all active:scale-95 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </Link>
                    )}

                    {isDraft && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-400 bg-slate-100/60 border border-slate-200/60 cursor-not-allowed"
                        title="Draft content is strictly private to the author until submitted."
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Draft Protected</span>
                      </span>
                    )}

                    {isNotStarted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-600 bg-rose-50/70 border border-rose-200/60">
                        <Clock className="w-3 h-3" />
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
