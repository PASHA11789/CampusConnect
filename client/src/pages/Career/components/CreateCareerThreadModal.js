import React, { useState } from "react";
import axios from "axios";

export default function CreateCareerThreadModal({ isOpen, onClose, onCreated, showToast, user }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general_discussion");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAlumni = user?.role === 'alumni' || user?.role === 'admin' || user?.role === 'campus_admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Extra safety check on the frontend
    if (category === "job_opportunity" && !isAlumni) {
      showToast("Only alumni can post Job Opportunities.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.post("/api/careers", {
        title,
        content,
        category
      }, config);

      if (data.underReview) {
        showToast("Your post contains flagged keywords and has been sent for moderator review.", "warning");
        onClose(); // Close the modal since it's pending review
      } else {
        showToast("Career thread created successfully.", "success");
        if (data.thread) {
          onCreated(data.thread);
        } else {
          // Fallback if API doesn't return thread directly
          onCreated({
            _id: Date.now().toString(),
            title,
            content,
            category,
            author: user,
            createdAt: new Date().toISOString(),
            replies: []
          });
        }
      }

      // Reset form
      setTitle("");
      setContent("");
      setCategory("general_discussion");
      
    } catch (error) {
      console.error("Error creating thread:", error);
      showToast(error.response?.data?.message || "Failed to create thread.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0a2342]/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-[600px] shadow-2xl overflow-hidden animate-modal-slide-in flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-[18px] font-black text-[#0a2342] tracking-tight">Create Career Path</h2>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Share an opportunity, ask for advice, or start a discussion</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="create-career-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#0a2342] ml-1">Title</label>
              <input 
                type="text" 
                placeholder="E.g., Seeking advice for software engineering interviews"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#0a2342] ml-1">Category</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#0a2342] focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-all appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general_discussion">General Discussion</option>
                  <option value="mentorship_qa">Mentorship Q&A</option>
                  <option 
                    value="job_opportunity" 
                    disabled={!isAlumni}
                  >
                    Job Opportunity {!isAlumni && "(Alumni Only)"}
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              {!isAlumni && category !== "job_opportunity" && (
                <p className="text-[11px] text-slate-400 ml-1">
                  Note: The "Job Opportunity" category is restricted to alumni.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#0a2342] ml-1">Details</label>
              <textarea 
                placeholder="Provide more context, details, or your questions here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-600 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-all min-h-[160px] resize-y custom-scrollbar"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-bold hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-career-form"
            className="px-6 py-2.5 rounded-xl border-none bg-[#0a2342] text-white text-[13px] font-bold hover:bg-[#00c2cb] transition-all cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Post Thread"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
