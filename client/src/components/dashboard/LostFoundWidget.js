import React from 'react';

export const LostFoundWidget = ({ items = [] }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[18px]">🔍</span>
        <h4 className="text-[14px] font-bold text-[#0a2342]">Lost & Found</h4>
      </div>
      <div className="flex-1 bg-slate-50 rounded-xl p-3 flex flex-col gap-2 max-h-full overflow-y-auto pr-1">
        {items && items.length > 0 ? items.map((item, i) => {
          const isLost = item.type?.toUpperCase() === 'LOST';
          return (
            <div key={i} className={`flex flex-col gap-1.5 p-2.5 bg-white border border-[#eef2f6] rounded-xl relative transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:translate-x-0.75 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(10,35,66,0.06)] hover:border-slate-300 ${isLost ? 'border-l-[3.5px] border-l-red-500 bg-red-500/[0.005] hover:border-l-[4.5px]' : 'border-l-[3.5px] border-l-emerald-500 bg-emerald-500/[0.005] hover:border-l-[4.5px]'}`}>
              <div className="flex items-center justify-between w-full">
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center justify-center ${isLost ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {isLost ? 'Lost' : 'Found'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-0.75 mt-0.25">
                <div className="text-[13px] font-bold text-[#0a2342] truncate max-w-[140px]">{item.itemName}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[140px]">
                  <svg className="w-[11px] h-[11px] text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {item.location}
                </div>
              </div>
              <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
                <span className={`w-1.25 h-1.25 rounded-full inline-block ${isLost ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <span className="text-[10px] text-slate-400 font-semibold">{item.status || 'Open'}</span>
              </div>
            </div>
          );
        }) : (
          <div className="p-6 text-center text-slate-400 text-[12px] font-semibold bg-white border border-dashed border-slate-200 rounded-lg">No items reported recently</div>
        )}
      </div>
    </div>
  );
};

export default LostFoundWidget;

