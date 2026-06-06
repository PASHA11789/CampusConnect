import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PetitionsWidget = ({ petitions = [] }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-[18px]">
        <h3 className="text-[14px] font-extrabold text-[#0a2342]">Active Petitions</h3>
        <a href="/petitions" className="text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px]">View all →</a>
      </div>
      <div className="flex flex-col gap-2">
        {petitions && petitions.length > 0 ? petitions.map((petition, i) => {
          const sigsCount = petition.signatures ? petition.signatures.length : (petition.currentSignatures || 0);
          const target = petition.milestone;
          const hasMilestone = target !== null && target !== undefined && target > 0;
          const progress = hasMilestone ? Math.min((sigsCount / target) * 100, 100) : 0;
          return (
            <div
              key={i}
              onClick={() => navigate(`/petitions?id=${petition._id}`)}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-slate-50 rounded-xl px-2.5 transition-colors"
            >
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-800 mb-1.5">{petition.title || 'Untitled'}</div>
                {hasMilestone ? (
                  <>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00c2cb] to-[#00d4ff] rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{sigsCount} / {target} signatures</div>
                  </>
                ) : (
                  <div className="text-[10px] font-bold text-[#0a2342] bg-[#0a2342]/5 w-fit px-2 py-0.5 rounded border border-[#0a2342]/10 mt-1">
                    {sigsCount} signatures (No Limit)
                  </div>
                )}
                <div className="text-[12px] text-slate-500 mt-1">
                  Status: {petition.status || 'Active'}
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No active petitions</div>
        )}
      </div>
    </div>
  );
};

export default PetitionsWidget;

