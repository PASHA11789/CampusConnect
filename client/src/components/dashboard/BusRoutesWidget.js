import React from 'react';
import './BusRoutesWidget.css';

const t = (s) => s;

export const BusRoutesWidget = ({ busRoutes = [] }) => {
  return (
    <div className="utility-item bus-routes">
      <div className="utility-head">
        <span className="utility-icon">🚌</span>
        <h4>{t('Bus Routes & Map')}</h4>
      </div>
      <div className="utility-body map-container">
        <div className="stylised-map">
          <svg viewBox="0 0 200 120" className="map-svg">
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
          <div className="map-overlay">
            <span className="live-badge">{t('LIVE')}</span>
          </div>
        </div>
        <div className="bus-details">
          {busRoutes && busRoutes.length > 0 ? busRoutes.map((route, i) => {
            const isDelayed = route.status?.toLowerCase() === 'delayed';
            return (
              <div key={i} className="bus-row-premium">
                <span className="route">{route.route || `${t('Route')} ${String.fromCharCode(65 + i)}`}</span>
                <span className={`status-pill ${isDelayed ? 'delayed' : 'ontime'}`}>
                  <span className="status-dot"></span>
                  {route.status || t('On Time')}
                </span>
                <span className="time">
                  <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
