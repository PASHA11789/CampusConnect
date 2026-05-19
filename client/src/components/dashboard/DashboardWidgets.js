import React from 'react';
import './DashboardWidgets.css';

export const ForumsWidget = ({ forums = [] }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="db-card widget-forum">
      <div className="db-card-head">
        <h3 className="db-card-title">Student Forums</h3>
        <a href="/forums" className="db-card-link">Join Discussion →</a>
      </div>
      <div className="widget-content scrollable">
        {forums && forums.length > 0 ? forums.map((post, i) => (
          <div key={i} className="forum-item">
            <div className="forum-avatar">{post.title ? post.title.charAt(0).toUpperCase() : 'F'}</div>
            <div className="forum-info">
              <div className="forum-topic">{post.title || 'Untitled'}</div>
              <div className="forum-meta">
                <span>{post.repliesCount || 0} replies</span> • <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No active discussions</div>
        )}
      </div>
    </div>
  );
};

export const PetitionsWidget = ({ petitions = [] }) => {
  return (
    <div className="db-card widget-petition">
      <div className="db-card-head">
        <h3 className="db-card-title">Active Petitions</h3>
        <a href="/petitions" className="db-card-link">View all →</a>
      </div>
      <div className="widget-content">
        {petitions && petitions.length > 0 ? petitions.map((petition, i) => {
          const target = 1000;
          const progress = Math.min(((petition.currentSignatures || 0) / target) * 100, 100);
          return (
            <div key={i} className="petition-item">
              <div className="petition-info">
                <div className="petition-title">{petition.title || 'Untitled'}</div>
                <div className="petition-progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="petition-meta">{petition.currentSignatures || 0} / {target} signatures</div>
                <div className="petition-status" style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                  Status: {petition.status || 'Active'}
                </div>
              </div>
              <button className="btn-sign">Sign</button>
            </div>
          );
        }) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No active petitions</div>
        )}
      </div>
    </div>
  );
};

export const LostFoundWidget = ({ items = [] }) => {
  return (
    <div className="utility-item lost-found">
      <div className="utility-head">
        <span className="utility-icon">🔍</span>
        <h4>Lost & Found</h4>
      </div>
      <div className="utility-body">
        {items && items.length > 0 ? items.map((item, i) => (
          <div key={i} className="lf-item">
            <span className={`lf-tag ${item.title ? item.title.toLowerCase() : ''}`}>{item.title || 'REPORT'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500' }}>{item.itemName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.location}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Status: {item.status || 'Open'}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No items reported</div>
        )}
      </div>
    </div>
  );
};

export const BusRoutesWidget = ({ busRoutes = [] }) => {
  return (
    <div className="utility-item bus-routes">
      <div className="utility-head">
        <span className="utility-icon">🚌</span>
        <h4>Bus Routes & Map</h4>
      </div>
      <div className="utility-body map-container">
        <div className="stylised-map">
          <svg viewBox="0 0 200 120" className="map-svg">
            <path d="M10,20 L190,20 L190,100 L10,100 Z" fill="#eef2f6" />
            <path d="M40,20 L40,100 M80,20 L80,100 M120,20 L120,100 M160,20 L160,100" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M10,40 L190,40 M10,70 L190,70" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M20,30 Q100,10 180,30 T180,90 Q100,110 20,90 Z" fill="none" stroke="#00c2cb" strokeWidth="2" strokeDasharray="4,2" />
            <circle cx="100" cy="15" r="4" fill="#0a2342">
              <animate attributeName="cx" values="20;180;20" dur="10s" repeatCount="indefinite" />
              <animate attributeName="cy" values="30;30;30" dur="10s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="map-overlay">
            <span className="live-badge">LIVE</span>
          </div>
        </div>
        <div className="bus-details">
          {busRoutes && busRoutes.length > 0 ? busRoutes.map((route, i) => (
            <div key={i} className="bus-row">
              <span className="route">{route.route || `Route ${String.fromCharCode(65 + i)}`}</span>
              <span className={`status ${route.status?.toLowerCase() === 'delayed' ? 'delayed' : ''}`}>
                {route.status || 'On Time'}
              </span>
              <span className="time">{route.time || '5m'}</span>
            </div>
          )) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No bus routes available</div>
          )}
        </div>
      </div>
    </div>
  );
};
