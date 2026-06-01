import React from "react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0a2342]/40 backdrop-blur-[8px] flex items-center justify-center z-[2000] animate-modal-fade-in" onClick={onCancel}>
      <div className="w-[90%] max-w-[620px] max-h-[85vh] bg-white rounded-[20px] border border-white/80 shadow-[0_20px_50px_rgba(10,35,66,0.15)] flex flex-col overflow-hidden animate-modal-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-[16px] font-black text-[#0a2342] tracking-tight">{isEditing ? t('Edit Discussion') : t('Start a New Discussion')}</h3>
          <button className="bg-none border-none text-[26px] leading-none text-slate-400 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-slate-100 hover:text-red-500" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-5 flex flex-col gap-2">
              <label htmlFor="thread-title" className="text-[12.5px] font-bold text-[#0a2342]">{t('Discussion Title')}</label>
              <input
                id="thread-title"
                type="text"
                placeholder={t("e.g. Study Group for Midterms or Canteen reviews")}
                className="w-full px-3.5 py-3 font-inherit text-[13.5px] bg-slate-50 border-[1.5px] border-slate-200 rounded-lg text-[#0a2342] font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:shadow-[0_0_0_3px_rgba(0,194,203,0.1)]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-5 flex flex-col gap-2">
              <label htmlFor="thread-content" className="text-[12.5px] font-bold text-[#0a2342]">{t('Description / Question Details')}</label>
              <textarea
                id="thread-content"
                placeholder={t("Explain your question or details of the discussion...")}
                className="w-full px-3.5 py-3 font-inherit text-[13.5px] bg-slate-50 border-[1.5px] border-slate-200 rounded-lg text-[#0a2342] font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:shadow-[0_0_0_3px_rgba(0,194,203,0.1)] min-h-[120px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button type="button" className="bg-slate-200 text-slate-600 border-none font-inherit text-[13px] font-bold px-5 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-300 hover:text-slate-800" onClick={onCancel}>
              {t('Cancel')}
            </button>
            <button type="submit" className="bg-gradient-to-br from-[#00c2cb] to-[#0a2342] text-white border-none font-inherit text-[13px] font-bold px-5.5 py-2.5 rounded-lg cursor-pointer shadow-[0_4px_12px_rgba(0,194,203,0.2)] transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(0,194,203,0.35)] disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting}>
              {isSubmitting ? t("Publishing...") : (isEditing ? t("Save Changes") : t("Post Discussion"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

