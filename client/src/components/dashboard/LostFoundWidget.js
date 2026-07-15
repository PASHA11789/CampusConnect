import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export const LostFoundWidget = ({ items = [] }) => {
  const navigate = useNavigate();

  // Filter and limit to 3 items maximum for each type
  const lostItems = items.filter(item => item.type?.toUpperCase() === 'LOST').slice(0, 3);
  const foundItems = items.filter(item => item.type?.toUpperCase() === 'FOUND').slice(0, 3);

  // Helper to get standard icons for items
  const getItemIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("book") || lower.includes("textbook") || lower.includes("notebook")) {
      return "📘";
    }
    if (lower.includes("wallet") || lower.includes("purse") || lower.includes("card")) {
      return "👛";
    }
    if (lower.includes("bottle") || lower.includes("water") || lower.includes("flask")) {
      return "🥤";
    }
    if (lower.includes("usb") || lower.includes("drive") || lower.includes("flash")) {
      return "💾";
    }
    if (lower.includes("earphone") || lower.includes("headphone") || lower.includes("buds")) {
      return "🎧";
    }
    return "📦";
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-[22px] flex flex-col font-sans transition-all duration-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] text-left md:h-[290px] min-h-[290px] justify-between">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[18px] text-sky-600 bg-sky-50 w-8 h-8 rounded-lg flex items-center justify-center border border-sky-100 shadow-sm">
            🔍
          </span>
          <div className="flex flex-col">
            <h4 className="text-[13px] font-black text-[#0d2a42] uppercase tracking-wider m-0">LOST & FOUND HUB</h4>
            <span className="text-[9.5px] font-semibold text-slate-400 mt-0.5">Track or report campus items</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/lost-found')}
          className="bg-transparent border-none text-[11px] font-black text-[#00c2cb] hover:text-[#0079c2] transition-colors cursor-pointer"
        >
          View all ➔
        </button>
      </div>

      {/* Grid of Two Columns (Lost vs Found) */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        
        {/* Left Column: Lost Items Container Card */}
        <div className="bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-3 flex flex-col justify-between h-full min-h-0">
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            <div className="flex items-center gap-1.5 mb-2 shrink-0">
              <span className="text-[13px] text-red-500">🔍</span>
              <div className="flex flex-col leading-none">
                <span className="text-[11.5px] font-black text-red-600">Lost Items</span>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">Click to Report / View</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
              {lostItems.length > 0 ? lostItems.map((item, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-2 flex items-center justify-between shadow-[0_2px_4px_rgba(244,63,94,0.01)] hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[12px] border border-slate-700 shrink-0">
                      {getItemIcon(item.itemName)}
                    </span>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-[11px] font-black text-[#0d2a42] truncate">{item.itemName}</span>
                      <span className="text-[8.5px] text-slate-450 font-bold truncate">{item.location}</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold shrink-0 pl-1">{formatDate(item.createdAt)}</span>
                </div>
              )) : (
                <div className="bg-white/80 text-[9px] text-slate-400 text-center py-5 font-semibold border border-dashed border-rose-200/50 rounded-xl flex items-center justify-center flex-1">
                  No lost reports
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/lost-found', { state: { openReportModal: true, type: 'LOST' } })}
            className="mt-2 w-full bg-white hover:bg-rose-50 border border-rose-250 text-rose-600 py-1.5 rounded-full text-[9px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>➕</span> Report Lost Item
          </button>
        </div>

        {/* Right Column: Found Items Container Card */}
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 flex flex-col justify-between h-full min-h-0">
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            <div className="flex items-center gap-1.5 mb-2 shrink-0">
              <span className="text-[13px] text-emerald-500">🤝</span>
              <div className="flex flex-col leading-none">
                <span className="text-[11.5px] font-black text-emerald-600">Found Items</span>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">Click to Claim / Browse</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
              {foundItems.length > 0 ? foundItems.map((item, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-2 flex items-center justify-between shadow-[0_2px_4px_rgba(16,185,129,0.01)] hover:border-emerald-250 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[12px] border border-slate-700 shrink-0">
                      {getItemIcon(item.itemName)}
                    </span>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-[11px] font-black text-[#0d2a42] truncate">{item.itemName}</span>
                      <span className="text-[8.5px] text-slate-450 font-bold truncate">{item.location}</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold shrink-0 pl-1">{formatDate(item.createdAt)}</span>
                </div>
              )) : (
                <div className="bg-white/80 text-[9px] text-slate-400 text-center py-5 font-semibold border border-dashed border-emerald-200/50 rounded-xl flex items-center justify-center flex-1">
                  No found reports
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/lost-found', { state: { openReportModal: true, type: 'FOUND' } })}
            className="mt-2 w-full bg-white hover:bg-emerald-50 border border-emerald-250 text-emerald-600 py-1.5 rounded-full text-[9px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>👤</span> Submit Found Item
          </button>
        </div>

      </div>
    </div>
  );
};

export default LostFoundWidget;
