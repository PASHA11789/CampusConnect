import React from 'react';
import './AnnouncementsFeed.css';

const ANNOUNCEMENTS = [
  { badge: 'URGENT', title: 'Mid-term exam schedule released',    desc: 'Check the portal for your full mid-term schedule.', color: '#f87171' },
  { badge: 'INFO',   title: 'Library extended hours — May 2025',  desc: 'Library will remain open till 10 PM during exams.', color: '#60a5fa' },
  { badge: 'NEW',    title: 'Campus job fair — June 3rd',         desc: 'Over 30 companies visiting campus this year.',       color: '#34d399' },
];

const t = (s) => s;

const AnnouncementsFeed = () => {
  return (
    <section className="db-card">
      <div className="db-card-head">
        <h3 className="db-card-title">{t('Announcements')}</h3>
        <a href="/announcements" className="db-card-link">{t('View all →')}</a>
      </div>
      <div className="db-announce-list">
        {ANNOUNCEMENTS.map((a, i) => (      
          <div key={i} className="db-announce-item">
            <span className="db-announce-badge" style={{ background: `${a.color}22`, color: a.color }}>{a.badge}</span>
            <div className="db-announce-title">{a.title}</div>
            <div className="db-announce-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsFeed;
