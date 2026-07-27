import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export const ForumsWidget = ({ forums = [], onThreadClick }) => {
  const navigate = useNavigate();

  const getCategoryTag = (title) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("exam") || lower.includes("study") || lower.includes("course") || lower.includes("assignment") || lower.includes("class")) {
      return { label: "Academics", class: "bg-indigo-500/10 text-indigo-600" };
    }
    if (lower.includes("coding") || lower.includes("tech") || lower.includes("web") || lower.includes("software") || lower.includes("computer")) {
      return { label: "Tech Hub", class: "bg-sky-500/10 text-sky-600" };
    }
    if (lower.includes("canteen") || lower.includes("sports") || lower.includes("match") || lower.includes("play") || lower.includes("game")) {
      return { label: "Campus Life", class: "bg-amber-500/10 text-amber-600" };
    }
    if (lower.includes("help") || lower.includes("question") || lower.includes("how") || lower.includes("need")) {
      return { label: "Q & A", class: "bg-pink-500/10 text-pink-600" };
    }
    return { label: "General", class: "bg-emerald-500/10 text-emerald-600" };
  };

  return (
    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-6 flex flex-col justify-between shadow-[0_10px_35px_rgba(7,26,53,0.05)] h-full text-left font-sans transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,26,53,0.12)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-black text-[#071A35] uppercase tracking-wider m-0">Student Forums</h3>
          <p className="text-[10px] text-[#211A24]/60 mt-0.5 font-semibold">Engage, ask, and share with fellow classmates</p>
        </div>
        <Link to="/forum" className="bg-[#FAF7F0] border border-[#E8E1D5] hover:bg-[#F3EEE4] text-[#071A35] text-[11px] font-extrabold px-3 py-1 rounded-full transition-all duration-200 cursor-pointer no-underline shrink-0 flex items-center gap-1 shadow-sm">
          View all ➔
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto max-h-full pr-1 overflow-x-hidden my-2">
        {forums && forums.length > 0 ? forums.map((post, i) => {
          const category = getCategoryTag(post.title);

          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[#E8E1D5]/60 cursor-pointer relative transition-all duration-200 ease-out hover:translate-x-1 [&:last-child]:border-b-0 group" onClick={() => onThreadClick && onThreadClick(post._id)}>
              <div className="relative w-9 h-9 shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm border border-[#F5B82E]/30" style={{ background: 'linear-gradient(135deg, #071A35, #102A4A)', color: '#F5B82E' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${category.class}`}>{category.label}</span>
                  <span className="text-[9.5px] text-[#211A24]/50 font-semibold">{formatDate(post.createdAt)}</span>
                </div>
                <div className="text-[13px] font-bold text-[#071A35] mb-1 truncate">{post.title || 'Untitled Discussion'}</div>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-[#DCD9F7]/50 text-[#071A35] flex items-center justify-center text-xl mb-3 shadow-inner">
              💬
            </div>
            <p className="text-[13px] font-extrabold text-[#071A35] mb-1 m-0">No active discussions found</p>
            <p className="text-[10px] text-[#211A24]/60 font-semibold max-w-[200px] leading-relaxed">
              Be the first to start a general discussion or ask a question!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Button matching Screenshot #3 */}
      <button 
        onClick={() => navigate('/forum', { state: { openModal: true } })}
        className="mt-3 w-full bg-[#DCD9F7] hover:bg-[#D0CBF5] text-[#071A35] py-2.5 rounded-full text-[12px] font-extrabold transition-all border-none cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>+</span> Start a Discussion
      </button>
    </div>
  );
};

export default ForumsWidget;
