import React from 'react';
import { Send, Percent, AlertCircle, AlertOctagon } from 'lucide-react';

export const MetricsCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: 'Reports Submitted',
      value: metrics.totalSubmitted ?? 0,
      subtext: 'Submitted for this reporting period',
      icon: Send,
      alert: false
    },
    {
      title: 'Compliance Rate',
      value: `${metrics.complianceRate ?? 0}%`,
      subtext: `${metrics.submittedCount ?? metrics.totalSubmitted ?? 0} submitted · ${metrics.pendingCount ?? 0} pending`,
      icon: Percent,
      alert: false
    },
    {
      title: 'Revisions Requested',
      value: metrics.needsCorrectionCount ?? 0,
      subtext: 'Reports awaiting member updates',
      icon: AlertCircle,
      alert: (metrics.needsCorrectionCount ?? 0) > 0,
      alertColor: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      title: 'Active Blockers',
      value: metrics.openBlockersCount ?? 0,
      subtext: 'Unresolved issues across team projects',
      icon: AlertOctagon,
      alert: (metrics.openBlockersCount ?? 0) > 0,
      alertColor: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {card.title}
              </span>
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.alert && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.alertColor}`}>
                  Action required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
