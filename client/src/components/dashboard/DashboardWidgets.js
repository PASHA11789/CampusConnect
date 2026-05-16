import React from 'react';
import './DashboardWidgets.css';

const FORUM_POSTS = [
  { user: 'Ali Ahmed', topic: 'Mid-term Preparation Tips', replies: 12, time: '2h ago' },
  { user: 'Sana Khan', topic: 'How to apply for internship?', replies: 8, time: '5h ago' },
  { user: 'Zaid Malik', topic: 'Best coffee spots on campus', replies: 24, time: '1d ago' },
];

export const ForumsWidget = () => {
  return (
    <div className="db-card widget-forum">
      <div className="db-card-head">
        <h3 className="db-card-title">Student Forums</h3>
        <a href="/forums" className="db-card-link">Join Discussion →</a>
      </div>
      <div className="widget-content scrollable">
        {FORUM_POSTS.map((post, i) => (
          <div key={i} className="forum-item">
            <div className="forum-avatar">{post.user[0]}</div>
            <div className="forum-info">
              <div className="forum-topic">{post.topic}</div>
              <div className="forum-meta">
                <span>By {post.user}</span> • <span>{post.replies} replies</span> • <span>{post.time}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Repeating for visual height if needed */}
        {FORUM_POSTS.map((post, i) => (
          <div key={i+10} className="forum-item">
            <div className="forum-avatar">{post.user[0]}</div>
            <div className="forum-info">
              <div className="forum-topic">{post.topic}</div>
              <div className="forum-meta">
                <span>By {post.user}</span> • <span>{post.replies} replies</span> • <span>{post.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PetitionsWidget = () => {
  return (
    <div className="db-card widget-petition">
      <div className="db-card-head">
        <h3 className="db-card-title">Active Petitions</h3>
        <a href="/petitions" className="db-card-link">View all →</a>
      </div>
      <div className="widget-content">
        <div className="petition-item">
          <div className="petition-info">
            <div className="petition-title">Extend Library Hours</div>
            <div className="petition-progress-bar">
              <div className="progress" style={{ width: '75%' }}></div>
            </div>
            <div className="petition-meta">750 / 1000 signatures</div>
          </div>
          <button className="btn-sign">Sign</button>
        </div>
        <div className="petition-item">
          <div className="petition-info">
            <div className="petition-title">More Vegan Options in Canteen</div>
            <div className="petition-progress-bar">
              <div className="progress" style={{ width: '40%' }}></div>
            </div>
            <div className="petition-meta">400 / 1000 signatures</div>
          </div>
          <button className="btn-sign">Sign</button>
        </div>
      </div>
    </div>
  );
};

export const LostFoundWidget = () => {
  return (
    <div className="utility-item lost-found">
      <div className="utility-head">
        <span className="utility-icon">🔍</span>
        <h4>Lost & Found</h4>
      </div>
      <div className="utility-body">
        <div className="lf-item">
          <span className="lf-tag lost">LOST</span>
          <span>Blue Backpack - Room 204</span>
        </div>
        <div className="lf-item">
          <span className="lf-tag found">FOUND</span>
          <span>Car Keys - Parking Lot</span>
        </div>
      </div>
    </div>
  );
};

export const BusRoutesWidget = () => {
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
          <div className="bus-row">
            <span className="route">Route A</span>
            <span className="status">On Time</span>
            <span className="time">5m</span>
          </div>
          <div className="bus-row">
            <span className="route">Route B</span>
            <span className="status delayed">Delayed</span>
            <span className="time">12m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
