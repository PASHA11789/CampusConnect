import React from 'react';

export const ForumsWidget = ({ forums = [], onThreadClick, onCreateClick }) => {
  const formatDate = (date) => {
    if (!date) return 'some time ago';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

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

  const isRecent = (date) => {
    if (!date) return false;
    const diff = new Date() - new Date(date);
    return diff < 86400000; // 24 hours
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] h-full">
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-[#0a2342]">Student Forums</h3>
          <p className="text-[11px] text-slate-500 mt-[2px] font-semibold">Engage, ask, and share with fellow classmates</p>
        </div>
        <a href="/forum" className="text-[12px] text-[#00c2cb] no-underline font-semibold transition-all duration-200 hover:opacity-70 hover:translate-x-[3px]">View all →</a>
      </div>

      <div className="flex-1 overflow-y-auto max-h-full pr-1 overflow-x-hidden">
        {forums && forums.length > 0 ? forums.map((post, i) => {
          const category = getCategoryTag(post.title);

          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 cursor-pointer relative transition-all duration-200 ease-out hover:translate-x-1 [&:last-child]:border-b-0 group" onClick={() => onThreadClick && onThreadClick(post._id)}>
              <div className="relative w-9 h-9 shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]" style={{ background: 'linear-gradient(135deg, #00c2cb, #0a2342)', color: '#ffffff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                {isRecent(post.createdAt) && (
                  <span className="absolute bottom-0 right-0 w-[9px] h-[9px] bg-emerald-500 border-[1.5px] border-white rounded-full">
                    <span className="absolute inset-[-1.5px] border-[1.5px] border-emerald-500 rounded-full animate-ping opacity-75"></span>
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${category.class}`}>{category.label}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{formatDate(post.createdAt)}</span>
                </div>
                <div className="text-[13.5px] font-bold text-[#0a2342] mb-1 truncate">{post.title || 'Untitled Discussion'}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">by Student</span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#00c2cb] bg-[#00c2cb]/8 px-1.5 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{post.repliesCount || 0} {post.repliesCount === 1 ? 'reply' : 'replies'}</span>
                  </div>
                </div>
              </div>
              <div className="w-4.5 h-4.5 flex items-center justify-center text-slate-300 opacity-50 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-[3px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
            <span className="text-[32px] mb-3 opacity-70">💬</span>
            <p className="text-[13px] text-slate-500 mb-4 font-semibold">No active discussions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumsWidget;

