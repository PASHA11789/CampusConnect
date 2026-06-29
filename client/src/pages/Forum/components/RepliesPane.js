import React from "react";
import ReplyBubble from "./ReplyBubble";

const getAvatarColor = (name) => {
  const colors = [
    { bg: '#e0f2fe', text: '#0369a1' }, // Blue
    { bg: '#dcfce7', text: '#15803d' }, // Green
    { bg: '#ffedd5', text: '#c2410c' }, // Orange
    { bg: '#f3e8ff', text: '#6b21a8' }, // Purple
    { bg: '#fce7f3', text: '#be185d' }, // Pink
    { bg: '#e0f7fa', text: '#006064' }, // Teal
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export default function RepliesPane({
  mobileView,
  setMobileView,
  isThreadLoading,
  activeThread,
  user,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  onReplySubmit,
  revealedReplies,
  onRevealReply,
  editingReplyId,
  setEditingReplyId,
  editReplyContent,
  setEditReplyContent,
  onUpdateReply,
  deletingReplyId,
  setDeletingReplyId,
  onDeleteReply,
  activeDropdown,
  setActiveDropdown,
  onEditThread,
  onDeleteThread,
  onReportContent,
  formatDate,
  getCategoryTag,
  t,
  onClose,
  replyingTo,
  setReplyingTo,
  onAvatarClick
}) {
  React.useEffect(() => {
    if (replyingTo) {
      const textarea = document.getElementById("reply-textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, [replyingTo]);
  const isThreadOwner = activeThread?.author && (
    (typeof activeThread.author === 'string' && activeThread.author === user._id) ||
    (typeof activeThread.author === 'object' && activeThread.author._id === user._id)
  );

  const isThreadDropdownActive = activeThread && activeDropdown.type === 'thread' && activeDropdown.id === activeThread._id;

  const authorName = activeThread?.author?.registeration_number || activeThread?.author?.name || t('Student');
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(authorName);
  const showFallback = !activeThread?.author?.avatar || activeThread?.author?.avatar.includes('ui-avatars.com') || activeThread?.author?.avatar.includes('name=');

  return (
    <div className={`flex-grow bg-white flex flex-col relative h-full border border-slate-200 rounded-2xl p-[22px] min-w-0 ${mobileView === "list" ? "max-[900px]:hidden" : ""}`}>
      {/* Header Row with Back button (for mobile) and Close button (for desktop/split toggle) */}
      <div className="flex items-center w-full mb-3 shrink-0">
        {mobileView === "detail" && (
          <button className="hidden max-[900px]:block bg-slate-100 hover:bg-slate-200 border-none text-[#0a2342] text-[12px] font-bold py-1.5 px-3 rounded-lg cursor-pointer" onClick={() => setMobileView("list")}>
            ← {t("Back to list")}
          </button>
        )}
        {onClose && (
          <button 
            type="button"
            className="ml-auto bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 border-none shadow-sm hover:shadow active:scale-95" 
            onClick={onClose}
            title={t("Close Discussion")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isThreadLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3.5 flex-1">
          <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
          <p className="text-[13px] text-slate-500 font-medium">{t('Fetching discussion thread...')}</p>
        </div>
      ) : activeThread ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* MAIN DISCUSSION CARD */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mb-4 flex flex-col gap-3 relative shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getCategoryTag(activeThread.title).class}`}>
                  {getCategoryTag(activeThread.title).label}
                </span>
              </div>

              {/* Dropdown for main discussion card */}
              <div className="relative">
                <button
                  type="button"
                  className="bg-none border-none text-[16px] font-bold text-slate-400 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 hover:text-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(prev =>
                      prev.id === activeThread._id ? { type: null, id: null } : { type: 'thread', id: activeThread._id }
                    );
                  }}
                >
                  ⋮
                </button>
                {isThreadDropdownActive && (
                  <div className="absolute right-0 top-7 z-20">
                    <div className="relative z-20 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden py-1 w-[120px]">
                      {isThreadOwner ? (
                        <>
                          <button
                            type="button"
                            className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-slate-50 text-slate-700"
                            onClick={() => {
                              setActiveDropdown({ type: null, id: null });
                              onEditThread(activeThread);
                            }}
                          >
                            ✏️ {t('Edit')}
                          </button>
                          <button
                            type="button"
                            className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-red-50 text-red-600"
                            onClick={() => {
                              setActiveDropdown({ type: null, id: null });
                              onDeleteThread(activeThread._id);
                            }}
                          >
                            🗑️ {t('Delete')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-slate-50 text-slate-700"
                          onClick={() => {
                            setActiveDropdown({ type: null, id: null });
                            onReportContent('thread', activeThread._id);
                          }}
                        >
                          🛡️ {t('Report')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex">
              <h2 className="text-[17px] font-extrabold text-[#0a2342] leading-snug">{activeThread.title}</h2>
            </div>

            <div className="text-[13.5px] text-slate-600 leading-relaxed whitespace-pre-wrap">
              {activeThread.content}
            </div>

            {/* Thread author row at the bottom of the card */}
            <div className="flex items-center gap-2.5 mt-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                style={showFallback ? { backgroundColor: avatarColor.bg, color: avatarColor.text } : {}}
                onClick={() => onAvatarClick && activeThread.author && onAvatarClick(typeof activeThread.author === 'object' ? activeThread.author._id : activeThread.author)}
              >
                {showFallback ? (
                  <span>{initials}</span>
                ) : (
                  <img src={activeThread.author.avatar} alt={authorName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                <span className="text-slate-600 font-bold">{authorName}</span>
                <span className="text-slate-200">•</span>
                <span className="text-slate-400 font-medium">{formatDate(activeThread.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* REPLIES LIST CONTAINER (SCROLLABLE UNDERNEATH) */}
          <div className="max-h-[500px] overflow-y-auto p-4 rounded-xl bg-[#efeae2] border border-slate-200/60 scrollbar-none">
            <div className="flex flex-col gap-3">
              <h5 className="text-[13.5px] font-extrabold text-[#0a2342] border-b border-slate-300/30 pb-2">
                {t('Replies')} ({activeThread.replies ? activeThread.replies.filter(r => !r.isHidden).length : 0})
              </h5>

              <div className="flex flex-col gap-3.5">
                {activeThread.replies && activeThread.replies.length > 0 ? (
                  (() => {
                    const replies = activeThread.replies;
                    const topLevelReplies = replies.filter(r => !r.parentId || !replies.some(p => p._id === r.parentId));
                    const childReplies = replies.filter(r => r.parentId && replies.some(p => p._id === r.parentId));

                    return topLevelReplies.map((reply, i) => {
                      const children = childReplies.filter(c => c.parentId === reply._id);
                      const isParentOwner = reply.author && (
                        (typeof reply.author === 'string' && reply.author === user._id) ||
                        (typeof reply.author === 'object' && reply.author._id === user._id)
                      );
                      return (
                        <div key={reply._id || i} className="flex flex-col gap-1.5 w-full">
                          <ReplyBubble
                            reply={reply}
                            user={user}
                            revealedReplies={revealedReplies}
                            onReveal={onRevealReply}
                            editingReplyId={editingReplyId}
                            setEditingReplyId={setEditingReplyId}
                            editReplyContent={editReplyContent}
                            setEditReplyContent={setEditReplyContent}
                            onEditSave={onUpdateReply}
                            deletingReplyId={deletingReplyId}
                            setDeletingReplyId={setDeletingReplyId}
                            onDeleteConfirm={onDeleteReply}
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                            onReport={onReportContent}
                            t={t}
                            onReplyClick={(replyId, authorName) => setReplyingTo({ replyId, authorName })}
                            onAvatarClick={onAvatarClick}
                          />
                          {children.length > 0 && (
                            <div className={`pl-4 flex flex-col gap-2 mt-1 mb-2 w-[85%] ${
                              isParentOwner 
                                ? 'self-end ml-14 mr-2 border-l-2 border-[#1a5269]/40' 
                                : 'self-start ml-8 mr-14 border-l-2 border-slate-300'
                            }`}>
                              {children.map((child, idx) => (
                                <ReplyBubble
                                  key={child._id || idx}
                                  reply={child}
                                  isChild={true}
                                  user={user}
                                  revealedReplies={revealedReplies}
                                  onReveal={onRevealReply}
                                  editingReplyId={editingReplyId}
                                  setEditingReplyId={setEditingReplyId}
                                  editReplyContent={editReplyContent}
                                  setEditReplyContent={setEditReplyContent}
                                  onEditSave={onUpdateReply}
                                  deletingReplyId={deletingReplyId}
                                  setDeletingReplyId={setDeletingReplyId}
                                  onDeleteConfirm={onDeleteReply}
                                  activeDropdown={activeDropdown}
                                  setActiveDropdown={setActiveDropdown}
                                  onReport={onReportContent}
                                  t={t}
                                  onReplyClick={(replyId, authorName) => setReplyingTo({ replyId, authorName })}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()
                ) : (
                  <p className="text-center py-8 text-[12.5px] text-slate-400 font-medium border-[1.5px] border-dashed border-slate-200 rounded-lg bg-slate-50">{t('No replies yet. Be the first to join the conversation!')}</p>
                )}
              </div>
            </div>
          </div>

          {/* WRITE REPLY INPUT AREA */}
          <div className="mt-4 border-t border-slate-100 pt-3.5 flex flex-col gap-2 shrink-0">
            {replyingTo && (
              <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-4.5 py-2 text-[11.5px] font-semibold text-slate-600 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#00c2cb] text-[13px] font-bold">↪</span>
                  <span>{t("Replying to")} <strong className="text-[#0a2342]">@{replyingTo.authorName}</strong></span>
                </div>
                <button
                  type="button"
                  className="bg-none border-none text-slate-400 hover:text-red-500 font-bold text-[14px] cursor-pointer transition-colors"
                  onClick={() => setReplyingTo(null)}
                  title={t("Cancel reply")}
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={onReplySubmit} className="flex items-center gap-3 w-full">
              <textarea
                id="reply-textarea"
                placeholder={t("Write your response...")}
                className="flex-1 px-5 py-2.5 text-[13px] border-[1.5px] border-slate-200 rounded-full text-[#0a2342] font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:shadow-[0_0_0_3px_rgba(0,194,203,0.1)] h-11 min-h-[44px] max-h-[44px] bg-slate-50 resize-none leading-normal overflow-hidden scrollbar-none"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows={1}
                spellCheck={false}
                data-gramm={false}
                data-enable-grammarly={false}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onReplySubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-full bg-[#00c2cb] text-white border-none flex items-center justify-center shrink-0 cursor-pointer transition-all duration-250 hover:bg-[#00b2bb] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_3px_10px_rgba(0,194,203,0.2)]"
                disabled={isSubmittingReply || !replyContent.trim()}
                title={t("Post Reply")}
              >
                {isSubmittingReply ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 translate-x-[1px] -translate-y-[0.5px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2 h-full">
          <div className="text-[48px] opacity-40 mb-2">💬</div>
          <h3 className="text-[15px] font-bold text-[#0a2342]">{t('No discussion selected')}</h3>
          <p className="text-[12px] text-slate-400 font-medium max-w-[280px] leading-relaxed">{t('Select a topic from the left sidebar to view the full discussion, read comments, and share your thoughts.')}</p>
        </div>
      )}
    </div>
  );
}
