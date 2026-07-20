import React from 'react';
import { useNavigate } from 'react-router-dom';

const t = (s) => s;

export const BusRoutesWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 font-sans h-full justify-between text-left min-h-[180px]">
      {/* Header */}
      <div className="flex justify-between items-center w-full pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🚌</span>
          <h4 className="text-[13px] font-black text-[#0d2a42] uppercase tracking-wider m-0">{t('Bus Routes & Live Map')}</h4>
        </div>
        <button 
          onClick={() => navigate('/bus-routes')}
          className="bg-transparent border-none text-[11px] font-black text-[#00c2cb] hover:text-[#0079c2] transition-colors cursor-pointer"
        >
          {t('View Live Map ➔')}
        </button>
      </div>

      {/* Full-Width Map Frame */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-1 min-h-[140px] w-full">
        <iframe
          title="Minhaj University Lahore Map"
          src="https://maps.google.com/maps?q=Minhaj%20University%20Lahore&t=&z=14&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          className="absolute inset-0 w-full h-full block"
        />
        {/* Overlay CTA Button at the bottom right of the Map */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button 
            onClick={() => navigate('/bus-routes')}
            className="bg-[#00c2cb] hover:bg-[#00a8b0] text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow-md border-none transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>📍</span> {t('Open Campus Map')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusRoutesWidget;
