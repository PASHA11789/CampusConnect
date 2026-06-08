import React, { useState, useEffect } from 'react';
import logo from '../../assets/MUL-Logo.png';

const StudentCardAndCareerPath = ({ user, avatar }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when avatar prop changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Career Path Options based on department
  const getCareerPaths = (dept) => {
    const d = (dept || "").toLowerCase();
    if (d.includes("computer science") || d.includes("software engineering")) {
      return [
        {
          title: "Full Stack Developer",
          skills: ["React & Tailwind", "Node.js & Express", "MongoDB & SQL", "Git & GitHub", "API Integration"],
          nextStep: "Complete your canteen checkout cart features."
        },
        {
          title: "AI Engineer",
          skills: ["Python Programming", "Linear Algebra", "TensorFlow / PyTorch", "Data Preprocessing", "Model Deployment"],
          nextStep: "Learn the fundamentals of neural networks."
        }
      ];
    }
    if (d.includes("data science")) {
      return [
        {
          title: "Data Scientist",
          skills: ["Python & Pandas", "SQL Queries", "Statistical Analysis", "Data Visualization", "Machine Learning Models"],
          nextStep: "Build a regression analysis on local housing prices."
        },
        {
          title: "Data Analyst",
          skills: ["Excel Formulas", "SQL Basics", "Power BI / Tableau", "Data Wrangling", "Dashboard Design"],
          nextStep: "Create a visual report on canteen sales."
        }
      ];
    }
    if (d.includes("information technology") || d.includes("cyber security")) {
      return [
        {
          title: "Security Engineer",
          skills: ["Linux Admin", "Network Protocols", "Penetration Testing", "Security Auditing", "Firewall Configs"],
          nextStep: "Set up a virtual lab environment on your PC."
        },
        {
          title: "System Administrator",
          skills: ["Linux Server Admin", "Docker & Containers", "Active Directory", "Bash Scripting", "Cloud Infrastructures"],
          nextStep: "Automate a simple backup routine using Bash."
        }
      ];
    }
    // Default
    return [
      {
        title: "Product Specialist",
        skills: ["Project Management", "Agile Methodologies", "Communication", "UI/UX Basics", "Product Roadmapping"],
        nextStep: "Create a product spec sheet for your project."
      }
    ];
  };

  const paths = getCareerPaths(user?.department);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const activePath = paths[selectedPathIndex] || paths[0];

  const storageKey = `career-skills-${user?._id}-${activePath.title}`;
  const [checkedSkills, setCheckedSkills] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });

  // Sync state when active career path changes
  useEffect(() => {
    const saved = localStorage.getItem(`career-skills-${user?._id}-${activePath.title}`);
    setCheckedSkills(saved ? JSON.parse(saved) : {});
  }, [selectedPathIndex, activePath.title, user?._id]);

  const handleToggleSkill = (skill) => {
    const updated = { ...checkedSkills, [skill]: !checkedSkills[skill] };
    setCheckedSkills(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const totalSkills = activePath.skills.length;
  const completedSkills = activePath.skills.filter(s => checkedSkills[s]).length;
  const percentComplete = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  // Helper to extract clean initials from the user's name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;
  const initials = getInitials(user?.name);

  return (
    <div className="flex gap-6 w-full max-[1100px]:flex-col">
      <div className="flex-[1.4] max-w-[600px] max-[1100px]:max-w-full">
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col font-sans h-full">
          {/* Top Header Bar */}
          <div className="bg-neutral-50 px-4 py-2 flex justify-between items-center border-b border-gray-100">
            <span className="text-[#C62828] font-extrabold text-[14px] tracking-wider">STUDENT CARD</span>
            <span className="text-neutral-600 text-[11px] font-semibold">Valid Upto: Dec 2026</span>
          </div>

          {/* Main Content Section */}
          <div className="bg-gradient-to-br from-[#00838F] to-[#00acc1] px-7 py-6 flex-1 flex items-center gap-6 relative">
            <div className="flex flex-col gap-2 w-full z-[2]">
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Name:</span>
                <span className="text-white font-bold text-base">{user?.name || ''}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Reg. #:</span>
                <span className="text-white font-bold text-base">{user?.registeration_number || user?.registration_no || ''}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Class:</span>
                <span className="text-white font-bold text-base">{user?.class || 'BS'}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Dept:</span>
                <span className="text-white font-bold text-base">{user?.department || 'Computer Science'}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Session:</span>
                <span className="text-white font-bold text-base">{user?.session || '2022-26 Fall'}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-[100px] h-[120px] bg-white border-[3px] border-[#E0F2F1] rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {showFallback ? (
                  <div
                    className="font-black text-[#00838F]"
                    style={{ fontSize: initials.length > 1 ? '36px' : '48px' }}
                  >
                    {initials}
                  </div>
                ) : (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div className="text-[8px] font-extrabold text-[#E0F2F1] tracking-widest">ID PHOTO</div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-white px-5 py-3 grid grid-cols-[1fr_1.5fr_1fr] items-center border-t border-gray-100 max-[600px]:grid-cols-2">
            <div className="flex flex-col items-center">
              <div className="signature-img">
                <svg width="80" height="30" viewBox="0 0 100 40">
                  <path d="M10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#001529" strokeWidth="1.5" />
                  <path d="M20 25 L 80 25" fill="none" stroke="#001529" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>
              </div>
              <span className="text-[8px] font-extrabold text-[#001529] uppercase border-t border-gray-200 -mt-1">Registrar Signature</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center border-l border-r border-gray-100">
              <div className="footer-logo-wrap">
                <img src={logo} alt="MUL Logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col leading-[1.1]">
                <span className="text-[12px] font-black text-[#001529]">Minhaj</span>
                <span className="text-[12px] font-black text-[#001529]">University</span>
                <span className="text-[12px] font-black text-[#001529]">Lahore</span>
              </div>
            </div>
            <div className="flex justify-end max-[600px]:hidden">
              <div className="qr-code">
                <svg viewBox="0 0 100 100" width="45" height="45">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="20" height="20" fill="black" />
                  <rect x="15" y="15" width="10" height="10" fill="white" />
                  <rect x="70" y="10" width="20" height="20" fill="black" />
                  <rect x="75" y="15" width="10" height="10" fill="white" />
                  <rect x="10" y="70" width="20" height="20" fill="black" />
                  <rect x="15" y="75" width="10" height="10" fill="white" />
                  <rect x="40" y="40" width="20" height="20" fill="black" />
                  <rect x="70" y="70" width="10" height="10" fill="black" />
                  <rect x="50" y="70" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Path Explorer Widget */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-left font-sans h-full justify-between">
        {/* Custom Styled Header & Custom Dropdown Select */}
        <div className="mb-3.5 pb-2 border-b border-slate-100 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px] animate-pulse">🎯</span>
            <span className="text-[13.5px] font-black text-[#0a2342] uppercase tracking-wider">Career Path Explorer</span>
          </div>
          
          {/* Custom Select Box Wrapper */}
          <div className="relative shrink-0">
            <select
              value={selectedPathIndex}
              onChange={(e) => setSelectedPathIndex(Number(e.target.value))}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-[11px] font-black text-[#0a2342] focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] cursor-pointer transition-all duration-150 shadow-sm"
            >
              {paths.map((p, index) => (
                <option key={p.title} value={index}>{p.title}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center">
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex flex-col gap-4 flex-1 justify-between">
          {/* Premium Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline text-[11px] font-black text-[#0a2342]/70 uppercase tracking-wider">
              <span>Readiness Progress</span>
              <span className="text-[#00c2cb] text-[13px] font-black">{percentComplete}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-[#00c2cb] to-[#0079c2] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,194,203,0.25)]"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Premium Core Skills Checklist Tiles */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-[#0a2342]/70 uppercase tracking-wider">Target Core Skills</span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {activePath.skills.map((skill) => {
                const isChecked = !!checkedSkills[skill];
                return (
                  <label
                    key={skill}
                    className={`flex items-center justify-between px-3.5 py-2.5 border rounded-xl cursor-pointer select-none transition-all duration-150 ${
                      isChecked
                        ? "bg-emerald-50/20 border-emerald-100 shadow-sm"
                        : "bg-slate-50 border-slate-150 hover:bg-slate-100/60 hover:border-slate-200 hover:-translate-y-[0.5px]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSkill(skill)}
                        className="w-4 h-4 rounded text-[#00c2cb] focus:ring-[#00c2cb] border-slate-300 cursor-pointer accent-[#00c2cb] transition-all duration-150"
                      />
                      <span className={`text-[12.5px] font-bold leading-none transition-all duration-150 ${
                        isChecked ? "line-through text-slate-400 font-medium" : "text-slate-700"
                      }`}>
                        {skill}
                      </span>
                    </div>
                    {isChecked && (
                      <span className="text-[9px] font-black text-[#00c2cb] bg-[#00c2cb]/10 px-2 py-0.5 rounded leading-none tracking-wider">
                        DONE
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Premium Next Step Callout */}
          <div className="bg-gradient-to-r from-[#00838F]/5 to-[#00acc1]/5 border border-[#00acc1]/12 p-3.5 rounded-xl flex items-center gap-3.5 transition-all duration-200 hover:shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#00acc1]/10 flex items-center justify-center shrink-0 text-[#00acc1]">
              <svg className="w-4.5 h-4.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[9.5px] font-black text-[#00838F] uppercase tracking-wider">💡 Suggested Next Step</span>
              <p className="text-[11.5px] text-slate-600 font-bold leading-normal">
                {activePath.nextStep}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCardAndCareerPath;
