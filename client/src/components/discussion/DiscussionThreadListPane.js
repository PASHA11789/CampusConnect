import React from "react";
import DiscussionThreadListCard from "./DiscussionThreadListCard";

export default function DiscussionThreadListPane({
  mobileView,
  filteredThreads,
  selectedThreadId,
  onThreadClick,
  setMobileView,
  onStartDiscussion,
  getCategoryTag,
  formatDate,
  t = (s) => s,
  currentPage,
  totalPages,
  onPageChange,
  onAvatarClick,
  variant = "forum",
  getCategoryLabel,
  // Forwarded straight to each card so the Forum page owns bookmark state.
  showBookmark = false,
  bookmarkedIds = {},
  onBookmarkToggle,
  onBookmarkError
}) {
  if (variant === "career") {
    if (!filteredThreads || filteredThreads.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <i className="fa-solid fa-inbox text-2xl" />
          </div>
          <h3 className="text-[16px] font-bold text-[#0a2342] mb-1">{t("No career paths found")}</h3>
          <p className="text-[13px] text-slate-500">{t("Be the first to share an opportunity or ask for mentorship!")}</p>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto flex flex-col h-full ${selectedThreadId ? "border-r" : ""}`}>
        {filteredThreads.map((thread) => (
          <DiscussionThreadListCard
            key={thread._id}
            post={thread}
            isSelected={selectedThreadId === thread._id}
            onClick={() => onThreadClick(thread)}
            formatDate={formatDate}
            t={t}
            onAvatarClick={onAvatarClick}
            variant="career"
            getCategoryLabel={getCategoryLabel}
          />
        ))}
      </div>
    );
  }

  // Smart height-balanced masonry distribution (eliminates all empty white space)
  const renderGridItems = () => {
    if (!filteredThreads || filteredThreads.length === 0) return null;

    if (selectedThreadId) {
      // In split detail view, render simple vertical list
      return filteredThreads.map((post) => (
        <div key={post._id} className="w-full">
          <DiscussionThreadListCard
            post={post}
            isSelected={selectedThreadId === post._id}
            onClick={() => {
              onThreadClick(post._id);
              setMobileView("detail");
            }}
            formatDate={formatDate}
            t={t}
            onAvatarClick={onAvatarClick}
            variant="forum"
            showBookmark={showBookmark}
            isBookmarked={!!bookmarkedIds[post._id]}
            onBookmarkToggle={onBookmarkToggle}
            onBookmarkError={onBookmarkError}
          />
        </div>
      ));
    }

    // Full 2-column Grid mode with dynamic height-balanced masonry distribution
    const col1 = [];
    const col2 = [];
    let height1 = 0;
    let height2 = 0;

    filteredThreads.forEach((post) => {
      // Estimate height: image card is ~310px, text card is ~150px
      const cardHeight = post.image ? 310 : 150;

      const cardNode = (
        <DiscussionThreadListCard
          key={post._id}
          post={post}
          isSelected={selectedThreadId === post._id}
          onClick={() => {
            onThreadClick(post._id);
            setMobileView("detail");
          }}
          formatDate={formatDate}
          t={t}
          onAvatarClick={onAvatarClick}
          variant="forum"
          showBookmark={showBookmark}
          isBookmarked={!!bookmarkedIds[post._id]}
          onBookmarkToggle={onBookmarkToggle}
          onBookmarkError={onBookmarkError}
        />
      );

      if (height1 <= height2) {
        col1.push(cardNode);
        height1 += cardHeight;
      } else {
        col2.push(cardNode);
        height2 += cardHeight;
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 items-start w-full col-span-full">
        <div className="flex flex-col gap-6 sm:gap-7 w-full">
          {col1}
        </div>
        <div className="flex flex-col gap-6 sm:gap-7 w-full">
          {col2}
        </div>
      </div>
    );
  };

  // Default: forum variant
  return (
    <div className={`w-full flex flex-col gap-4 self-start h-full ${selectedThreadId ? "overflow-y-auto scrollbar-none" : ""} ${mobileView === "detail" && selectedThreadId ? "max-lg:hidden" : ""}`}>
      {filteredThreads && filteredThreads.length > 0 ? (
        selectedThreadId ? (
          <div className="flex flex-col gap-3">
            {renderGridItems()}
          </div>
        ) : (
          renderGridItems()
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white border-2 border-dashed border-[#E8E1D5] rounded-2xl w-full col-span-full shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center mb-2.5 text-[#00c2cb]">
            <i className="fa-solid fa-comments text-2xl" />
          </div>
          <h3 className="text-[14.5px] font-black text-[#071A35] mb-1">{t("No discussions found")}</h3>
          <p className="text-[12px] text-slate-500 font-medium max-w-[280px]">{t("Be the first to share an idea or start a conversation with fellow students!")}</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center py-2.5 px-1 border-t border-slate-200 mt-2.5">
          <button 
            className="bg-white border-[1.5px] border-slate-200 text-slate-500 font-bold text-[11.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:enabled:bg-slate-50 hover:enabled:text-[#0a2342] hover:enabled:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
          >
            <i className="fa-solid fa-arrow-left text-[10px]" />
            <span>{t('Prev')}</span>
          </button>
          <span className="text-[12px] font-bold text-slate-500">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="bg-white border-[1.5px] border-slate-200 text-slate-500 font-bold text-[11.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:enabled:bg-slate-50 hover:enabled:text-[#0a2342] hover:enabled:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
          >
            <span>{t('Next')}</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
}
