import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCompletedTable from '../components/reports/TaskCompletedTable';
import TaskPlannedTable from '../components/reports/TaskPlannedTable';
import BlockersSection from '../components/reports/BlockersSection';
import AchievementsSection from '../components/reports/AchievementsSection';
import HoursBreakdownInput from '../components/reports/HoursBreakdownInput';
import VersionHistoryViewer from '../components/reports/VersionHistoryViewer';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Save,
  Send,
  Calendar,
  FolderKanban,
  FileText,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  ArrowLeft,
  Info,
  Trash2
} from 'lucide-react';

// Helper to compute default dates for current week (Monday to Sunday)
const getDefaultWeekDates = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Approximate week number
  const d = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
    weekNumber: weekNo,
    year: monday.getFullYear()
  };
};

export const ReportEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const defaultDates = getDefaultWeekDates();

  const [weekStartDate, setWeekStartDate] = useState(defaultDates.startDate);
  const [weekEndDate, setWeekEndDate] = useState(defaultDates.endDate);
  const [weekNumber, setWeekNumber] = useState(defaultDates.weekNumber);
  const [year, setYear] = useState(defaultDates.year);
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState([]);
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [hoursBreakdown, setHoursBreakdown] = useState({
    development: 0,
    testing: 0,
    meetings: 0,
    documentation: 0,
    other: 0
  });
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState([{ title: '', url: '' }]);

  // Report state metadata
  const [reportStatus, setReportStatus] = useState('draft');
  const [latestReviewComment, setLatestReviewComment] = useState('');
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.data || []);
        if (!projectId && res.data.data?.length > 0) {
          setProjectId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch report if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchReport = async () => {
        try {
          const res = await api.get(`/reports/${id}`);
          const r = res.data.data;

          setWeekStartDate(new Date(r.weekStartDate).toISOString().split('T')[0]);
          setWeekEndDate(new Date(r.weekEndDate).toISOString().split('T')[0]);
          setWeekNumber(r.weekNumber);
          setYear(r.year);
          setProjectId(r.projectId?._id || r.projectId || '');
          setTasksCompleted(r.tasksCompleted || []);
          setTasksPlannedNextWeek(r.tasksPlannedNextWeek || []);
          setBlockers(r.blockers || []);
          setAchievements(r.achievements || []);
          setHoursBreakdown(r.hoursBreakdown || {});
          setNotes(r.notes || '');
          setLinks(r.links?.length ? r.links : [{ title: '', url: '' }]);
          setReportStatus(r.status);
          setLatestReviewComment(r.latestReviewComment || '');
          setVersions(r.versions || []);

          // Guard: if report is already submitted or approved, redirect to detail view
          if (r.status === 'submitted' || r.status === 'approved') {
            navigate(`/reports/${id}`, { replace: true });
          }
        } catch (err) {
          setErrorMsg(err.response?.data?.message || 'Failed to load report');
        } finally {
          setIsLoading(false);
        }
      };
      fetchReport();
    }
  }, [id, isEditMode, navigate]);

  const handleLinkChange = (index, field, val) => {
    const updated = [...links];
    updated[index][field] = val;
    setLinks(updated);
  };

  const addLinkRow = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLinkRow = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // 1. Save as Draft (Partial validation permitted)
  const handleSaveDraft = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setValidationErrors([]);
    setIsSaving(true);

    const payload = {
      weekStartDate,
      weekEndDate,
      weekNumber: parseInt(weekNumber, 10),
      year: parseInt(year, 10),
      projectId: projectId || null,
      tasksCompleted,
      tasksPlannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes,
      links: links.filter((l) => l.title || l.url)
    };

    try {
      if (isEditMode) {
        await api.put(`/reports/${id}`, payload);
        setSuccessMsg('Draft changes saved successfully.');
      } else {
        const res = await api.post('/reports', payload);
        setSuccessMsg('Report created and saved as Draft.');
        navigate(`/reports/${res.data.data._id}/edit`, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Submit for Review (Strict validation & version snapshot generation)
  const handleSubmitReport = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setValidationErrors([]);
    setIsSaving(true);

    const payload = {
      weekStartDate,
      weekEndDate,
      weekNumber: parseInt(weekNumber, 10),
      year: parseInt(year, 10),
      projectId: projectId || null,
      tasksCompleted,
      tasksPlannedNextWeek,
      blockers,
      achievements,
      hoursBreakdown,
      notes,
      links: links.filter((l) => l.title || l.url)
    };

    try {
      let targetId = id;
      if (!isEditMode) {
        // Create first
        const createRes = await api.post('/reports', payload);
        targetId = createRes.data.data._id;
        navigate(`/reports/${targetId}/edit`, { replace: true });
      } else {
        // Update draft fields
        await api.put(`/reports/${id}`, payload);
      }

      // Submit endpoint
      const submitRes = await api.post(`/reports/${targetId}/submit`);
      navigate(`/reports/${targetId}`, {
        state: { message: 'Report submitted successfully for manager review!' }
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setErrorMsg('Please address the required submission validation errors below.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Submission failed.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Delete Draft Report (Allowed strictly for draft reports)
  const handleDeleteDraft = async () => {
    if (!window.confirm('Are you sure you want to delete this draft report? This action cannot be undone.')) {
      return;
    }
    setIsSaving(true);
    setErrorMsg('');
    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports', {
        replace: true,
        state: { message: 'Draft report deleted successfully.' }
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete draft report.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading report editor..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-800" />
              {isEditMode ? `Edit Weekly Report (Wk ${weekNumber})` : 'New Weekly Report'}
            </h1>
            <p className="text-xs text-slate-500">
              Document your weekly progress, achievements, and blockers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={reportStatus} />
          {isEditMode && reportStatus === 'draft' && (
            <button
              type="button"
              onClick={handleDeleteDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition shadow-2xs"
              title="Delete Draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Draft</span>
            </button>
          )}
          {isEditMode && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmitReport}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            {reportStatus === 'needs_correction' ? 'Resubmit for Review' : 'Submit Report'}
          </button>
        </div>
      </div>

      {/* Needs Correction Feedback Alert Banner */}
      {reportStatus === 'needs_correction' && latestReviewComment && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex items-start gap-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Manager Feedback</p>
            <p className="leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200/80 font-medium text-slate-800">
              "{latestReviewComment}"
            </p>
            <p className="text-[11px] text-amber-700">
              Update the flagged items and resubmit. Previous versions are saved below.
            </p>
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
          <p className="font-bold mb-1">Required fields missing for submission:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content in Standardized Fixed Order */}
      <div className="space-y-6">
        {/* Section 1: Week Range & Project Tag */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Period & Project
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Week Start Date *</label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Week End Date *</label>
              <input
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Week Number</label>
              <input
                type="number"
                min="1"
                max="53"
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Project or Category Tag *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-slate-900"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Tasks Completed Table */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Tasks Completed
          </h2>
          <TaskCompletedTable tasks={tasksCompleted} onChange={setTasksCompleted} />
        </div>

        {/* Section 3: Tasks Planned for Next Week */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Planned for Next Week
          </h2>
          <TaskPlannedTable tasks={tasksPlannedNextWeek} onChange={setTasksPlannedNextWeek} />
        </div>

        {/* Section 4 & 5: Blockers & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Blockers & Challenges
            </h2>
            <BlockersSection blockers={blockers} onChange={setBlockers} />
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              5. Achievements & Highlights
            </h2>
            <AchievementsSection achievements={achievements} onChange={setAchievements} />
          </div>
        </div>

        {/* Section 6: Optional Hours Breakdown */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            6. Hours Breakdown (Optional)
          </h2>
          <HoursBreakdownInput value={hoursBreakdown} onChange={setHoursBreakdown} />
        </div>

        {/* Section 7: Optional Notes or Links */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            7. Notes & Links (Optional)
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              General Notes & Context
            </label>
            <textarea
              rows="3"
              placeholder="Any additional context, release schedules, or shout-outs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-700">Reference Links</label>
              <button
                type="button"
                onClick={addLinkRow}
                className="text-xs text-slate-900 hover:text-slate-700 font-semibold"
              >
                + Add Link
              </button>
            </div>
            <div className="space-y-2">
              {links.map((lnk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Title (e.g. PR #142)"
                    value={lnk.title}
                    onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                    className="w-1/3 px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={lnk.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkRow(idx)}
                      className="text-slate-400 hover:text-rose-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 8: Version History (if report has past submissions) */}
        {versions.length > 0 && (
          <VersionHistoryViewer versions={versions} />
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div>
            {isEditMode && reportStatus === 'draft' && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm active:scale-95"
            >
              {reportStatus === 'needs_correction' ? 'Resubmit for Review' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportEditorPage;
