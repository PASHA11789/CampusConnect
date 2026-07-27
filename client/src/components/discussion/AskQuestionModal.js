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
      className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#071A35]/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-[540px] shadow-[0_25px_60px_rgba(7,26,53,0.3)] overflow-hidden animate-modal-slide-in flex flex-col max-h-[90vh] border border-[#E8E1D5] text-left font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#071A35] px-4 sm:px-7 py-4 sm:py-5 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 text-[#F5B82E] flex items-center justify-center text-[16px] sm:text-[18px] border border-white/10 shrink-0">
              🙋🏻‍♂️
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] sm:text-[18px] font-black text-white tracking-tight m-0">{t("Ask Admin & Mentors")}</h2>
              <p className="text-[11px] sm:text-[11.5px] text-white/70 font-semibold mt-0.5 m-0">{t("Submit your question for review and guidance.")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form id="ask-question-form" onSubmit={handleSubmit} className="p-4 sm:p-7 overflow-y-auto flex-1 flex flex-col gap-4 sm:gap-5">
          {/* Question Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Subject / Question Title")}</label>
            <input
              type="text"
              placeholder={t("e.g., How to prepare for software engineering campus drives?")}
              className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-bold text-[#071A35] placeholder-[#071A35]/40 focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Topic Category */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Query Category")}</label>
            <div className="relative">
              <select
                className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all appearance-none cursor-pointer"
                value={queryCategory}
                onChange={(e) => setQueryCategory(e.target.value)}
              >
                <option value="mentorship_qa">{t("🤝 Mentorship Q&A")}</option>
                <option value="general_discussion">{t("💬 Career Guidance")}</option>
                <option value="job_opportunity">{t("💼 Admin Support / Inquiry")}</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#071A35]/50 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider ml-1">{t("Question Details")}</label>
            <textarea
              placeholder={t("Describe your query or guidance needed in detail for mentors and admins...")}
              className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl px-4 py-3 text-[13px] font-semibold text-[#071A35] placeholder-[#071A35]/40 focus:outline-none focus:border-[#071A35] focus:bg-white focus:ring-4 focus:ring-[#071A35]/10 transition-all min-h-[130px] resize-none leading-relaxed"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl text-[11px] text-[#071A35]/80 font-semibold flex items-center gap-2">
            <span>🛡️</span>
            <span>{t("Your query will be routed directly to campus mentors and moderators.")}</span>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-4 sm:px-7 py-4 border-t border-[#E8E1D5] bg-[#FAF7F0] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-[#E8E1D5] bg-white text-[#071A35] text-[12.5px] font-extrabold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
            disabled={isSubmitting}
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            form="ask-question-form"
            className="px-7 py-2.5 rounded-full border-none bg-[#071A35] hover:bg-[#0A2246] text-white text-[12.5px] font-black cursor-pointer shadow-md transition-all flex items-center justify-center min-w-[130px] disabled:opacity-50"
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
