import React, { useState, useEffect } from "react";

export default function AskQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  t = (s) => s,
}) {
  const [subject, setSubject] = useState("");
  const [queryCategory, setQueryCategory] = useState("mentorship_qa");
  const [details, setDetails] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;
    onSubmit({
      title: subject,
      content: details,
      category: queryCategory,
    });
    setSubject("");
    setDetails("");
    setQueryCategory("mentorship_qa");
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-start justify-center pt-[6vh] pb-6 overflow-y-auto bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[88vh] border border-slate-100 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration banner */}
        <div className="h-1.5 bg-gradient-to-r from-[#00c2cb] to-[#0079c2] w-full shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-xl">
              🙋🏻‍♂️
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-black text-slate-900 tracking-tight">{t("Ask Admin & Mentors")}</h2>
              <p className="text-xs text-slate-500 font-medium">{t("Submit your question. Administrators & moderators will review and respond.")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form id="ask-question-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Question Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Subject / Question Title")}</label>
            <input
              type="text"
              placeholder={t("e.g., How to prepare for software engineering campus drives?")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-2 focus:ring-[#00c2cb]/20 transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Topic Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Query Category")}</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-2 focus:ring-[#00c2cb]/20 transition-all cursor-pointer"
              value={queryCategory}
              onChange={(e) => setQueryCategory(e.target.value)}
            >
              <option value="mentorship_qa">{t("🤝 Mentorship Q&A")}</option>
              <option value="general_discussion">{t("💬 Career Guidance")}</option>
              <option value="job_opportunity">{t("💼 Admin Support / Inquiry")}</option>
            </select>
          </div>

          {/* Question Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Question Details")}</label>
            <textarea
              placeholder={t("Describe your query or guidance needed in detail for mentors and admins...")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-2 focus:ring-[#00c2cb]/20 transition-all min-h-[120px] resize-y leading-relaxed"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-[11px] text-teal-800 flex items-center gap-2">
            <span>🛡️</span>
            <span>{t("Your query will be routed directly to campus mentors and moderators.")}</span>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            disabled={isSubmitting}
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            form="ask-question-form"
            className="px-6 py-2 rounded-full border-none bg-[#00c2cb] hover:bg-[#00a3ab] text-white text-xs font-black cursor-pointer shadow-sm transition-all flex items-center justify-center min-w-[130px]"
            disabled={isSubmitting || !subject.trim() || !details.trim()}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              t("Send to Admins →")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
