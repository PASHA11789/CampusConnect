import React from "react";

export default function DiscussionThreadListCard({
  post,
  isSelected,
  onClick,
  formatDate,
  t = (s) => s,
  onAvatarClick,
  variant = "forum",
  getCategoryLabel = (s) => s
}) {
  const authorName = post.author?.registeration_number || post.author?.name || t('Student');
  
  if (variant === "career") {
    return (
      <div
        onClick={onClick}
        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 text-left ${
          isSelected ? "bg-slate-50 border-l-4 border-l-[#00c2cb]" : "border-l-4 border-l-transparent"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c2cb] bg-[#00c2cb]/10 px-2 py-0.5 rounded-full">
            {getCategoryLabel(post.category)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-[14px] font-bold text-[#0a2342] mb-1 line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">
          {post.content}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "User")}&background=random`}
              alt={post.author?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-[11px] font-semibold text-slate-600">
              {post.author?.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
            <span>💬</span> {post.replies?.length || 0}
          </div>
        </div>
      </div>
    );
  }

  // Default: forum variant
  const relativeTime = formatDate(post.createdAt);
  return (
    <div
      className={`group bg-white border-[1.5px] border-slate-200 border-l-4 border-l-transparent rounded-xl py-3 px-3.5 cursor-pointer flex flex-col gap-[7px] transition-all duration-200 shrink-0 hover:border-[#cbd5e1] hover:border-l-[rgba(0,194,203,0.4)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.05)] hover:translate-x-[2px] ${
        isSelected ? "bg-[#eef2ff] !border-[#c7d2fe] !border-l-[#818cf8] shadow-[0_2px_8px_rgba(99,102,241,0.12)]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col text-left">
        <h3 className="text-[13px] font-bold text-[#0a2342] leading-[1.35] line-clamp-2">
          {post.title || t('Untitled Discussion')}
        </h3>
        <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
          {t('By')}{" "}
          <span 
            className="hover:text-[#00c2cb] hover:underline cursor-pointer transition-colors"
            onClick={(e) => {
              if (onAvatarClick && post.author) {
                e.stopPropagation();
                onAvatarClick(typeof post.author === 'object' ? post.author._id : post.author);
              }
            }}
          >
            {authorName}
          </span>{" "}
          • {relativeTime}
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
