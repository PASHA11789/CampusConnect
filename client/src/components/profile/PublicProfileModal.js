import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { getInitials } from '../../utils/helpers';

const PublicProfileModal = ({ isOpen, onClose, userId, currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportView, setReportView] = useState(false);
  
  // Reporting state
  const [reason, setReason] = useState('Profile_Violation');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      setReportView(false);
      setReportSuccess(false);
      setReason('Profile_Violation');
      setDetails('');

      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/users/${userId}/public`, config);
        
        if (data.success) {
          setProfile(data.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.post(`/api/users/${userId}/report`, {
        reason,
        details
      }, config);

      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report user');
    } finally {
      setIsSubmitting(false);
    }
  };



  const isDefaultAvatar = !profile?.avatar || profile.avatar.includes('ui-avatars.com');

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-modal-slide-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-[16px] font-black text-[#0a2342]">
            {reportView ? 'Report User' : 'User Profile'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin" />
              <p className="text-[12px] font-bold text-slate-400">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[13px] font-bold border border-red-100 text-center">
              {error}
            </div>
          ) : reportSuccess ? (
            <div className="bg-emerald-50 text-emerald-600 p-6 rounded-xl text-[13px] font-bold border border-emerald-100 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-[24px]">
                ✅
              </div>
              User has been successfully reported to moderation.
            </div>
          ) : reportView ? (
            /* Report View */
            <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#0a2342] text-[#00c2cb] flex items-center justify-center font-black text-[12px] shrink-0">
                  {getInitials(profile?.displayName)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-extrabold text-[#0a2342]">{profile?.displayName}</span>
                  <span className="text-[10px] text-red-500 font-bold">Reporting this user</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Reason</label>
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
                  onClick={() => setReportView(false)}
                  className="px-5 py-2.5 rounded-full text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Back
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
          ) : (
            /* Profile View */
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0079c2] p-[3px] shadow-lg">
                {isDefaultAvatar ? (
                  <div className="w-full h-full rounded-full bg-[#0a2342] flex items-center justify-center text-[32px] font-black text-[#00c2cb] border-4 border-white">
                    {getInitials(profile?.displayName)}
                  </div>
                ) : (
                  <img 
                    src={profile?.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover block bg-white border-4 border-white" 
                  />
                )}
                {/* Role Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0a2342] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md border-2 border-white whitespace-nowrap">
                  {profile?.role || 'Student'}
                </div>
              </div>

              <div className="flex flex-col items-center mt-2">
                <h3 className="text-[20px] font-black text-[#0a2342]">{profile?.displayName}</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1 max-w-[250px]">
                  CampusConnect Member
                </p>
              </div>

              {currentUser?._id !== userId && (
                <div className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => setReportView(true)}
                    className="w-full py-3 rounded-xl text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
                  >
                    🛡️ Report User
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PublicProfileModal;
