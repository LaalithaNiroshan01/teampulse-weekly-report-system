import React from 'react';
import { Send, Percent, AlertCircle, AlertOctagon, TrendingUp, Users } from 'lucide-react';

export const MetricsCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: 'Submitted Reports',
      value: metrics.totalSubmitted ?? 0,
      subtext: 'Submitted this week',
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'On-time Compliance',
      value: `${metrics.complianceRate ?? 0}%`,
      subtext: `${metrics.submittedCount ?? metrics.totalSubmitted ?? 0} submitted · ${metrics.pendingCount ?? 0} pending`,
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Needs Correction',
      value: metrics.needsCorrectionCount ?? 0,
      subtext: 'Awaiting member revision',
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Open Team Blockers',
      value: metrics.openBlockersCount ?? 0,
      subtext: 'Across active projects',
      icon: AlertOctagon,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift"
          >
            {/* Top decorative accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${
              idx === 0 ? 'bg-blue-600' :
              idx === 1 ? 'bg-emerald-600' :
              idx === 2 ? 'bg-amber-500' :
              'bg-rose-500'
            }`} />

            <div className="flex items-center justify-between mb-3 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color} shadow-2xs border border-white/60`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {card.value}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
