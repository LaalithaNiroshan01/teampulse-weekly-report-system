import React, { useState } from 'react';
import { History, Clock, MessageSquare, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import TaskCompletedTable from './TaskCompletedTable';
import TaskPlannedTable from './TaskPlannedTable';
import BlockersSection from './BlockersSection';
import AchievementsSection from './AchievementsSection';
import HoursBreakdownInput from './HoursBreakdownInput';

export const VersionHistoryViewer = ({ versions = [], currentVersionNumber }) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <History className="w-4 h-4 text-sky-600" />
          Submission & Version History ({versions.length})
        </h3>
        <span className="text-xs text-slate-400">
          Immutable audit trail of submitted snapshots
        </span>
      </div>

      <div className="space-y-2.5">
        {versions.map((ver, idx) => {
          const isLatest = idx === versions.length - 1;
          const isApproved = ver.reviewAction === 'approved';
          const isChangesReq = ver.reviewAction === 'changes_requested';

          return (
            <div
              key={ver._id || idx}
              className={`p-3 rounded-lg border text-xs transition ${
                isLatest
                  ? 'bg-sky-50/40 border-sky-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Version {ver.versionNumber}
                  </span>
                  {isLatest && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-600 text-white rounded">
                      Current
                    </span>
                  )}
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(ver.submittedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {isChangesReq && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3" />
                      Changes Requested
                    </span>
                  )}
                  {ver.reviewAction === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3 h-3" />
                      Awaiting Review
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedSnapshot(ver)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-medium transition text-[11px]"
                  >
                    <Eye className="w-3 h-3" />
                    View Snapshot
                  </button>
                </div>
              </div>

              {/* Reviewer comment tied directly to this version */}
              {ver.reviewComment && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-start gap-2 text-slate-700 bg-white/70 p-2 rounded">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      {ver.reviewedBy?.name || 'Manager'}:
                    </span>{' '}
                    <span>{ver.reviewComment}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Snapshot Modal */}
      <Modal
        isOpen={!!selectedSnapshot}
        onClose={() => setSelectedSnapshot(null)}
        title={`Snapshot: Version ${selectedSnapshot?.versionNumber}`}
        maxWidth="max-w-3xl"
      >
        {selectedSnapshot && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-[11px] text-slate-500">Submitted Timestamp</p>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedSnapshot.submittedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Review Outcome</p>
                <p className="font-semibold text-slate-800 capitalize">
                  {selectedSnapshot.reviewAction?.replace('_', ' ') || 'Pending'}
                </p>
              </div>
            </div>

            <p>Week {selectedSnapshot.snapshot?.weekNumber}, {selectedSnapshot.snapshot?.year} · {selectedSnapshot.snapshot?.weekStartDate?.slice(0,10)} to {selectedSnapshot.snapshot?.weekEndDate?.slice(0,10)}</p>
            <p>Project: {selectedSnapshot.snapshot?.project?.name || selectedSnapshot.snapshot?.projectId?.name || String(selectedSnapshot.snapshot?.projectId || 'Not recorded')}</p>
            <TaskCompletedTable tasks={selectedSnapshot.snapshot?.tasksCompleted || []} readOnly />
            <TaskPlannedTable tasks={selectedSnapshot.snapshot?.tasksPlannedNextWeek || []} readOnly />
            <BlockersSection blockers={selectedSnapshot.snapshot?.blockers || []} readOnly />
            <AchievementsSection achievements={selectedSnapshot.snapshot?.achievements || []} readOnly />
            <HoursBreakdownInput value={selectedSnapshot.snapshot?.hoursBreakdown || {}} readOnly />
            <section><h4 className="font-bold">Notes</h4><p className="whitespace-pre-wrap">{selectedSnapshot.snapshot?.notes || 'None'}</p></section>
            <section><h4 className="font-bold">Links</h4>{(selectedSnapshot.snapshot?.links || []).map((link,i) => <p key={i}>{link.title}: {/^(https?):\/\//i.test(link.url) ? <a className="text-sky-700 underline" href={link.url} target="_blank" rel="noreferrer">{link.url}</a> : link.url}</p>)}</section>
            <p>Review: {selectedSnapshot.reviewComment || 'Awaiting review'} {selectedSnapshot.reviewedAt && `(${new Date(selectedSnapshot.reviewedAt).toLocaleString()})`}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VersionHistoryViewer;
