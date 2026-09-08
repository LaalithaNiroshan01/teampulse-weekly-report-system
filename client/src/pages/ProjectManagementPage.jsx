import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Archive,
  FolderOpen
} from 'lucide-react';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B'  // Slate
];

export const ProjectManagementPage = () => {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isActive, setIsActive] = useState(true);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects?includeInactive=true'),
        api.get('/users')
      ]);
      setProjects(projRes.data.data || []);
      setAllMembers(usersRes.data.data?.filter((u) => u.role === 'member') || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentId(null);
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setIsActive(true);
    setAssignedMembers([]);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setModalMode('edit');
    setCurrentId(proj._id);
    setName(proj.name);
    setDescription(proj.description || '');
    setColor(proj.color || '#3B82F6');
    setIsActive(proj.isActive ?? true);
    setAssignedMembers((proj.assignedMembers || []).map((m) => m._id || m));
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = { name, description, color, isActive, assignedMembers };
      if (modalMode === 'create') {
        await api.post('/projects', payload);
        setSuccess('Project category created successfully');
      } else {
        await api.put(`/projects/${currentId}`, payload);
        setSuccess('Project category updated successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrArchive = async (proj) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${proj.name}"?`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/projects/${proj._id}`);
      setSuccess(res.data.message || 'Project updated');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-slate-800" />
            Projects
          </h1>
          <p className="text-xs text-slate-500">
            Manage work categories and project tags.
          </p>
        </div>

        {isManager && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Projects Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects configured"
          description="Create your first project or category to enable categorization of team work."
          action={
            isManager && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Create Project
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Assigned Team</th>
                  <th className="py-3 px-3">Usage Count</th>
                  <th className="py-3 px-3">Status</th>
                  {isManager && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-50/60 transition">
                    {/* Name + Color swatch */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                          style={{ backgroundColor: proj.color || '#3B82F6' }}
                        />
                        <span className="font-bold text-slate-900">{proj.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-3 max-w-md text-slate-500">
                      {proj.description || <span className="italic text-slate-400">—</span>}
                    </td>

                    {/* Assigned Members */}
                    <td className="py-3.5 px-3">
                      {proj.assignedMembers && proj.assignedMembers.length > 0 ? (
                        <div
                          className="flex items-center -space-x-1.5 overflow-hidden"
                          title={proj.assignedMembers.map((m) => m.name).join(', ')}
                        >
                          {proj.assignedMembers.slice(0, 3).map((m, idx) => (
                            <div
                              key={idx}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-sky-100 text-sky-800 text-[10px] font-bold text-center leading-6"
                            >
                              {m.name ? m.name.charAt(0) : 'U'}
                            </div>
                          ))}
                          {proj.assignedMembers.length > 3 && (
                            <span className="text-[10px] text-slate-500 pl-2">
                              +{proj.assignedMembers.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">All Members</span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {proj.reportCount || 0} report(s)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          proj.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {proj.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>

                    {/* Actions */}
                    {isManager && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(proj)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrArchive(proj)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title={proj.reportCount > 0 ? 'Archive Project (Preserve reports)' : 'Delete Project'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Project Category' : 'Edit Project Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              placeholder="e.g. Client A - Portal"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={description}
              placeholder="Brief description of the project scope..."
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Color Tag</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === c ? 'border-slate-800 scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 ml-2"
              />
            </div>
          </div>

          {/* Member Assignment (Optional) */}
          {allMembers.length > 0 && (
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Assign Team Members (Optional)
              </label>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1 bg-slate-50/50">
                {allMembers.map((member) => {
                  const isChecked = assignedMembers.includes(member._id);
                  return (
                    <label
                      key={member._id}
                      className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white text-xs select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setAssignedMembers(assignedMembers.filter((mId) => mId !== member._id));
                          } else {
                            setAssignedMembers([...assignedMembers, member._id]);
                          }
                        }}
                        className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                      />
                      <span className="font-medium text-slate-800">{member.name}</span>
                      <span className="text-[11px] text-slate-400">({member.title || 'Engineer'})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {modalMode === 'edit' && (
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Active (available in weekly report dropdown)
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
            >
              {isSaving ? 'Saving...' : modalMode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectManagementPage;
