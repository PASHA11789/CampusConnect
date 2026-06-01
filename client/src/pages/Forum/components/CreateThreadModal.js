import React, { useEffect } from "react";

export default function CreateThreadModal({
  isOpen,
  isEditing,
  title,
  setTitle,
  content,
  setContent,
  onSubmit,
  onCancel,
  isSubmitting,
  t
}) {
  // Lock body scroll when modal is open to prevent background scrolling
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
              <span className="text-[10px] text-slate-400 font-medium">Keep it short and clear.</span>
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
              <span className="text-[10px] text-slate-400 font-medium">Include any instructions, questions, or context needed.</span>
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

