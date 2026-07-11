import React from 'react';
import { Link } from 'react-router-dom';

const t = (s) => s;

export const BusRoutesWidget = ({ busRoutes = [] }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🚌</span>
          <h4 className="text-[14px] font-bold text-[#0a2342]">{t('Bus Routes & Map')}</h4>
        </div>
        <Link to="/bus-routes" className="text-[11px] font-bold text-[#00c2cb] hover:text-[#0079c2] transition-colors">{t('View Live Map ➔')}</Link>
      </div>
      <div className="flex-1 bg-slate-50 rounded-xl p-0 flex flex-col gap-2.5 overflow-hidden">
        <div className="relative h-[100px] border-b border-[#eef2f6] bg-slate-200">
          <svg viewBox="0 0 200 120" className="w-full h-full block">
            {/* Professional light-themed canvas */}
            <rect width="200" height="120" fill="#f1f5f9" />
            
            {/* Winding road path representing commute route */}
            <path d="M20,60 Q60,25 100,60 T180,60" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
            <path d="M20,60 Q60,25 100,60 T180,60" fill="none" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />

            {/* University Campus Landmark (Left) */}
            <rect x="10" y="15" width="34" height="20" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
            <text x="14" y="27" fill="#94a3b8" fontSize="5.5" fontWeight="700">{t('MUL Campus')}</text>
            <circle cx="27" cy="40" r="1.5" fill="#00c2cb" />

            {/* Hamdard Chowk Junction Landmark (Middle) */}
            <circle cx="100" cy="60" r="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
            <text x="87" y="62" fill="#94a3b8" fontSize="4.5" fontWeight="700">{t('Hamdard Chowk')}</text>

            {/* Township Area Landmark (Right) */}
            <rect x="156" y="15" width="34" height="20" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
            <text x="160" y="27" fill="#94a3b8" fontSize="5.5" fontWeight="700">{t('Township')}</text>
            <circle cx="173" cy="40" r="1.5" fill="#00c2cb" />

            {/* Active bus route track overlay in brand teal */}
            <path d="M20,60 Q60,25 100,60 T180,60" fill="none" stroke="#00c2cb" strokeWidth="2.2" strokeDasharray="4,2" />

            {/* Live Bus tracking pin dot walking along the commute route */}
            <circle r="4.5" fill="#0a2342" stroke="#ffffff" strokeWidth="1.5">
              <animateMotion path="M20,60 Q60,25 100,60 T180,60" dur="12s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide animate-pulse shadow-[0_1px_4px_rgba(220,38,38,0.2)]">{t('LIVE')}</span>
          </div>
        </div>
        <div className="px-2 pb-2.5 flex flex-col gap-1.5">
          {busRoutes && busRoutes.length > 0 ? busRoutes.map((route, i) => {
            const isDelayed = route.status?.toLowerCase() === 'delayed';
            return (
              <div key={i} className="flex justify-between items-center text-[12px] font-semibold py-1.5 transition-all duration-200 ease-out hover:translate-x-1">
                <span className="text-[#0a2342] font-bold w-[60px]">{route.route || `${t('Route')} ${String.fromCharCode(65 + i)}`}</span>
                <span className={`inline-flex items-center gap-1.25 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isDelayed ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  <span className={`w-1.25 h-1.25 rounded-full inline-block ${isDelayed ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  {route.status || t('On Time')}
                </span>
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {route.time || t('5m')}
                </span>
              </div>
            );
          }) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{t('No bus routes available')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusRoutesWidget;

