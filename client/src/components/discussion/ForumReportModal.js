import React, { useState, useEffect } from 'react';

const REPORT_REASONS = [
  { value: 'Spam',           label: '🚫 Spam or Advertising',   desc: 'Repetitive, promotional or off-topic content' },
  { value: 'Harassment',    label: '😡 Harassment or Bullying', desc: 'Personal attacks, threats or abusive language' },
  { value: 'Hate_Speech',   label: '⚠️ Hate Speech',           desc: 'Discriminatory language targeting any group' },
  { value: 'Misinformation',label: '❌ False Information',     desc: 'Deliberately misleading or fake content' },
  { value: 'Inappropriate', label: '🔞 Inappropriate Content',  desc: 'Sexually explicit or graphic material' },
  { value: 'Other',         label: '📝 Other',                  desc: 'Something else not listed above' },
];

const ForumReportModal = ({ isOpen, onClose, onConfirm, type = 'thread', isSubmitting = false }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setDetails('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) return;
    onConfirm(selectedReason, details.trim());
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        onClick={!isSubmitting ? onClose : undefined}
      />
      <div
        className="relative bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '88dvh', animation: 'forumReportModalIn 0.22s ease-out both' }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-400 shrink-0" />
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[20px]">🚩</span>
            <div>
              <h2 className="text-[14.5px] font-black text-[#0a2342] leading-none">
                Report {type === 'thread' ? 'Thread' : 'Comment'}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                Help us keep the community safe
              </p>
            </div>
          </div>
          <button
            onClick={!isSubmitting ? onClose : undefined}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={handleSubmit} id="forum-report-form" className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Why are you reporting this?{' '}
                <span className="text-red-500 normal-case font-extrabold">* Required</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={
                      selectedReason === r.value
                        ? 'flex items-start gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all select-none border-red-400 bg-red-50 shadow-sm'
                        : 'flex items-start gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all select-none border-slate-200 bg-slate-50 hover:border-slate-300'
                    }
                  >
                    <input
                      type="radio"
                      name="forum-report-reason"
                      value={r.value}
                      checked={selectedReason === r.value}
                      onChange={() => setSelectedReason(r.value)}
                      className="mt-0.5 shrink-0"
                      style={{ accentColor: '#ef4444' }}
                    />
                    <div className="flex flex-col leading-snug">
                      <span className="text-[11.5px] font-bold text-[#0a2342]">{r.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Additional Details <span className="text-slate-300 font-semibold normal-case">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any extra context for moderators..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[12px] font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 resize-none placeholder-slate-400 transition-all"
              />
            </div>
          </form>
        </div>
        <div className="flex justify-end gap-2.5 px-4 py-3 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="forum-report-form"
            disabled={!selectedReason || isSubmitting}
            className="px-5 py-2 rounded-full text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer border-none shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting...
              </>
            ) : '🚩 Submit Report'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes forumReportModalIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ForumReportModal;
