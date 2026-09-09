import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  User,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Eye,
  FileEdit,
  Mail,
  Building,
  Lock
} from 'lucide-react';

export const MemberProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/users/${userId}/profile`);
        setProfileData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load member profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner text="Loading team member profile..." />;
  }

  if (error || !profileData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Cannot View Profile</h2>
        <p className="text-xs text-slate-500">{error || 'User not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { user: member, stats, reports } = profileData;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-slate-800" />
            {member.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineering profile, compliance performance, and report archive
          </p>
        </div>
      </div>

      {/* Member Info Card & Statistics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Contact info */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{member.name}</h2>
              <span className="text-xs text-slate-500">{member.title}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.department || 'Engineering'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{member.role === 'manager' ? 'Manager / Admin' : 'Team Member'}</span>
            </div>
          </div>
        </div>

        {/* Basic Stats Grid */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span className="text-2xl font-bold text-slate-900">{stats.totalReports}</span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              Total Reports
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span className="text-2xl font-bold text-slate-900">{stats.approvalRate}%</span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              Approval Rate
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span className="text-2xl font-bold text-slate-900">{stats.totalTasksCompleted}</span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              Tasks Completed
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
            <span className="text-2xl font-bold text-slate-900">{stats.totalHoursLogged}h</span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              Hours Logged
            </span>
          </div>
        </div>
      </div>

      {/* Member's Report History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Reports ({reports.length})
            </h3>
            <p className="text-xs text-slate-500">
              Reports and review statuses.
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No weekly reports filed by this member yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Period / Week</th>
                  <th className="py-3 px-3">Project / Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Reviewer Decision</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rpt) => {
                  const isDraft = rpt.status === 'draft';
                  const isSubmitted = rpt.status === 'submitted';

                  return (
                    <tr key={rpt._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          Week {rpt.weekNumber}, {rpt.year}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(rpt.weekStartDate).toLocaleDateString(undefined, { timeZone:'UTC'})} -{' '}
                          {new Date(rpt.weekEndDate).toLocaleDateString(undefined, { timeZone:'UTC'})}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {rpt.projectId ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                            style={{
                              backgroundColor: `${rpt.projectId.color || '#3B82F6'}15`,
                              borderColor: `${rpt.projectId.color || '#3B82F6'}40`,
                              color: rpt.projectId.color || '#1E40AF'
                            }}
                          >
                            {rpt.projectId.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={rpt.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        {isDraft ? (
                          <span className="text-slate-400 italic flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Private draft in progress
                          </span>
                        ) : rpt.latestReviewComment ? (
                          <span className="text-slate-700 truncate block">
                            "{rpt.latestReviewComment}"
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isDraft ? (
                          <span className="text-slate-400 italic text-[11px]">Protected</span>
                        ) : isSubmitted && isManager ? (
                          <Link
                            to={`/review/${rpt._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
                          >
                            Review
                          </Link>
                        ) : (
                          <Link
                            to={`/reports/${rpt._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfilePage;
