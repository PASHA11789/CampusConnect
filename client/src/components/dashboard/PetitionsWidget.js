import React from 'react';
import './PetitionsWidget.css';

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

export default PetitionsWidget;
