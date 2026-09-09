import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import SampleTaskModal from './SampleTaskModal';
import { SAMPLE_TASKS_LIBRARY } from '../../utils/sampleTasks';

const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['Done', 'In Progress', 'Blocked'];

export const TaskCompletedTable = ({ tasks = [], onChange, readOnly = false }) => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  const handleTaskChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...tasks];

    // If user typed/selected a known sample task name, auto-fill standard defaults if deliverable is blank
    if (field === 'taskName') {
      const match = SAMPLE_TASKS_LIBRARY.find(
        (st) => st.taskName.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (match && (!updated[index].outputDeliverable || updated[index].outputDeliverable.trim() === '')) {
        updated[index] = {
          ...updated[index],
          taskName: value,
          priority: match.priority || updated[index].priority,
          plannedPercentage: match.plannedPercentage ?? updated[index].plannedPercentage,
          actualPercentage: match.actualPercentage ?? updated[index].actualPercentage,
          status: match.status || updated[index].status,
          plannedTime: match.plannedTime || updated[index].plannedTime,
          timeSpent: match.timeSpent || updated[index].timeSpent,
          outputDeliverable: match.outputDeliverable || updated[index].outputDeliverable
        };
        onChange(updated);
        return;
      }
    }

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
        plannedPercentage: 0,
        actualPercentage: 0,
        status: 'In Progress',
        plannedTime: 0,
        timeSpent: 0,
        outputDeliverable: ''
      }
    ]);
  };

  const handleSelectSampleTask = (sampleTask) => {
    if (readOnly) return;
    const emptyIndex = tasks.findIndex((t) => !t.taskName || t.taskName.trim() === '');
    if (emptyIndex !== -1 && tasks.length === 1 && !tasks[0].taskName) {
      const updated = [...tasks];
      updated[emptyIndex] = { ...updated[emptyIndex], ...sampleTask };
      onChange(updated);
    } else {
      onChange([...tasks, sampleTask]);
    }
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
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            Tasks Completed & In-Progress
          </h3>
          <p className="text-xs text-slate-500">
            Detail progress, time spent vs planned, and tangible output deliverables.
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSampleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 shadow-xs transition cursor-pointer"
              title="Search and insert from sample tasks library"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Sample Tasks
            </button>
            <button
              type="button"
              onClick={addTask}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-3">
          <p>No tasks added yet. Pick from sample tasks or click "Add Task" to start.</p>
          {!readOnly && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Browse Sample Tasks
              </button>
              <button
                type="button"
                onClick={addTask}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Blank Task
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 min-w-[200px]">Task Name *</th>
                <th className="py-3 px-2 w-24">Priority</th>
                <th className="py-3 px-2 w-24">Planned %</th>
                <th className="py-3 px-2 w-24">Actual %</th>
                <th className="py-3 px-2 w-28">Status</th>
                <th className="py-3 px-2 w-20">Plan (h)</th>
                <th className="py-3 px-2 w-20">Spent (h)</th>
                <th className="py-3 px-3 min-w-[220px]">Output / Deliverable</th>
                {!readOnly && <th className="py-3 px-2 w-12 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  {/* Task Name */}
                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="font-medium text-slate-800">{task.taskName || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        list="completed-task-suggestions"
                        placeholder="e.g. Implement OAuth Endpoint"
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : task.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
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

                  {/* Planned % */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="text-slate-700">{task.plannedPercentage}%</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.plannedPercentage}
                        onChange={(e) => handleTaskChange(idx, 'plannedPercentage', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center"
                      />
                    )}
                  </td>

                  {/* Actual % */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="font-semibold text-slate-800">{task.actualPercentage}%</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.actualPercentage}
                        onChange={(e) => handleTaskChange(idx, 'actualPercentage', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-medium"
                      />
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          task.status === 'Done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'Blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    ) : (
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskChange(idx, 'status', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Planned Time */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="text-slate-600">{task.plannedTime}h</span>
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

                  {/* Time Spent */}
                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="font-semibold text-slate-800">{task.timeSpent}h</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.timeSpent}
                        onChange={(e) => handleTaskChange(idx, 'timeSpent', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-medium"
                      />
                    )}
                  </td>

                  {/* Output Deliverable */}
                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="text-slate-700">{task.outputDeliverable || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="PR link, document, staging deploy..."
                        value={task.outputDeliverable}
                        onChange={(e) => handleTaskChange(idx, 'outputDeliverable', e.target.value)}
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

      {!readOnly && (
        <>
          <datalist id="completed-task-suggestions">
            {SAMPLE_TASKS_LIBRARY.map((st) => (
              <option key={st.id} value={st.taskName} />
            ))}
          </datalist>

          <SampleTaskModal
            isOpen={isSampleModalOpen}
            onClose={() => setIsSampleModalOpen(false)}
            onSelectTask={handleSelectSampleTask}
            targetType="completed"
          />
        </>
      )}
    </div>
  );
};

export default TaskCompletedTable;
