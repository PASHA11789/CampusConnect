import React from "react";

export default function ThreadListCard({
  post,
  isSelected,
  onClick,
  formatDate,
  t
}) {
  const authorName = post.author?.registeration_number || post.author?.name || t('Student');
  const relativeTime = formatDate(post.createdAt);

  return (
    <div
      className={`group bg-white border-[1.5px] border-slate-200 border-l-4 border-l-transparent rounded-xl py-3 px-3.5 cursor-pointer flex flex-col gap-[7px] transition-all duration-200 shrink-0 hover:border-[#cbd5e1] hover:border-l-[rgba(0,194,203,0.4)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.05)] hover:translate-x-[2px] ${isSelected ? "bg-[#eef2ff] !border-[#c7d2fe] !border-l-[#818cf8] shadow-[0_2px_8px_rgba(99,102,241,0.12)]" : ""}`}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <h3 className="text-[13px] font-bold text-[#0a2342] leading-[1.35] line-clamp-2">{post.title || t('Untitled Discussion')}</h3>
        <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
          {t('By')} {authorName} • {relativeTime}
        </span>
      </div>

      <div className={`flex items-center transition-colors duration-200 ${isSelected ? "text-[#818cf8]" : "text-slate-400"}`}>
        <svg className="w-[13px] h-[13px] transition-transform duration-200 group-hover:translate-x-[3px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
