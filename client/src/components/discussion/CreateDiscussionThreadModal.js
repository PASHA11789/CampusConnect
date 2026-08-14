import React, { useEffect } from "react";

const processImageFile = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.src = evt.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxWidth = 1200;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => callback(evt.target.result);
  };
  reader.readAsDataURL(file);
};

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
  setPostImage = () => {},
  tags = [],
  setTags = () => {}
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
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#071A35]/60 backdrop-blur-md animate-modal-fade-in" onClick={onCancel}>
        <div 
          className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-[580px] shadow-[0_25px_60px_rgba(7,26,53,0.3)] overflow-hidden animate-modal-slide-in flex flex-col border border-[#E8E1D5] font-sans max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#071A35] px-5 sm:px-7 py-4 sm:py-5 flex justify-between items-center border-b border-white/10 shrink-0">
            <div className="text-left flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 text-[#00c2cb] flex items-center justify-center text-[16px] sm:text-[18px] border border-white/10 shrink-0">
                💼
              </div>
              <div className="flex flex-col">
                <h2 className="text-[16px] sm:text-[18px] font-black text-white tracking-tight m-0">{t("Create Career Path")}</h2>
                <p className="text-[10.5px] sm:text-[11.5px] text-white/70 font-semibold mt-0.5 m-0">{t("Share an opportunity, ask for advice, or start a discussion")}</p>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border-none cursor-pointer shrink-0 ml-2"
            >
              ✕
            </button>
          </div>

          <div className="p-5 sm:p-7 overflow-y-auto flex-1">
            <form id="create-career-form" onSubmit={onSubmit} className="flex flex-col gap-4 sm:gap-5 text-left">
              
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
              className="px-7 py-2.5 rounded-full text-[12.5px] font-black text-[#071A35] bg-[#00c2cb] hover:bg-[#00a8b5] transition-all cursor-pointer shadow-md border-none flex items-center gap-2 disabled:opacity-50"
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 text-[#00c2cb] flex items-center justify-center text-[16px] sm:text-[18px] border border-white/10 shrink-0">
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
            <i className="fa-solid fa-xmark text-sm flex items-center justify-center" />
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

            {/* Categorized Hashtags Selector */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[11.5px] font-black text-[#071A35] tracking-wider uppercase ml-1 flex items-center justify-between">
                <span>{t('Discussion Tags & Categories')}</span>
                <span className="text-[10px] text-slate-400 font-bold lowercase">({t("select preset or type custom")})</span>
              </label>

              {/* Tag Preset Category Pills */}
              <div className="flex flex-col gap-2 p-3 bg-[#FAF7F0] border border-[#E8E1D5] rounded-2xl">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">🏛️ Depts:</span>
                  {["BSCS", "BSSE", "BSIT", "BSDS", "BSCYBER"].map(tag => {
                    const isSelected = (tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTags((tags || []).filter(t => t !== tag));
                          } else {
                            setTags([...(tags || []), tag]);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#071A35] text-white border-[#071A35]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#071A35]"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">📚 Academic:</span>
                  {["FYP", "Midterms", "Finals", "StudyGroup", "Assignments"].map(tag => {
                    const isSelected = (tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTags((tags || []).filter(t => t !== tag));
                          } else {
                            setTags([...(tags || []), tag]);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#071A35] text-white border-[#071A35]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#071A35]"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">👥 Societies:</span>
                  {["DataScienceSociety", "CyberSecurityClub", "SoftwareEngSociety", "SportsClub"].map(tag => {
                    const isSelected = (tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTags((tags || []).filter(t => t !== tag));
                          } else {
                            setTags([...(tags || []), tag]);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#071A35] text-white border-[#071A35]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#071A35]"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">⚡ Issues & General:</span>
                  {["CampusWifi", "LibraryHours", "CanteenFeedback", "Advice", "Freshers"].map(tag => {
                    const isSelected = (tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTags((tags || []).filter(t => t !== tag));
                          } else {
                            setTags([...(tags || []), tag]);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#071A35] text-white border-[#071A35]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#071A35]"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tag Chips & Custom Tag Input */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl min-h-[42px]">
                {(tags || []).map((t, idx) => (
                  <span key={idx} className="bg-[#071A35] text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags((tags || []).filter((_, i) => i !== idx))}
                      className="hover:text-red-300 border-none bg-transparent cursor-pointer text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={t("Type custom tag & press Enter...")}
                  className="bg-transparent border-none text-[12px] font-semibold text-[#071A35] outline-none flex-1 min-w-[140px] px-1 py-0.5"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = e.target.value.trim().replace(/^#/, '');
                      if (val && !(tags || []).includes(val)) {
                        setTags([...(tags || []), val]);
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Optional Image Attachment (Drag & Drop + Select from Device + URL) */}
            <div className="flex flex-col gap-2">
              <label className="text-[11.5px] font-black text-[#071A35] tracking-wider uppercase ml-1">
                {t('Optional Image Attachment')}
              </label>

              {postImage ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#00c2cb] bg-slate-900/10 max-h-[220px] flex items-center justify-center group shadow-md">
                  <img
                    src={postImage}
                    alt="Preview"
                    className="w-full h-full object-cover max-h-[220px]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setPostImage("")}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 text-[11px] font-bold shadow-lg border-none cursor-pointer flex items-center gap-1 transition-transform hover:scale-105"
                  >
                    <span>✕</span> {t("Remove Photo")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer?.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        processImageFile(file, setPostImage);
                      }
                    }}
                    className="border-2 border-dashed border-[#E8E1D5] hover:border-[#00c2cb] bg-[#FAF7F0] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                    onClick={() => {
                      const input = document.getElementById("modal-file-input");
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="modal-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, setPostImage);
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                      🖼️
                    </div>
                    <p className="text-[12.5px] font-bold text-[#071A35] m-0 mb-1">
                      {t("Drag & Drop image here, or")} <span className="text-[#00c2cb] underline">{t("Browse Device")}</span>
                    </p>
                    <span className="text-[10px] text-[#211A24]/50 font-semibold">{t("Supports JPG, PNG, WEBP, GIF")}</span>
                  </div>

                  {/* Fallback URL Input */}
                  <input
                    type="url"
                    placeholder={t("Or paste image URL (https://...)...")}
                    className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl text-[#071A35] font-semibold text-[11.5px] shadow-sm transition-all focus:outline-none focus:bg-white focus:border-[#00c2cb]"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                  />
                </div>
              )}
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
