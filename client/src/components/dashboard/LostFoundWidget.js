import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export const LostFoundWidget = ({ items = [] }) => {
  const navigate = useNavigate();

  // Filter items (maximum 2 for each to fit fixed height)
  const lostItems = items.filter(item => item.type?.toUpperCase() === 'LOST').slice(0, 2);
  const foundItems = items.filter(item => item.type?.toUpperCase() === 'FOUND').slice(0, 2);

  return (
    <div className="w-full bg-white rounded-[1.5rem] border border-[#E8E1D5] p-5 flex flex-col font-sans justify-between shadow-[0_10px_35px_rgba(7,26,53,0.05)] h-[300px] min-h-[300px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,26,53,0.12)]">
      {/* Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-[#E8E1D5] mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F5B82E] text-[#071A35] text-base font-black flex items-center justify-center shadow-sm">
            🔍
          </div>
          <div className="flex flex-col text-left leading-tight">
            <h4 className="text-[13.5px] font-black text-[#071A35] uppercase tracking-wider m-0">Lost &amp; Found Hub</h4>
            <span className="text-[9.5px] font-semibold text-[#211A24]/60 mt-0.5">Track or report campus items</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/lost-found')}
          className="bg-transparent border border-[#E8E1D5] rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#071A35] hover:bg-[#FAF7F0] transition-colors cursor-pointer flex items-center gap-1"
        >
          View all ➔
        </button>
      </div>

      {/* Stacked Cards Container - Fixed Height Grid */}
      <div className="flex flex-col gap-2.5 flex-1 justify-between">
        
        {/* Top: LOST ITEMS Card (Soft Lavender) */}
        <div className="bg-[#E2DEFC]/60 border border-[#DCD9F7] rounded-[1.1rem] p-3 flex flex-col justify-between text-left h-[105px]">
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black text-[#071A35]">ⓘ</span>
              <span className="text-[10px] font-black text-[#071A35] uppercase tracking-wider">LOST ITEMS</span>
            </div>

            {/* Scrollable list with fixed max height */}
            <div className="flex flex-col gap-1 max-h-[42px] overflow-y-auto scrollbar-none pr-0.5">
              {lostItems.length > 0 ? (
                lostItems.map((item, i) => (
                  <div key={i} className="bg-white/80 border border-white rounded-md px-2 py-1 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px]">🔍</span>
                      <div className="flex flex-col min-w-0 text-left leading-tight">
                        <span className="text-[10px] font-black text-[#071A35] truncate">{item.itemName || item.title || 'Lost Item'}</span>
                        <span className="text-[8.5px] font-semibold text-[#211A24]/60 truncate">{item.location || 'Campus'}</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-[#071A35]/60 shrink-0">{formatDate(item.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-[9.5px] font-semibold text-[#211A24]/70 m-0 leading-tight">
                  No active lost reports. Need help finding something?
                </p>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/lost-found', { state: { openReportModal: true, type: 'LOST' } })}
            className="w-full bg-white hover:bg-slate-50 border border-white text-[#071A35] py-1 rounded-full text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs mt-1"
          >
            <span>+</span> Report Lost Item
          </button>
        </div>

        {/* Bottom: FOUND ITEMS Card (Dark Navy) */}
        <div className="bg-[#071A35] text-white border border-[#071A35] rounded-[1.1rem] p-3 flex flex-col justify-between text-left h-[105px]">
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black text-[#F5B82E]">✓</span>
              <span className="text-[10px] font-black text-[#F5B82E] uppercase tracking-wider">FOUND ITEMS</span>
            </div>

            {/* Scrollable list with fixed max height */}
            <div className="flex flex-col gap-1 max-h-[42px] overflow-y-auto scrollbar-none pr-0.5">
              {foundItems.length > 0 ? (
                foundItems.map((item, i) => (
                  <div key={i} className="bg-white/10 border border-white/10 rounded-md px-2 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px]">🤝</span>
                      <div className="flex flex-col min-w-0 text-left leading-tight">
                        <span className="text-[10px] font-black text-white truncate">{item.itemName || item.title || 'Found Item'}</span>
                        <span className="text-[8.5px] font-semibold text-white/70 truncate">{item.location || 'Campus'}</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-[#F5B82E] shrink-0">{formatDate(item.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-[9.5px] font-semibold text-white/80 m-0 leading-tight">
                  No found reports. Found something on campus?
                </p>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/lost-found', { state: { openReportModal: true, type: 'FOUND' } })}
            className="w-full bg-[#F5B82E] hover:bg-[#FFD05B] text-[#071A35] py-1 rounded-full text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md border-none mt-1"
          >
            <span>+</span> Submit Found Item
          </button>
        </div>

      </div>
    </div>
  );
};

export default LostFoundWidget;
