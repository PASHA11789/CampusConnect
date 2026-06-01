import React from 'react';

export const PetitionsWidget = ({ petitions = [] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-[18px]">
        <h3 className="text-[14px] font-extrabold text-[#0a2342]">Active Petitions</h3>
        <a href="/petitions" className="text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px]">View all →</a>
      </div>
      <div className="flex flex-col gap-2">
        {petitions && petitions.length > 0 ? petitions.map((petition, i) => {
          const target = 1000;
          const progress = Math.min(((petition.currentSignatures || 0) / target) * 100, 100);
          return (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-slate-800 mb-1.5">{petition.title || 'Untitled'}</div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00c2cb] to-[#00d4ff] rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{petition.currentSignatures || 0} / {target} signatures</div>
                <div className="text-[12px] text-slate-500 mt-1">
                  Status: {petition.status || 'Active'}
                </div>
              </div>
              <button className="bg-[#0a2342] text-white border-none px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#00c2cb] hover:-translate-y-0.5">Sign</button>
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

