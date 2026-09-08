import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  UserPlus,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  UserX,
  UserCheck,
  ArrowRight
} from 'lucide-react';

export const UserManagementPage = () => {
  const { user: currentUser, isManager } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [createdInviteCreds, setCreatedInviteCreds] = useState(null);

  // Protect route
  useEffect(() => {
    if (!isManager) {
      navigate('/reports', { replace: true });
    }
  }, [isManager, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser, newRole) => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/users/${targetUser._id}/role`, { role: newRole });
      setSuccess(`Role for ${targetUser.name} updated to ${newRole === 'manager' ? 'Manager / Admin' : 'Team Member'}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const actionText = targetUser.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${targetUser.name}'s account?`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/users/${targetUser._id}/status`);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    setError('');
    setCreatedInviteCreds(null);

    try {
      const res = await api.post('/users/invite', {
        name,
        email,
        role,
        title: title || 'Software Engineer',
        department: department || 'Engineering'
      });

      setSuccess(`Team member created successfully!`);
      setCreatedInviteCreds({
        email,
        password: res.data.initialPassword
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  const resetInviteForm = () => {
    setName('');
    setEmail('');
    setRole('member');
    setTitle('');
    setDepartment('');
    setCreatedInviteCreds(null);
    setIsInviteOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800" />
            User Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage team members, roles, and access.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedInviteCreds(null);
            setIsInviteOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm self-start sm:self-auto active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* User Roster Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading roster..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Title & Department</th>
                  <th className="py-3 px-3">Assigned Role</th>
                  <th className="py-3 px-3">Reports Total</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {u.name} {isSelf && <span className="text-[10px] text-sky-600">(You)</span>}
                            </span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Title & Dept */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 block">{u.title || 'Engineer'}</span>
                        <span className="text-[11px] text-slate-400">{u.department || 'Engineering'}</span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            u.role === 'manager'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="member">Team Member</option>
                          <option value="manager">Manager / Admin</option>
                        </select>
                      </td>

                      {/* Report Count */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 font-semibold">
                          {u.totalReports || 0} report(s)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/team/${u._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            Profile
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          {!isSelf && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg transition text-xs ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.isActive ? 'Deactivate account' : 'Reactivate account'}
                            >
                              {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={resetInviteForm} title="Invite Team Member">
        {createdInviteCreds ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Invitation Credentials Ready
              </p>
              <p className="text-[11px] text-emerald-800">
                Share these temporary login credentials with the team member to allow immediate sign in:
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1 font-mono text-xs text-slate-800">
                <p>Email: <span className="font-bold">{createdInviteCreds.email}</span></p>
                <p>Temp Password: <span className="font-bold">{createdInviteCreds.password}</span></p>
              </div>
            </div>

            <button
              onClick={resetInviteForm}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                placeholder="e.g. Liam Vance"
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                placeholder="liam@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  placeholder="e.g. QA Automation"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  placeholder="e.g. Infrastructure"
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Role Assignment</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="member">Team Member</option>
                <option value="manager">Manager / Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetInviteForm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting || !name.trim() || !email.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
              >
                {isInviting ? 'Generating...' : 'Create User'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementPage;
