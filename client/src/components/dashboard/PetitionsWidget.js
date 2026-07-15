import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PetitionsWidget = ({ petitions = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] h-full">
      <div className="flex items-center justify-between mb-[18px]">
        <h3 className="text-[14px] font-extrabold text-[#0a2342]">Active Petitions</h3>
        <button 
          onClick={() => navigate("/petitions")}
          className="bg-transparent border-none text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px] cursor-pointer"
        >
          View all →
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {petitions && petitions.length > 0 ? petitions.map((petition, i) => {
          const sigsCount = petition.signatures ? petition.signatures.length : (petition.currentSignatures || 0);
          const target = petition.milestone;
          const hasMilestone = target !== null && target !== undefined && target > 0;
          const progress = hasMilestone ? Math.min((sigsCount / target) * 100, 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div 
                className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/petitions?id=${petition._id}`)}
              >
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
              <button 
                onClick={() => navigate(`/petitions?id=${petition._id}`)}
                className="bg-[#0a2342] text-white border-none px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#00c2cb] hover:-translate-y-0.5"
              >
                Sign
              </button>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center mt-2 flex-1">
            {/* Clipboard Illustration */}
            <div className="w-14 h-14 mb-3 text-slate-350">
              <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-[12.5px] font-extrabold text-[#0a2342] mb-1">No active petitions</div>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal max-w-[180px]">
              Be the change. Start a petition for a cause you care about.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetitionsWidget;

