import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const ReviewActionModal = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
  const [action, setAction] = useState('approve'); // 'approve' or 'request_changes'
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === 'request_changes' && !comment.trim()) {
      setError('Please provide a general comment explaining what needs to change.');
      return;
    }
    setError('');
    onSubmit({ action, comment: comment.trim() });
  };

  const handleActionChange = (newAction) => {
    setAction(newAction);
    setError('');
    if (newAction === 'approve' && !comment) {
      setComment('Approved. Excellent work this week!');
    } else if (newAction === 'request_changes' && comment === 'Approved. Excellent work this week!') {
      setComment('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Weekly Report">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Review Action:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleActionChange('approve')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition ${
                action === 'approve'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Approve Report
            </button>

            <button
              type="button"
              onClick={() => handleActionChange('request_changes')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition ${
                action === 'request_changes'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Request Changes
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {action === 'request_changes' ? (
              <span className="text-amber-800 font-bold">
                Correction Feedback (Required) *
              </span>
            ) : (
              <span>Review Comment / Feedback (Optional)</span>
            )}
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            {action === 'request_changes'
              ? 'Provide clear guidance for the team member. The report will return to "Needs Correction" status.'
              : 'Add an encouraging note or commendation.'}
          </p>
          <textarea
            rows="4"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError('');
            }}
            placeholder={
              action === 'request_changes'
                ? 'e.g. Please elaborate on the output deliverable for task #2 and break down testing hours.'
                : 'Approved. Great progress on the deliverables.'
            }
            className={`w-full p-3 rounded-xl border text-xs focus:ring-2 focus:ring-sky-500 transition ${
              error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
            }`}
          />
          {error && <p className="text-[11px] text-rose-600 font-medium mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
              action === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting
              ? 'Submitting...'
              : action === 'approve'
              ? 'Confirm Approval'
              : 'Send for Correction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewActionModal;
