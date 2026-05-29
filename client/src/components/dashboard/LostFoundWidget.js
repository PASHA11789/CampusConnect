import React from 'react';
import './LostFoundWidget.css';

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
    <div className="utility-item lost-found">
      <div className="utility-head">
        <span className="utility-icon">🔍</span>
        <h4>Lost & Found</h4>
      </div>
      <div className="utility-body premium-scroll">
        {items && items.length > 0 ? items.map((item, i) => {
          const isLost = item.title?.toUpperCase() === 'LOST';
          return (
            <div key={i} className={`lf-card-item ${isLost ? 'lost-card' : 'found-card'}`}>
              <div className="lf-card-left">
                <span className={`lf-badge-pill ${isLost ? 'lost' : 'found'}`}>
                  {isLost ? 'Lost' : 'Found'}
                </span>
                <span className="lf-time">{formatDate(item.createdAt)}</span>
              </div>
              <div className="lf-card-content">
                <div className="lf-item-name">{item.itemName}</div>
                <div className="lf-item-location">
                  <svg className="lf-loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {item.location}
                </div>
              </div>
              <div className="lf-card-right">
                <span className={`lf-status-dot ${isLost ? 'lost' : 'found'}`}></span>
                <span className="lf-status-text">{item.status || 'Open'}</span>
              </div>
            </div>
          );
        }) : (
          <div className="lf-empty-state">No items reported recently</div>
        )}
      </div>
    </div>
  );
};

export default LostFoundWidget;
