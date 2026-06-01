import React from "react";
import ThreadListCard from "./ThreadListCard";

export default function ThreadListPane({
  mobileView,
  filteredThreads,
  selectedThreadId,
  onThreadClick,
  setMobileView,
  onStartDiscussion,
  getCategoryTag,
  formatDate,
  t,
  currentPage,
  totalPages,
  onPageChange
}) {
  return (
    <div className={`w-full flex flex-col gap-3 self-start ${mobileView === "detail" ? "max-[768px]:hidden" : ""}`}>
      <button 
        className="bg-gradient-to-br from-[#00c2cb] to-[#0a2342] text-white border-none py-2.5 px-4.5 rounded-[10px] text-[13px] font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(0,194,203,0.25)] transition-all duration-250 shrink-0 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,194,203,0.35)]" 
        onClick={onStartDiscussion}
      >
        <span className="text-[16px] font-black">+</span> {t("Start Discussion")}
      </button>

      <div className="flex flex-col gap-2.5">
        {filteredThreads.length > 0 ? (
          filteredThreads.map((post) => (
            <ThreadListCard
              key={post._id}
              post={post}
              isSelected={selectedThreadId === post._id}
              onClick={() => {
                onThreadClick(post._id);
                setMobileView("detail");
              }}
              getCategoryTag={getCategoryTag}
              formatDate={formatDate}
              t={t}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white border-2 border-dashed border-slate-300 rounded-xl">
            <span className="text-[28px] mb-2.5">💬</span>
            <h3 className="text-[13px] font-extrabold text-[#0a2342] mb-1">{t("No discussions found")}</h3>
            <p className="text-[11.5px] text-slate-500">{t("Be the first to share an idea!")}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center py-2.5 px-1 border-t border-slate-200 mt-2.5">
          <button 
            className="bg-white border-[1.5px] border-slate-200 text-slate-500 font-bold text-[11.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1 hover:enabled:bg-slate-50 hover:enabled:text-[#0a2342] hover:enabled:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
          >
            ← {t('Prev')}
          </button>
          <span className="text-[12px] font-bold text-slate-500">
            {currentPage} / {totalPages}
          </span>
          <button 
            className="bg-white border-[1.5px] border-slate-200 text-slate-500 font-bold text-[11.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1 hover:enabled:bg-slate-50 hover:enabled:text-[#0a2342] hover:enabled:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
          >
            {t('Next')} →
          </button>
        </div>
      )}
    </div>
  );
}
