import React from 'react';
import { Clock, CheckCircle2, AlertCircle, FileEdit, CircleDashed } from 'lucide-react';

const statusConfig = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-slate-100/90',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200/90',
    dotColor: 'bg-slate-400',
    icon: FileEdit
  },
  submitted: {
    label: 'Submitted',
    bgColor: 'bg-sky-50/90',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200/80',
    dotColor: 'bg-sky-500',
    pulse: true,
    icon: Clock
  },
  needs_correction: {
    label: 'Needs Correction',
    bgColor: 'bg-amber-50/90',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200/90',
    dotColor: 'bg-amber-500',
    pulse: true,
    icon: AlertCircle
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-emerald-50/90',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200/80',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle2
  },
  not_started: {
    label: 'Not Started',
    bgColor: 'bg-rose-50/80',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200/70',
    dotColor: 'bg-rose-500',
    icon: CircleDashed
  }
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotColor}`}></span>
      </span>
      <Icon className={`${iconSizes[size]} opacity-85`} />
      <span className="tracking-tight">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
