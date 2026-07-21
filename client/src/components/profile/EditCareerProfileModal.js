import React, { useState, useEffect } from "react";

export default function EditCareerProfileModal({
  isOpen,
  onClose,
  bio,
  department,
  skills,
  onSave,
  t = (s) => s,
}) {
  const [localBio, setLocalBio] = useState(bio || "");
  const [localDept, setLocalDept] = useState(department || "");
  const [localSkills, setLocalSkills] = useState(skills || []);

  useEffect(() => {
    if (isOpen) {
      setLocalBio(bio || "");
      setLocalDept(department || "");
      setLocalSkills(skills ? JSON.parse(JSON.stringify(skills)) : []);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, bio, department, skills]);

  if (!isOpen) return null;

  const handleSkillNameChange = (index, newName) => {
    const updated = [...localSkills];
    updated[index].name = newName;
    setLocalSkills(updated);
  };

  const handleSkillLevelChange = (index, newLevel) => {
    const updated = [...localSkills];
    updated[index].level = Number(newLevel);
    setLocalSkills(updated);
  };

  const handleAddSkill = () => {
    setLocalSkills([...localSkills, { name: "", level: 70 }]);
  };

  const handleRemoveSkill = (index) => {
    const updated = localSkills.filter((_, i) => i !== index);
    setLocalSkills(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      bio: localBio,
      department: localDept,
      skills: localSkills.filter((s) => s.name.trim() !== ""),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-start justify-center pt-[6vh] pb-6 overflow-y-auto bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[88vh] border border-slate-100 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="h-1.5 bg-gradient-to-r from-[#00c2cb] to-[#0079c2] w-full shrink-0" />

        {/* Modal Title Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-lg">
              ✏️
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-black text-slate-900 tracking-tight">{t("Edit Career Profile & Skills")}</h2>
              <p className="text-xs text-slate-500 font-medium">{t("Update your career bio, department, and custom skills list.")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Body */}
        <form id="edit-career-profile-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Department / Specialization */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Degree / Specialization")}</label>
            <input
              type="text"
              placeholder={t("e.g. BS Computer Science (BSCS)")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-2 focus:ring-[#00c2cb]/20 transition-all"
              value={localDept}
              onChange={(e) => setLocalDept(e.target.value)}
              required
            />
          </div>

          {/* Career Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Career Bio")}</label>
            <textarea
              placeholder={t("Write a short professional bio describing your focus and interests...")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-2 focus:ring-[#00c2cb]/20 transition-all min-h-[90px] resize-y leading-relaxed"
              value={localBio}
              onChange={(e) => setLocalBio(e.target.value)}
            />
          </div>

          {/* Skills & Proficiency Sliders */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">{t("Skills & Proficiency (%)")}</label>
              <button
                type="button"
                className="text-xs font-bold text-[#00c2cb] hover:text-[#009da5] hover:underline flex items-center gap-1 cursor-pointer bg-none border-none"
                onClick={handleAddSkill}
              >
                <span>+</span> {t("Add Skill")}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {localSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t("No skills added yet. Click '+ Add Skill' to add your skills.")}</p>
              ) : (
                localSkills.map((skill, index) => (
                  <div key={index} className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center gap-2">
                      <input
                        type="text"
                        placeholder={t("Skill Name (e.g. React.js, Python, DSA)")}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00c2cb]"
                        value={skill.name}
                        onChange={(e) => handleSkillNameChange(index, e.target.value)}
                        required
                      />
                      <span className="text-xs font-extrabold text-[#00c2cb] w-12 text-right shrink-0">{skill.level}%</span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-500 p-1 text-sm border-none bg-transparent cursor-pointer transition-colors shrink-0 ml-1"
                        onClick={() => handleRemoveSkill(index)}
                        title="Remove Skill"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={skill.level}
                        onChange={(e) => handleSkillLevelChange(index, e.target.value)}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00c2cb]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            form="edit-career-profile-form"
            className="px-6 py-2 rounded-full border-none bg-[#00c2cb] hover:bg-[#00a3ab] text-white text-xs font-black cursor-pointer shadow-sm transition-all"
          >
            {t("Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
