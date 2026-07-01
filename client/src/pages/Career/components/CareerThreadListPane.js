import React from "react";

export default function CareerThreadListPane({ threads, selectedThreadId, onThreadClick, getCategoryLabel }) {
  if (!threads || threads.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-10 text-center">
        <span className="text-[40px] mb-4">📭</span>
        <h3 className="text-[16px] font-bold text-[#0a2342] mb-1">No career paths found</h3>
        <p className="text-[13px] text-slate-500">Be the first to share an opportunity or ask for mentorship!</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto flex flex-col h-full ${selectedThreadId ? "border-r" : ""}`}>
      {threads.map((thread) => (
        <div
          key={thread._id}
          onClick={() => onThreadClick(thread)}
          className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
            selectedThreadId === thread._id ? "bg-slate-50 border-l-4 border-l-[#00c2cb]" : "border-l-4 border-l-transparent"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c2cb] bg-[#00c2cb]/10 px-2 py-0.5 rounded-full">
              {getCategoryLabel(thread.category)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {new Date(thread.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-[14px] font-bold text-[#0a2342] mb-1 line-clamp-2 leading-snug">
            {thread.title}
          </h3>
          <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">
            {thread.content}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src={thread.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.author?.name || "User")}&background=random`}
                alt={thread.author?.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-[11px] font-semibold text-slate-600">
                {thread.author?.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
              <span>💬</span> {thread.replies?.length || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
