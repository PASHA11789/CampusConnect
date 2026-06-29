import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState('');
  const [isNameHidden, setIsNameHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setIsNameHidden(user.isNameHidden || false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.put('/api/users/profile', {
        name,
        isNameHidden
      }, config);

      if (data.success) {
        setSuccess(true);
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-modal-slide-in">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-[16px] font-black text-[#0a2342]">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-xs font-bold border border-emerald-100">
              Profile updated successfully!
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[13px] font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 transition-all"
              required
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <input
              type="checkbox"
              id="hideName"
              checked={isNameHidden}
              onChange={(e) => setIsNameHidden(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#00c2cb] focus:ring-[#00c2cb] border-slate-300 cursor-pointer"
            />
            <div className="flex flex-col gap-0.5">
              <label htmlFor="hideName" className="text-[13px] font-bold text-[#0a2342] cursor-pointer leading-none">
                Hide my real name
              </label>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                If enabled, your Registration Number ({user?.registeration_number || user?.registration_no}) will be displayed publicly across the platform instead of your real name.
              </p>
            </div>
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
              className="px-5 py-2.5 rounded-full text-[12px] font-bold text-white bg-[#0a2342] hover:bg-[#00c2cb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
