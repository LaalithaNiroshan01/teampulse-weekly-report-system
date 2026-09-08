import React from 'react';
import { Plus, Trash2, Award, Star } from 'lucide-react';

export const AchievementsSection = ({ achievements = [], onChange, readOnly = false }) => {
  const handleAchChange = (index, field, value) => {
    if (readOnly) return;
    let updated = [...achievements];

    if (field === 'isKeyAchievement') {
      const currentValue = updated[index].isKeyAchievement;
      updated = updated.map((a, idx) => ({
        ...a,
        isKeyAchievement: idx === index ? !currentValue : false
      }));
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    onChange(updated);
  };

  const addAchievement = () => {
    if (readOnly) return;
    onChange([
      ...achievements,
      {
        description: '',
        isKeyAchievement: achievements.length === 0
      }
    ]);
  };

  const removeAchievement = (index) => {
    if (readOnly) return;
    const updated = achievements.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            Achievements & Highlights
          </h3>
          <p className="text-xs text-slate-500">
            Celebrate wins and breakthroughs. Flag one as the **Key Achievement** for the week.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addAchievement}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Achievement
          </button>
        )}
      </div>

      {achievements.length === 0 ? (
        <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
          No highlights recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                item.isKeyAchievement
                  ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.isKeyAchievement}
                    disabled={readOnly}
                    onChange={() => handleAchChange(idx, 'isKeyAchievement', true)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 disabled:opacity-50"
                  />
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    Key Achievement of the Week
                  </span>
                </label>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    title="Remove highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                {readOnly ? (
                  <p className="text-xs text-slate-800 font-medium">{item.description || '—'}</p>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Cut API latency by 40% and published RFC doc"
                    value={item.description}
                    onChange={(e) => handleAchChange(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;
