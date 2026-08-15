import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AnimatedSelect from '../common/AnimatedSelect';

const CATEGORIES = [
  "Academics",
  "Canteen",
  "Facilities",
  "Administration",
  "IT Support",
  "Hostel",
  "Security",
  "Other",
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low Priority", badge: "Low" },
  { value: "Medium", label: "Medium Priority", badge: "Med" },
  { value: "High", label: "High Priority", badge: "High" },
  { value: "Urgent", label: "Urgent Issue", badge: "Urgent" }
];

const CreateComplaintModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [type, setType] = useState('complaint'); // 'suggestion' or 'complaint'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Facilities');
  const [priority, setPriority] = useState('Medium');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        priority,
        targetDepartment: targetDepartment.trim(),
        isAnonymous,
      };

      const { data } = await axios.post("/api/complaints", payload, config);

      if (data.success) {
        setSuccessMsg(data.message || `${type === "suggestion" ? "Suggestion" : "Complaint"} submitted successfully!`);
        if (onSuccess) onSuccess(data.complaint);
        setTimeout(() => {
          // Reset form and close modal
          setTitle('');
          setDescription('');
          setTargetDepartment('');
          setIsAnonymous(false);
          setSuccessMsg(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError(err.response?.data?.message || `Failed to submit ${type}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#071A35]/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8E1D5] animate-modal-slide-in text-left">
        
        {/* Modal Header */}
        <div className="bg-[#071A35] px-6 py-4 flex items-center justify-between text-white border-b border-[#071A35]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl flex items-center justify-center">
              {type === 'suggestion' ? <i className="fa-solid fa-lightbulb text-amber-400" /> : <i className="fa-solid fa-bullhorn text-[#00c2cb]" />}
            </span>
            <div>
              <h2 className="text-[16px] font-black text-white m-0 leading-tight">
                Submit Campus Feedback
              </h2>
              <p className="text-[11px] font-semibold text-[#00c2cb] m-0">
                Direct channel to Campus Administration &amp; Moderation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/40 max-h-[80vh] overflow-y-auto">
          
          {/* Feedback Type Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setType('suggestion')}
                className={`py-2 rounded-xl text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'suggestion' 
                    ? 'bg-[#00c2cb] text-[#071A35] shadow-sm' 
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-lightbulb text-xs" />
                <span>Suggestion</span>
              </button>
              <button
                type="button"
                onClick={() => setType('complaint')}
                className={`py-2 rounded-xl text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'complaint' 
                    ? 'bg-[#071A35] text-white shadow-sm' 
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-triangle-exclamation text-xs" />
                <span>Complaint</span>
              </button>
            </div>
          </div>

          {/* Feedback Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'suggestion' ? "e.g., Add solar charging stations near Library" : "e.g., AC not working in CS Lab 302"}
              className="w-full bg-white border border-[#E8E1D5] text-[#071A35] text-[13px] font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Category
              </label>
              <AnimatedSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORIES}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Priority
              </label>
              <AnimatedSelect
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={PRIORITY_OPTIONS}
              />
            </div>
          </div>

          {/* Target Department (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Target Department <span className="text-slate-400 font-semibold">(Optional)</span>
            </label>
            <input
              type="text"
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              placeholder="e.g., Computer Science, Estate Office, IT Support"
              className="w-full bg-white border border-[#E8E1D5] text-[#071A35] text-[13px] font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00c2cb]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details to help administration address your submission..."
              className="w-full bg-white border border-[#E8E1D5] text-[#071A35] text-[13px] font-medium rounded-xl p-3.5 focus:outline-none focus:border-[#00c2cb] resize-none"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#E8E1D5]">
            <input
              type="checkbox"
              id="anonymous-toggle"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-[#00c2cb] rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="anonymous-toggle" className="text-[12px] font-bold text-[#071A35] cursor-pointer flex-1">
              Submit Anonymously <span className="text-[10.5px] text-slate-400 font-medium block">Hide your name and registration number from public view</span>
            </label>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-[12px] font-extrabold text-center flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-triangle-exclamation" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-[12px] font-extrabold text-center flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-circle-check text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[12px] font-extrabold text-slate-600 hover:bg-slate-200/60 transition-colors border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider text-[#071A35] bg-[#00c2cb] hover:bg-[#00a8b5] transition-all shadow-md border-none cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : `Submit ${type === 'suggestion' ? 'Suggestion' : 'Complaint'}`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateComplaintModal;
