import React from 'react';
import { Plus, Trash2, CalendarDays } from 'lucide-react';

const priorities = ['Low', 'Medium', 'High', 'Urgent'];

export const TaskPlannedTable = ({ tasks = [], onChange, readOnly = false }) => {
  const handleTaskChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addTask = () => {
    if (readOnly) return;
    onChange([
      ...tasks,
      {
        taskName: '',
        priority: 'Medium',
        plannedTime: 0,
        details: ''
      }
    ]);
  };

  const removeTask = (index) => {
    if (readOnly) return;
    const updated = tasks.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-sky-600" />
            Tasks Planned for Next Week
          </h3>
          <p className="text-xs text-slate-500">
            Outline upcoming priorities and anticipated effort allocation.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addTask}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Planned Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
          No planned tasks added yet. {!readOnly && 'Click "Add Planned Task" to outline next week.'}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 min-w-[220px]">Planned Task Name</th>
                <th className="py-3 px-2 w-28">Priority</th>
                <th className="py-3 px-2 w-24">Planned Time (h)</th>
                <th className="py-3 px-3 min-w-[240px]">Details & Expected Outcome</th>
                {!readOnly && <th className="py-3 px-2 w-12 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  {/* Name */}
                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="font-medium text-slate-800">{task.taskName || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Migration to Redis cluster"
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {task.priority}
                      </span>
                    ) : (
                      <select
                        value={task.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Planned Time */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="text-slate-700">{task.plannedTime}h</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.plannedTime}
                        onChange={(e) => handleTaskChange(idx, 'plannedTime', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center"
                      />
                    )}
                  </td>

                  {/* Details */}
                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="text-slate-600">{task.details || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="Dependencies, expected milestones..."
                        value={task.details}
                        onChange={(e) => handleTaskChange(idx, 'details', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    )}
                  </td>

                  {/* Action */}
                  {!readOnly && (
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeTask(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskPlannedTable;
