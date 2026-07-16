import React, { useEffect } from "react";

export default function CreateDiscussionThreadModal({
  isOpen,
  isEditing,
  title,
  setTitle,
  content,
  setContent,
  onSubmit,
  onCancel,
  isSubmitting,
  t = (s) => s,
  variant = "forum",
  
  // Career variant props
  category = "general_discussion",
  setCategory = () => {},
  isAlumni = false
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (variant === "career") {
    return (
      <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[6vh] pb-6 overflow-y-auto bg-[#0a2342]/40 backdrop-blur-[6px] animate-modal-fade-in" onClick={onCancel}>
        <div 
          className="bg-white rounded-3xl w-full max-w-[580px] shadow-2xl overflow-hidden animate-modal-slide-in flex flex-col max-h-[90vh] border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header decoration banner */}
          <div className="h-1.5 bg-gradient-to-r from-[#00c2cb] to-[#0a2342] w-full shrink-0" />

          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-[18px]">
                💼
              </div>
              <div className="flex flex-col">
                <h2 className="text-[17px] font-black text-[#0a2342] tracking-tight">{t("Create Career Path")}</h2>
                <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5">{t("Share an opportunity, ask for advice, or start a discussion")}</p>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all border-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="create-career-form" onSubmit={onSubmit} className="flex flex-col gap-5 text-left">
              
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-extrabold text-[#0a2342] uppercase tracking-wide ml-1">{t("Discussion Title")}</label>
                <input 
                  type="text" 
                  placeholder={t("E.g., Seeking advice for software engineering interviews")}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-4 focus:ring-[#00c2cb]/10 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-extrabold text-[#0a2342] uppercase tracking-wide ml-1">{t("Category")}</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] font-semibold text-[#0a2342] focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-4 focus:ring-[#00c2cb]/10 transition-all appearance-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="general_discussion">{t("💬 General Discussion")}</option>
                    <option value="mentorship_qa">{t("🤝 Mentorship Q&A")}</option>
                    <option 
                      value="job_opportunity" 
                      disabled={!isAlumni}
                    >
                      {t("💼 Job Opportunity")} {!isAlumni && t("(Alumni Only)")}
                    </option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-450 text-[10px]">
                    ▼
                  </div>
                </div>
                {!isAlumni && (
                  <p className="text-[10px] text-slate-400 ml-1 font-medium">
                    {t('Note: The "Job Opportunity" category is restricted to alumni/moderators.')}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-extrabold text-[#0a2342] uppercase tracking-wide ml-1">{t("Details / Content")}</label>
                <textarea 
                  placeholder={t("Provide details, links, role specs, or guidelines here...")}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] font-semibold text-slate-650 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-4 focus:ring-[#00c2cb]/10 transition-all min-h-[140px] resize-y custom-scrollbar leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

            </form>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-650 text-[13px] font-bold hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
              disabled={isSubmitting}
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              form="create-career-form"
              className="px-6 py-2.5 rounded-full border-none bg-gradient-to-r from-[#00c2cb] to-[#0079c2] text-white text-[13px] font-black cursor-pointer flex items-center justify-center min-w-[120px] shadow-[0_4px_14px_rgba(0,194,203,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,194,203,0.35)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                t("Post Thread")
              )}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Default: forum variant
  return (
    <div className="fixed inset-0 bg-[#0a2342]/40 backdrop-blur-[6px] flex items-start justify-center pt-[6vh] pb-6 overflow-y-auto z-[2000] animate-modal-fade-in" onClick={onCancel}>
      <div 
        className="w-[90%] max-w-[580px] bg-white rounded-[24px] shadow-[0_25px_60px_-15px_rgba(10,35,66,0.18)] flex flex-col overflow-hidden border border-slate-100/50 animate-modal-slide-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration banner */}
        <div className="h-1.5 bg-gradient-to-r from-[#00c2cb] via-[#0079c2] to-[#0a2342] w-full shrink-0" />

        {/* Header area */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-[18px]">
              {isEditing ? "✏️" : "💬"}
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-[17px] font-black text-[#0a2342] tracking-tight m-0 leading-tight">
                {isEditing ? t('Edit Discussion') : t('Start New Discussion')}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold m-0 mt-0.5">
                {isEditing ? t('Update your discussion details') : t('Share your thoughts or questions with the campus')}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 border-none w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200" 
            onClick={onCancel}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 text-left">
          <div className="p-7 overflow-y-auto flex-1 flex flex-col gap-5.5">
            {/* Title input group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="thread-title" className="text-[12px] font-extrabold text-[#0a2342] tracking-wide uppercase">
                {t('Discussion Title')}
              </label>
              <input
                id="thread-title"
                type="text"
                placeholder={t("e.g. Study Group for Midterms or Canteen reviews")}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-[#0a2342] font-semibold text-[13px] shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:ring-4 focus:ring-[#00c2cb]/10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="text-[10px] text-slate-400 font-medium">{t("Keep it short and clear.")}</span>
            </div>

            {/* Description textarea group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="thread-content" className="text-[12px] font-extrabold text-[#0a2342] tracking-wide uppercase">
                {t('Description / Details')}
              </label>
              <textarea
                id="thread-content"
                placeholder={t("Explain your question or details of the discussion...")}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-[#0a2342] font-semibold text-[13.5px] shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:ring-4 focus:ring-[#00c2cb]/10 min-h-[140px] resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <span className="text-[10px] text-slate-400 font-medium">{t("Include any instructions, questions, or context needed.")}</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end items-center gap-3 px-7 py-4 border-t border-slate-100 bg-slate-50/70">
            <button 
              type="button" 
              className="bg-white border border-slate-200 text-slate-500 py-2.5 px-5 rounded-full text-[12.5px] font-bold cursor-pointer transition-all duration-200 shadow-sm hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 active:scale-98" 
              onClick={onCancel}
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-[#00c2cb] to-[#0079c2] text-white border-none py-2.5 px-6 rounded-full text-[12.5px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(0,194,203,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,194,203,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("Publishing...")}</span>
                </div>
              ) : (isEditing ? t("Save Changes") : t("Post Discussion"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
