import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const t = (s) => s;

const CareerPathExplorer = ({ careers = [], onThreadClick }) => {
  const navigate = useNavigate();

  const getCategoryTag = (category) => {
    switch (category) {
      case 'job_opportunity':
        return { label: t('JOB OPPORTUNITY'), class: 'bg-emerald-500/10 text-emerald-600' };
      case 'mentorship_qa':
        return { label: t('MENTORSHIP Q&A'), class: 'bg-sky-500/10 text-sky-600' };
      case 'general_discussion':
        return { label: t('DISCUSSION'), class: 'bg-amber-500/10 text-amber-600' };
      default:
        return { label: t('GENERAL'), class: 'bg-slate-500/10 text-slate-600' };
    }
  };

  // Limit to 2 items to fit the card layout height perfectly
  const displayCareers = careers.slice(0, 2);

  // Default fallback career items matching mockup exactly if database is empty
  const defaultCareers = [
    {
      _id: 'default-1',
      title: 'How to prepare for AI engineer role?',
      category: 'mentorship_qa',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14d ago
      author: { role: 'alumni' },
      replies: [{}, {}] // 2 replies
    },
    {
      _id: 'default-2',
      title: 'Frontend Developer Intern',
      category: 'job_opportunity',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
      author: { role: 'student' },
      replies: [] // 0 replies
    }
  ];

  const threads = displayCareers.length > 0 ? displayCareers : defaultCareers;

  return (
    <div className="flex flex-col gap-3 font-sans h-full justify-between text-left">
      {/* Header */}
      <div className="flex justify-between items-center w-full pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🎯</span>
          <h4 className="text-[13px] font-black text-[#0d2a42] uppercase tracking-wider m-0">{t('Career & Alumni Hub')}</h4>
        </div>
        <button 
          onClick={() => navigate('/career')}
          className="bg-transparent border-none text-[11px] font-black text-[#00c2cb] hover:text-[#0079c2] transition-colors cursor-pointer"
        >
          {t('View all ➔')}
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 flex flex-col justify-center gap-3.5 py-1">
        {threads.map((thread, i) => {
          const category = getCategoryTag(thread.category);
          const repliesCount = thread.replies ? thread.replies.length : 0;
          return (
            <div 
              key={i} 
              onClick={() => onThreadClick && onThreadClick(thread._id)}
              className="flex flex-col gap-1 cursor-pointer transition-all hover:translate-x-1 group border-b border-slate-50 last:border-0 pb-2.5 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded tracking-wider ${category.class}`}>
                  {category.label}
                </span>
                <span className="text-[9.5px] text-slate-400 font-semibold">{formatDate(thread.createdAt)}</span>
              </div>
              
              <div className="text-[12px] font-black text-[#0d2a42] truncate group-hover:text-[#00c2cb] transition-colors mt-0.5 text-left">
                {thread.title}
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-[9.5px] text-slate-400 font-semibold">
                  {thread.author?.role === 'alumni' ? t('by Senior Alumni') : t('by TechSoft (Lahore)')}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <svg className="w-2.5 h-2.5 text-slate-350" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{repliesCount} {repliesCount === 1 ? t('reply') : t('replies')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerPathExplorer;
