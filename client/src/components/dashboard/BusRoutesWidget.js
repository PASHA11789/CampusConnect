import React from 'react';
import { useNavigate } from 'react-router-dom';

const t = (s) => s;

export const BusRoutesWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-6 flex flex-col justify-between shadow-[0_10px_35px_rgba(7,26,53,0.05)] h-full text-left font-sans min-h-[200px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,26,53,0.12)]">
      {/* Header */}
      <div className="flex justify-between items-center w-full pb-3 border-b border-[#E8E1D5] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#071A35] text-white flex items-center justify-center font-bold text-sm">
            🚌
          </div>
          <h4 className="text-[13.5px] font-black text-[#071A35] uppercase tracking-wider m-0">{t('Bus Routes & Live Map')}</h4>
        </div>
        <button
          onClick={() => navigate('/bus-routes')}
          className="bg-transparent border-none text-[11px] font-extrabold text-[#071A35] hover:text-[#2563EB] transition-colors cursor-pointer flex items-center gap-1"
        >
          {t('View Live Map ➔')}
        </button>
      </div>

      {/* Full-Width Map Frame */}
      <div className="relative rounded-[1rem] border border-[#E8E1D5] overflow-hidden bg-[#FAF7F0] flex-1 min-h-[140px] w-full">
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
            className="bg-[#071A35] hover:bg-[#0D2A42] text-white text-[10px] font-extrabold py-1.5 px-3 rounded-full shadow-md border-none transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>📍</span> {t('Open Campus Map')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusRoutesWidget;
