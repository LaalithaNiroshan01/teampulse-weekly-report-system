import React, { useState, useMemo } from 'react';
import { Search, Sparkles, X, Check, ArrowRight, CheckCheck } from 'lucide-react';
import Modal from '../common/Modal';
import { SAMPLE_TASKS_LIBRARY } from '../../utils/sampleTasks';

const categories = [
  'All',
  'Backend & APIs',
  'Frontend & UI',
  'DevOps & Cloud',
  'QA & Testing',
  'Architecture & Docs',
  'Mobile & Apps',
  'Data & Analytics'
];

export const SampleTaskModal = ({
  isOpen,
  onClose,
  onSelectTask,
  targetType = 'completed' // 'completed' or 'planned'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState([]);
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  // Reset added trackers when modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setAddedIds([]);
      setRecentlyAddedId(null);
    }
  }, [isOpen]);

  const filteredTasks = useMemo(() => {
    return SAMPLE_TASKS_LIBRARY.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.taskName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.outputDeliverable && item.outputDeliverable.toLowerCase().includes(q)) ||
        (item.plannedDetails && item.plannedDetails.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)));

      return matchesCat && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleSelect = (sample) => {
    setRecentlyAddedId(sample.id);
    setAddedIds((prev) => [...prev, sample.id]);

    if (targetType === 'planned') {
      onSelectTask({
        taskName: sample.taskName,
        priority: sample.priority || 'Medium',
        plannedTime: sample.plannedTime || 4,
        details: sample.plannedDetails || sample.outputDeliverable || ''
      });
    } else {
      onSelectTask({
        taskName: sample.taskName,
        priority: sample.priority || 'Medium',
        plannedPercentage: sample.plannedPercentage ?? 100,
        actualPercentage: sample.actualPercentage ?? 100,
        status: sample.status || 'Done',
        plannedTime: sample.plannedTime || 4,
        timeSpent: sample.timeSpent || 4,
        outputDeliverable: sample.outputDeliverable || ''
      });
    }

    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 600);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Sample Task Library
            </h3>
            <p className="text-[11px] font-normal text-slate-500">
              Search or pick standardized {targetType === 'planned' ? 'planned' : 'completed'} tasks with deliverables & effort
            </p>
          </div>
        </div>
      }
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by keyword (e.g. API, Auth, Docker, React, Testing, Caching)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition shadow-xs"
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tasks List Header / Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Showing {filteredTasks.length} template tasks</span>
          {addedIds.length > 0 && (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              {addedIds.length} task{addedIds.length > 1 ? 's' : ''} added
            </span>
          )}
        </div>

        {/* Tasks List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No matching sample tasks found for "{searchTerm}".
            </div>
          ) : (
            filteredTasks.map((sample) => {
              const timesAdded = addedIds.filter((id) => id === sample.id).length;
              const isJustAdded = recentlyAddedId === sample.id;

              return (
                <div
                  key={sample.id}
                  onClick={() => handleSelect(sample)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                    timesAdded > 0
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">
                        {sample.taskName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {sample.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getPriorityBadgeClass(
                          sample.priority
                        )}`}
                      >
                        {sample.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {targetType === 'planned'
                        ? sample.plannedDetails
                        : `Deliverable: ${sample.outputDeliverable}`}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Default effort: <strong className="text-slate-600">{sample.plannedTime}h</strong></span>
                      {targetType === 'completed' && (
                        <>
                          <span>•</span>
                          <span>Default status: <strong className="text-slate-600">{sample.status}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(sample);
                      }}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        timesAdded > 0
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {timesAdded > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {timesAdded > 1 ? `Added (${timesAdded})` : 'Added'}
                        </>
                      ) : (
                        <>
                          <span>Add</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Tip: You can add multiple tasks and customize their details in the report table.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {addedIds.length > 0 ? `Done (${addedIds.length} Added)` : 'Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SampleTaskModal;
