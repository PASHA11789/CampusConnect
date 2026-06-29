import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportModal = ({ isOpen, onClose, userId, reportedName }) => {
  const [reason, setReason] = useState('Profile_Violation');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.post(`/api/users/${userId}/report`, {
        reason,
        details
      }, config);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setReason('Profile_Violation');
          setDetails('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" 
        onClick={!isSubmitting && !success ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-modal-slide-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-[16px] font-black text-[#0a2342]">Report User</h2>
          <button 
            onClick={!isSubmitting && !success ? onClose : undefined}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-xl text-[13px] font-bold border border-red-100 text-center">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="bg-emerald-50 text-emerald-600 p-6 rounded-xl text-[13px] font-bold border border-emerald-100 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-[24px]">
                ✅
              </div>
              User has been successfully reported to moderation.
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#0a2342] text-[#00c2cb] flex items-center justify-center font-black text-[12px] shrink-0">
                  {getInitials(reportedName)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-extrabold text-[#0a2342]">{reportedName || "Student"}</span>
                  <span className="text-[10px] text-red-500 font-bold">Reporting this user</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Violation Type</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[13px] font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10"
                >
                  <option value="Profile_Violation">Inappropriate/Vulgar Name or Avatar</option>
                  <option value="Forum_Violation">Forum Violation</option>
                  <option value="Petition_Violation">Petition Violation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Additional Details</label>
                <textarea 
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[13px] font-medium rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
