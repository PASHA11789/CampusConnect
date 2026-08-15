import React from 'react';
import { useNavigate } from 'react-router-dom';

const t = (s) => s;

const CareerPathExplorer = ({ careers = [], onThreadClick }) => {
  const navigate = useNavigate();

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
    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-6 flex flex-col justify-between shadow-[0_10px_35px_rgba(7,26,53,0.05)] h-full text-left font-sans transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,26,53,0.12)]">
      {/* Header */}
      <div className="flex justify-between items-center w-full pb-3 border-b border-[#E8E1D5] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            <i className="fa-solid fa-briefcase" />
          </div>
          <h4 className="text-[13.5px] font-black text-[#071A35] uppercase tracking-wider m-0">{t('Career & Alumni Hub')}</h4>
        </div>
        <button
          onClick={() => navigate('/career')}
          className="bg-transparent border-none text-[11px] font-extrabold text-[#2563EB] hover:text-[#071A35] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>{t('View all')}</span>
          <i className="fa-solid fa-arrow-right text-[10px]" />
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        {threads.map((thread, i) => {
          const repliesCount = thread.replies ? thread.replies.length : 1;
          return (
            <div
              key={i}
              onClick={() => onThreadClick && onThreadClick(thread._id)}
              className="bg-[#F7F4EC] border border-[#E8E1D5] rounded-[1rem] p-3 flex flex-col gap-1 cursor-pointer transition-all hover:translate-x-1 hover:border-[#2563EB]/30 group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${i === 0 ? "bg-[#00c2cb] text-[#071A35]" : "bg-[#DCD9F7] text-[#071A35]"
                  }`}>
                  {i === 0 ? 'MENTORSHIP Q&A' : 'GENERAL'}
                </span>
                <span className="text-[9px] text-[#211A24]/50 font-semibold">7h ago</span>
              </div>

              <div className="text-[12px] font-extrabold text-[#071A35] truncate group-hover:text-[#2563EB] transition-colors mt-0.5">
                {thread.title}
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9.5px] text-[#211A24]/60 font-semibold">
                  {i === 0 ? 'by TechSoft (Lahore)' : 'by Senior Alumni'}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#071A35]">
                  <i className="fa-solid fa-comments text-xs" />
                  <span>{repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}</span>
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
