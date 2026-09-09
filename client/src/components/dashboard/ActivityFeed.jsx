import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Review Activity</h3>
          <p className="text-xs text-slate-500">Live feed of submissions & manager review decisions</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          No recent activity recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const isApproved = act.type === 'approved';
            const isCorrection = act.type === 'correction_requested';

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition text-xs"
              >
                <div className="mt-0.5">
                  {isApproved ? (
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCorrection ? (
                    <div className="p-1 rounded-full bg-amber-100 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-blue-100 text-blue-700">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-slate-900 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.detail}</p>
                </div>

                <Link
                  to={`/reports/${act.reportId}`}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition shrink-0"
                  title="View report"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
