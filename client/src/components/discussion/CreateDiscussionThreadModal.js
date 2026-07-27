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
  isAlumni = false,
  postImage = "",
  setPostImage = () => {}
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
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto bg-[#071A35]/60 backdrop-blur-md animate-modal-fade-in" onClick={onCancel}>
        <div 
          className="bg-white rounded-[2rem] w-full max-w-[580px] shadow-[0_25px_60px_rgba(7,26,53,0.3)] overflow-hidden animate-modal-slide-in flex flex-col border border-[#E8E1D5] font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#071A35] px-7 py-5 flex justify-between items-center border-b border-white/10">
            <div className="text-left flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#F5B82E] flex items-center justify-center text-[18px] border border-white/10 shrink-0">
                💼
              </div>
              <div className="flex flex-col">
                <h2 className="text-[18px] font-black text-white tracking-tight m-0">{t("Create Career Path")}</h2>
                <p className="text-[11.5px] text-white/70 font-semibold mt-0.5 m-0">{t("Share an opportunity, ask for advice, or start a discussion")}</p>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-7 overflow-y-auto max-h-[75vh]">
            <form id="create-career-form" onSubmit={onSubmit} className="flex flex-col gap-5 text-left">
              
              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Discussion Title")}</label>
                <input 
                  type="text" 
                  placeholder={t("E.g., Seeking advice for software engineering interviews")}
                  className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-bold text-[#071A35] placeholder-[#071A35]/40 focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Category")}</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all appearance-none cursor-pointer"
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#071A35]/50 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Details / Story")}</label>
                <textarea 
                  placeholder={t("Provide context, application details, requirements, or what you hope to discuss...")}
                  className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#071A35] placeholder-[#071A35]/40 focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all min-h-[130px] resize-none leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Optional Image URL")}</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/image.png"
                  className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#071A35] placeholder-[#071A35]/40 focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                />
              </div>

            </form>
          </div>

          <div className="px-7 py-4 border-t border-[#E8E1D5] bg-[#FAF7F0] flex justify-end gap-3 items-center">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full text-[12.5px] font-extrabold text-[#071A35] bg-white border border-[#E8E1D5] hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              form="create-career-form"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-full text-[12.5px] font-black text-[#071A35] bg-[#F5B82E] hover:bg-[#FFD05B] transition-all cursor-pointer shadow-md border-none flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-[#071A35]/30 border-t-[#071A35] rounded-full animate-spin"></span>
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
    <div className="fixed inset-0 bg-[#071A35]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto z-[2000] animate-modal-fade-in" onClick={onCancel}>
      <div 
        className="w-full max-w-[580px] bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_25px_60px_rgba(7,26,53,0.3)] flex flex-col overflow-hidden border border-[#E8E1D5] animate-modal-slide-in relative font-sans max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header area */}
        <div className="bg-[#071A35] px-4 sm:px-7 py-4 sm:py-5 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 text-[#F5B82E] flex items-center justify-center text-[16px] sm:text-[18px] border border-white/10 shrink-0">
              {isEditing ? "✏️" : "💬"}
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-[18px] font-black text-white tracking-tight m-0 leading-tight">
                {isEditing ? t('Edit Discussion') : t('Start New Discussion')}
              </h3>
              <p className="text-[11.5px] text-white/70 font-semibold m-0 mt-0.5">
                {isEditing ? t('Update your discussion details') : t('Share your thoughts or questions with the campus')}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-none w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200" 
            onClick={onCancel}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 text-left">
          <div className="p-4 sm:p-7 overflow-y-auto max-h-[65vh] flex flex-col gap-4 sm:gap-5">
            {/* Title input group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="thread-title" className="text-[11.5px] font-black text-[#071A35] tracking-wider uppercase ml-1">
                {t('Discussion Title')}
              </label>
              <input
                id="thread-title"
                type="text"
                placeholder={t("e.g. Study Group for Midterms or Canteen reviews")}
                className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl text-[#071A35] font-bold text-[13px] shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#071A35] focus:ring-4 focus:ring-[#071A35]/10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="text-[10px] text-[#211A24]/60 font-semibold ml-1">{t("Keep it short and clear.")}</span>
            </div>

            {/* Description textarea group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="thread-content" className="text-[11.5px] font-black text-[#071A35] tracking-wider uppercase ml-1">
                {t('Description / Details')}
              </label>
              <textarea
                id="thread-content"
                placeholder={t("Explain your question or details of the discussion...")}
                className="w-full px-4 py-3 bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl text-[#071A35] font-semibold text-[13px] shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#071A35] focus:ring-4 focus:ring-[#071A35]/10 min-h-[140px] resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <span className="text-[10px] text-[#211A24]/60 font-semibold ml-1">{t("Include any instructions, questions, or context needed.")}</span>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end items-center gap-3 px-7 py-4 border-t border-[#E8E1D5] bg-[#FAF7F0]">
            <button 
              type="button" 
              className="bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 px-6 rounded-full text-[12.5px] font-extrabold cursor-pointer transition-all duration-200 shadow-sm hover:bg-slate-100 active:scale-98" 
              onClick={onCancel}
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit" 
              className="bg-[#071A35] hover:bg-[#0A2246] text-white border-none py-2.5 px-7 rounded-full text-[12.5px] font-black cursor-pointer shadow-md transition-all duration-200 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
