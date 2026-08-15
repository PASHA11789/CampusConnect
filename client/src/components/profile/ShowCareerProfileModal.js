import React, { useEffect } from "react";

export default function ShowCareerProfileModal({
  isOpen,
  onClose,
  user,
  avatar,
  bio,
  department,
  skills,
  onEditClick,
  t = (s) => s,
}) {
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

  if (!isOpen || !user) return null;

  const formatSkillLevel = (level) => {
    if (typeof level === "number") {
      if (level >= 90) return "Expert";
      if (level >= 75) return "Advanced";
      if (level >= 50) return "Intermediate";
      return "Beginner";
    }
    return level || "Intermediate";
  };

  const getSkillLevelBadgeStyle = (level) => {
    const formatted = formatSkillLevel(level).toLowerCase();
    switch (formatted) {
      case "expert":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "advanced":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "intermediate":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "beginner":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-slide-in flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-[#071A35] px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-[18px] border border-white/10 shrink-0">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[17px] font-black text-white tracking-tight m-0 truncate">
                {t("Career Profile")}
              </h2>
              <p className="text-[11.5px] text-white/70 font-medium mt-0.5 m-0 leading-tight">
                {t("Overview of your career path")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border-none cursor-pointer shrink-0 ml-2"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-6 bg-slate-50">
          {/* User Header */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <img
              src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
            />
            <div className="flex flex-col">
              <h4 className="text-lg font-black text-slate-900 leading-tight">{user.name}</h4>
              <span className="text-xs font-bold text-[#00c2cb] mt-0.5">
                {department || user.department || user.program || t("Student")}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                {user.registeration_number || "Student"}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">{t("About")}</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-h-[80px]">
              {bio ? (
                <p className="text-xs text-slate-600 leading-relaxed m-0 whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="text-xs text-slate-400 italic m-0">{t("No career bio provided.")}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">{t("Skills & Expertise")}</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {(!skills || skills.length === 0) ? (
                <p className="text-xs text-slate-400 italic m-0">{t("No skills added.")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getSkillLevelBadgeStyle(skill.level)}`}>
                        {formatSkillLevel(skill.level)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-4 flex justify-end gap-3 bg-white border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border-none cursor-pointer"
          >
            {t("Close")}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEditClick) onEditClick();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00c2cb] hover:bg-[#009da5] shadow-xs transition-all border-none cursor-pointer"
          >
            {t("Edit Profile")}
          </button>
        </div>
      </div>
    </div>
  );
}
