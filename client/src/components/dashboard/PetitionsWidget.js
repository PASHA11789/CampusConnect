import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PetitionsWidget = ({ petitions = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#071A35] text-white border border-[#071A35] rounded-[1.5rem] p-6 flex flex-col justify-between shadow-[0_12px_35px_rgba(7,26,53,0.2)] h-full text-left font-sans transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(7,26,53,0.35)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-black text-white uppercase tracking-wider m-0">Active Petitions</h3>
          <p className="text-[10px] text-white/70 mt-0.5 font-semibold">Initiate or support campus improvement actions</p>
        </div>
        <button 
          onClick={() => navigate("/petitions")}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-[#00c2cb] text-[11px] font-extrabold px-3 py-1 rounded-full transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
        >
          <span>View all</span>
          <i className="fa-solid fa-arrow-right text-[10px]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-full pr-1 overflow-x-hidden my-2">
        {petitions && petitions.length > 0 ? [...petitions]
          .sort((a, b) => {
            const levelPriority = { Class: 1, Department: 2, Campus: 3 };
            const prioA = levelPriority[a.level] || 4;
            const prioB = levelPriority[b.level] || 4;
            if (prioA !== prioB) return prioA - prioB;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .map((petition, i) => {
          const sigsCount = petition.currentSignaturesCount !== undefined
            ? petition.currentSignaturesCount
            : (petition.signatures ? petition.signatures.filter(Boolean).length : (petition.currentSignatures || 0));
          const target = petition.milestone;
          const hasMilestone = target !== null && target !== undefined && target > 0;
          const progress = hasMilestone ? Math.min((sigsCount / target) * 100, 100) : 0;
          const isClassLevel = petition.level === 'Class';
          const isDeptLevel = petition.level === 'Department';

          return (
            <div 
              key={petition._id || i} 
              className={`flex items-start gap-3 py-3 border-b border-white/10 last:border-b-0 transition-all rounded-xl p-2.5 my-1 ${
                isClassLevel ? "bg-white/10 border-l-4 border-l-[#00c2cb] shadow-sm" : isDeptLevel ? "border-l-2 border-l-[#00c2cb]" : ""
              }`}
            >
              <div 
                className="flex-1 cursor-pointer hover:opacity-85 transition-opacity flex flex-col gap-1"
                onClick={() => navigate(`/petitions?id=${petition._id}`)}
              >
                {/* Hovering Scope Tag Badge with Tooltip */}
                <div className="flex items-center gap-2 mb-0.5 relative">
                  {isClassLevel ? (
                    <div className="relative group/tag">
                      <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-[#00c2cb] text-[#071A35] shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105">
                        <i className="fa-solid fa-star text-[9px]" /> CLASS • HIGH PRIORITY
                      </span>
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/tag:flex flex-col bg-[#071A35] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap z-30 animate-fade-in pointer-events-none">
                        <span className="flex items-center gap-1"><i className="fa-solid fa-star text-[10px] text-[#00c2cb]" /> Class Level Petition (High Priority)</span>
                        <span className="text-[8.5px] text-white/70 font-semibold">Targeted to your class members</span>
                      </div>
                    </div>
                  ) : isDeptLevel ? (
                    <div className="relative group/tag">
                      <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-[#00c2cb] text-[#071A35] shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105">
                        <i className="fa-solid fa-building text-[9px]" /> DEPT • MEDIUM PRIORITY
                      </span>
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/tag:flex flex-col bg-[#071A35] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap z-30 animate-fade-in pointer-events-none">
                        <span className="flex items-center gap-1"><i className="fa-solid fa-building text-[10px] text-[#00c2cb]" /> Department Level Petition</span>
                        <span className="text-[8.5px] text-white/70 font-semibold">Targeted to department peers</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group/tag">
                      <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase bg-white/20 text-white/90 shadow-xs border border-white/20 flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105">
                        <i className="fa-solid fa-graduation-cap text-[9px]" /> CAMPUS PETITION
                      </span>
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/tag:flex flex-col bg-[#071A35] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap z-30 animate-fade-in pointer-events-none">
                        <span className="flex items-center gap-1"><i className="fa-solid fa-graduation-cap text-[10px] text-[#00c2cb]" /> Campus-wide Petition</span>
                        <span className="text-[8.5px] text-white/70 font-semibold">Open for all campus members</span>
                      </div>
                    </div>
                  )}
                  {petition.targetGroup && (
                    <span className="text-[9px] font-bold text-white/60 truncate max-w-[140px]">
                      ({petition.targetGroup})
                    </span>
                  )}
                </div>

                <div className="text-[13px] font-bold text-white leading-snug line-clamp-1">
                  {petition.title || 'Untitled'}
                </div>

                {hasMilestone ? (
                  <div className="mt-1">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full shadow-sm bg-[#00c2cb]" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9.5px] text-white/70 font-semibold mt-1">
                      <span>{sigsCount} / {target} signatures</span>
                      <span className="font-bold text-white/90">{Math.round(progress)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[9.5px] font-extrabold text-[#071A35] bg-[#00c2cb] w-fit px-2 py-0.5 rounded-full mt-1">
                    {sigsCount} signatures (No Limit)
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-white/10 text-[#00c2cb] flex items-center justify-center text-xl mb-3 shadow-inner border border-white/10">
              <i className="fa-solid fa-clipboard-list text-lg text-[#00c2cb]" />
            </div>
            <p className="text-[13px] font-extrabold text-white mb-1 m-0">No active petitions</p>
            <p className="text-[10px] text-white/70 font-semibold max-w-[200px] leading-relaxed">
              Be the change. Start a petition for a cause you care about.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <button 
        onClick={() => navigate('/petitions', { state: { openModal: true } })}
        className="mt-3 w-full bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-2.5 rounded-full text-[12px] font-extrabold transition-all border-none cursor-pointer shadow-md flex items-center justify-center gap-1.5"
      >
        <i className="fa-solid fa-plus text-xs" /> Create a Petition
      </button>
    </div>
  );
};

export default PetitionsWidget;
