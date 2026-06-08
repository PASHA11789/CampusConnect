import React from 'react';

const ANNOUNCEMENTS = [
  { badge: 'URGENT', title: 'Mid-term exam schedule released',    desc: 'Check the portal for your full mid-term schedule.', color: '#f87171' },
  { badge: 'INFO',   title: 'Library extended hours — May 2025',  desc: 'Library will remain open till 10 PM during exams.', color: '#60a5fa' },
  { badge: 'NEW',    title: 'Campus job fair — June 3rd',         desc: 'Over 30 companies visiting campus this year.',       color: '#34d399' },
];

const t = (s) => s;

const AnnouncementsWidget = () => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-[18px]">
        <h3 className="text-[14px] font-extrabold text-[#0a2342]">{t('Announcements')}</h3>
        <a href="/announcements" className="text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px]">{t('View all →')}</a>
      </div>
      <div className="flex flex-col gap-3">
        {ANNOUNCEMENTS.map((a, i) => (      
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 transition-colors duration-200 hover:border-[#00c2cb]">
            <span className="inline-block text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full mb-1.5" style={{ background: `${a.color}22`, color: a.color }}>{a.badge}</span>
            <div className="text-[13px] font-bold text-[#0a2342] mb-1">{a.title}</div>
            <div className="text-[11.5px] text-slate-500 leading-normal">{a.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnnouncementsWidget;
