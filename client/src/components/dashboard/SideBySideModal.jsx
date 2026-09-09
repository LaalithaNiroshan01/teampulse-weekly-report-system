import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Flame, Star, AlertOctagon, Award, User } from 'lucide-react';

export const SideBySideModal = ({ isOpen, onClose, data = [], weekNumber, year }) => {
  const [activeTab, setActiveTab] = useState('blockers'); // 'blockers' or 'achievements'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Team Comparison: Week ${weekNumber}, ${year}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('blockers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'blockers'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Side-by-Side Blockers
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'achievements'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Side-by-Side Achievements
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            {data.length} submitted report(s)
          </span>
        </div>

        {/* Content list */}
        {data.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No submitted reports for this week yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {data.map((item) => {
              const memberName = item.member?.name || 'Unknown Member';
              const projName = item.project?.name || 'General';

              return (
                <div
                  key={item.reportId}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {memberName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{memberName}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {projName}
                    </span>
                  </div>

                  {activeTab === 'blockers' ? (
                    <div className="space-y-1.5">
                      {item.blockers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No blockers reported.</p>
                      ) : (
                        item.blockers.map((b, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-xs ${
                              b.isKeyIssue
                                ? 'bg-rose-50 border border-rose-200 text-rose-900 font-medium'
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {b.isKeyIssue && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 mb-0.5">
                                <Flame className="w-3 h-3 fill-rose-600 text-rose-600" />
                                Key Issue
                              </span>
                            )}
                            <p>{b.description}</p>
                            {b.impact && (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Impact: {b.impact}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {item.achievements.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No achievements logged.</p>
                      ) : (
                        item.achievements.map((a, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-xs ${
                              a.isKeyAchievement
                                ? 'bg-amber-50 border border-amber-200 text-amber-950 font-medium'
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {a.isKeyAchievement && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 mb-0.5">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                Key Achievement
                              </span>
                            )}
                            <p>{a.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SideBySideModal;
