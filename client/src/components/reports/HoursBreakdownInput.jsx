import React from 'react';
import { Clock, PieChart } from 'lucide-react';

const categories = [
  { key: 'development', label: 'Development' },
  { key: 'testing', label: 'Testing' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'other', label: 'Other' }
];

export const HoursBreakdownInput = ({ value = {}, onChange, readOnly = false }) => {
  const handleChange = (key, val) => {
    if (readOnly) return;
    onChange({
      ...value,
      [key]: Math.max(0, Number(val) || 0)
    });
  };

  const total = categories.reduce((sum, cat) => sum + (Number(value[cat.key]) || 0), 0);

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-sky-600" />
            Hours Worked by Task Type (Optional)
          </h3>
          <p className="text-xs text-slate-500">
            Categorize your effort allocation across the work week.
          </p>
        </div>
        <div className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Total: {total} hrs
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 truncate">
              {cat.label}
            </label>
            {readOnly ? (
              <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 border border-slate-200 text-center">
                {value[cat.key] || 0}h
              </div>
            ) : (
              <input
                type="number"
                min="0"
                step="0.5"
                value={value[cat.key] || ''}
                placeholder="0"
                onChange={(e) => handleChange(cat.key, e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-medium focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoursBreakdownInput;
