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
        className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 hover:border-l-[#071A35] text-left ${
          isSelected ? "bg-slate-50 border-l-4 border-l-[#071A35]" : "border-l-4 border-l-transparent"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#071A35] bg-[#071A35]/10 px-2 py-0.5 rounded-full">
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
  const relativeTime = formatDate ? formatDate(post.createdAt) : new Date(post.createdAt).toLocaleDateString();
  const categoryTag = getCategoryLabel && typeof getCategoryLabel === 'function' ? { label: getCategoryLabel(post.category), class: 'bg-[#071A35]/10 text-[#071A35] border-[#071A35]/20' } : { label: post.category || "General", class: "bg-slate-100 text-slate-700 border-slate-200" };
  const repliesCount = post.replies ? post.replies.length : (post.repliesCount || 0);
  const hasImage = !!post.image;

  return (
    <div
      className={`group bg-white border border-[#E8E1D5] rounded-2xl p-4 sm:p-4.5 cursor-pointer flex flex-col justify-between gap-3 transition-all duration-300 relative overflow-hidden shadow-[0_4px_16px_rgba(7,26,53,0.03)] hover:shadow-[0_10px_24px_rgba(7,26,53,0.08)] hover:-translate-y-1 hover:border-[#00c2cb]/40 ${
        isSelected ? "bg-[#FAF7F0] !border-[#00c2cb] border-l-4 !border-l-[#00c2cb] shadow-md" : "border-l-4 border-l-transparent hover:border-l-[#00c2cb]"
      }`}
      onClick={onClick}
    >
      {/* Header: Author info & Category Badge */}
      <div className="flex items-center justify-between gap-2 text-left">
        <div 
          className="flex items-center gap-2 cursor-pointer group/avatar"
          onClick={(e) => {
            if (onAvatarClick && post.author) {
              e.stopPropagation();
              onAvatarClick(typeof post.author === 'object' ? post.author._id : post.author);
            }
          }}
        >
          <img
            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=071A35&color=fff`}
            alt={authorName}
            className="w-7 h-7 rounded-full object-cover border border-[#071A35]/10 shadow-xs group-hover/avatar:scale-105 transition-transform"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[11.5px] font-bold text-[#071A35] group-hover/avatar:text-[#00c2cb] transition-colors line-clamp-1">
              {authorName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {relativeTime}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/15 shrink-0">
          {categoryTag.label || 'General'}
        </span>
      </div>

      {/* Body: Title & Content snippet */}
      <div className="flex flex-col gap-1 text-left flex-1">
        <h3 className="text-[14px] font-extrabold text-[#071A35] leading-snug group-hover:text-[#00c2cb] transition-colors line-clamp-2">
          {post.title || t('Untitled Discussion')}
        </h3>

        {post.content && (
          <p className="text-[11.5px] font-medium text-slate-500 line-clamp-2 leading-relaxed m-0">
            {post.content}
          </p>
        )}

        {/* Tag Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {post.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="text-[10px] font-bold text-[#00c2cb] bg-[#00c2cb]/10 hover:bg-[#00c2cb] hover:text-white px-2 py-0.5 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (post.onTagClick) post.onTagClick(tag);
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Compact Image Banner for Image Cards */}
      {hasImage && (
        <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900/5 my-0.5 relative group-hover:shadow-inner">
          <img
            src={post.image}
            alt="Attachment"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Footer: Replies count & Join Discussion action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-left mt-auto">
        <div className="flex items-center gap-1.5 bg-slate-100/80 group-hover:bg-[#00c2cb]/10 px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-slate-600 group-hover:text-[#00c2cb] transition-colors">
          <span>💬</span>
          <span>{repliesCount} {repliesCount === 1 ? t('reply') : t('replies')}</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#071A35] group-hover:text-[#00c2cb] transition-colors">
          <span>{t('View Topic')}</span>
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
