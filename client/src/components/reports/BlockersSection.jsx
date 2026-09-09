import React from 'react';
import { Plus, Trash2, AlertOctagon, Flame } from 'lucide-react';

export const BlockersSection = ({ blockers = [], onChange, readOnly = false }) => {
  const handleBlockerChange = (index, field, value) => {
    if (readOnly) return;
    let updated = [...blockers];

    if (field === 'isKeyIssue') {
      // Toggle key issue: only ONE can be key issue
      const currentValue = updated[index].isKeyIssue;
      updated = updated.map((b, idx) => ({
        ...b,
        isKeyIssue: idx === index ? !currentValue : false
      }));
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    onChange(updated);
  };

  const addBlocker = () => {
    if (readOnly) return;
    onChange([
      ...blockers,
      {
        description: '',
        impact: '',
        isKeyIssue: blockers.length === 0 // Default first as key issue if none exist
      }
    ]);
  };

  const removeBlocker = (index) => {
    if (readOnly) return;
    const updated = blockers.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Blockers & Challenges
          </h3>
          <p className="text-xs text-slate-500">
            Document impediments. Flag one blocker as the **Key Issue** for manager escalation.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addBlocker}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Blocker
          </button>
        )}
      </div>

      {blockers.length === 0 ? (
        <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
          No blockers reported.
        </div>
      ) : (
        <div className="space-y-2.5">
          {blockers.map((blocker, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                blocker.isKeyIssue
                  ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={blocker.isKeyIssue}
                    disabled={readOnly}
                    onChange={() => handleBlockerChange(idx, 'isKeyIssue', true)}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 disabled:opacity-50"
                  />
                  <span className="flex items-center gap-1 text-xs font-semibold text-rose-800">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Key Issue for the Week
                  </span>
                </label>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeBlocker(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition ml-auto"
                    title="Remove blocker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <label className="flex gap-2 items-center text-xs mb-3"><input type="checkbox" checked={!!blocker.isResolved} disabled={readOnly} onChange={e => handleBlockerChange(idx, 'isResolved', e.target.checked)} />Resolved</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Description *
                  </label>
                  {readOnly ? (
                    <p className="text-xs text-slate-800 font-medium">{blocker.description || '—'}</p>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Staging VPC peering awaiting SecOps approval"
                      value={blocker.description}
                      onChange={(e) => handleBlockerChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Impact & Urgency
                  </label>
                  {readOnly ? (
                    <p className="text-xs text-slate-600">{blocker.impact || '—'}</p>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. High — blocks database migration testing"
                      value={blocker.impact}
                      onChange={(e) => handleBlockerChange(idx, 'impact', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockersSection;
