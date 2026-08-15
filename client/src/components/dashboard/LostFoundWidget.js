import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LostFoundWidget = ({ items = [] }) => {
  const navigate = useNavigate();

  const lostCount = items.filter(item => item.type?.toUpperCase() === 'LOST').length;
  const foundCount = items.filter(item => item.type?.toUpperCase() === 'FOUND').length;

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[1.5rem] border border-[#E8E1D5] p-5 flex flex-col font-sans justify-between shadow-[0_10px_35px_rgba(7,26,53,0.05)] min-h-[295px] h-[295px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,26,53,0.12)]">
      {/* Header */}
      <div className="flex items-center pb-2.5 border-b border-[#E8E1D5]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#00c2cb] text-[#071A35] text-sm font-black flex items-center justify-center shadow-sm shrink-0">
            <i className="fa-solid fa-magnifying-glass" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <h4 className="text-[13.5px] font-black text-[#071A35] uppercase tracking-wider m-0">Lost &amp; Found Hub</h4>
            <span className="text-[9.5px] font-semibold text-[#211A24]/60 mt-0.5">Track or report campus items</span>
          </div>
        </div>
      </div>

      {/* Two Simple Clean Sections */}
      <div className="flex flex-col gap-3 flex-1 justify-center my-auto py-1">

        {/* Section 1: Lost Items (Soft Lavender / Violet) */}
        <div className="bg-[#E2DEFC]/70 border border-[#DCD9F7] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left shadow-xs transition-all hover:border-[#00c2cb]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white text-[#071A35] flex items-center justify-center text-sm shrink-0 shadow-xs border border-white">
              <i className="fa-solid fa-magnifying-glass" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13.5px] font-black text-[#071A35] leading-snug">Lost Items</span>
              <span className="text-[10px] font-semibold text-[#071A35]/70 truncate">
                {lostCount > 0 ? `${lostCount} active lost report${lostCount === 1 ? '' : 's'}` : 'View missing campus items'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/lost-found', { state: { filterType: 'LOST', selectedTab: 'lost' } })}
            className="px-4 py-1.5 rounded-full text-[11px] font-black text-[#071A35] bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs border border-white shrink-0 flex items-center gap-1"
          >
            <span>View</span>
            <i className="fa-solid fa-arrow-right text-[9px]" />
          </button>
        </div>

        {/* Section 2: Found Items (Dark Navy & Cyan) */}
        <div className="bg-[#071A35] text-white border border-[#071A35] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left shadow-sm transition-all hover:border-[#00c2cb]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#00c2cb] flex items-center justify-center text-sm shrink-0 border border-white/10">
              <i className="fa-solid fa-handshake" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13.5px] font-black text-[#00c2cb] leading-snug">Found Items</span>
              <span className="text-[10px] font-semibold text-white/75 truncate">
                {foundCount > 0 ? `${foundCount} active found item${foundCount === 1 ? '' : 's'}` : 'View surrendered & found items'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/lost-found', { state: { filterType: 'FOUND', selectedTab: 'found' } })}
            className="px-4 py-1.5 rounded-full text-[11px] font-black text-white bg-[#00c2cb] hover:bg-[#00a8b5] transition-all cursor-pointer shadow-sm border-none shrink-0 flex items-center gap-1"
          >
            <span>View</span>
            <i className="fa-solid fa-arrow-right text-[9px]" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LostFoundWidget;
