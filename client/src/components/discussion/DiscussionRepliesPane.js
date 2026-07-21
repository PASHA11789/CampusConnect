import React from "react";
import DiscussionReplyBubble from "./DiscussionReplyBubble";
import { getInitials, getAvatarColor } from "../../utils/helpers";

export default function DiscussionRepliesPane({
  mobileView,
  setMobileView,
  isThreadLoading,
  activeThread,
  user,
  replyContent,
  setReplyContent,
  isSubmittingReply,
  onReplySubmit,
  revealedReplies = new Set(),
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
  getCategoryTag = (s) => ({ label: "General", class: "" }),
  t = (s) => s,
  onClose,
  replyingTo,
  setReplyingTo,
  onAvatarClick,
  variant = "forum",
  
  // Career-specific action overrides
  onReportThread,
  onReportReply
}) {
  
  React.useEffect(() => {
    if (replyingTo && variant === "forum") {
      const textarea = document.getElementById("reply-textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, [replyingTo, variant]);

  const isThreadOwner = activeThread?.author && (
    (typeof activeThread.author === 'string' && activeThread.author === user._id) ||
    (typeof activeThread.author === 'object' && activeThread.author._id === user._id)
  );

  if (variant === "career") {
    if (!activeThread) return null;

    const isThreadDropdownActive = activeDropdown.type === 'thread' && activeDropdown.id === activeThread._id;
    const authorId = activeThread.author?._id || activeThread.author;
    const authorName = activeThread.author?.name || "Community Member";

    return (
      <div className="bg-white rounded-3xl flex flex-col h-full relative text-left overflow-hidden border-none">
        {/* Header decoration banner */}
        <div className="h-1.5 bg-gradient-to-r from-[#00c2cb] to-[#0079c2] w-full shrink-0" />

        {/* Pane Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    activeThread.author?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`
                  }
                  alt={authorName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => onAvatarClick && onAvatarClick(authorId)}
                />
                <div className="flex flex-col">
                  <span
                    className="text-xs font-bold text-slate-900 leading-none cursor-pointer hover:text-[#00c2cb] transition-colors"
                    onClick={() => onAvatarClick && onAvatarClick(authorId)}
                  >
                    {authorName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-1">
                    {new Date(activeThread.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 mt-2 leading-snug">{activeThread.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Thread Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev.type === 'thread' && prev.id === activeThread._id ? { type: null, id: null } : { type: 'thread', id: activeThread._id });
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer text-sm font-bold border-none"
                title="Post Actions"
              >
                ⋮
              </button>
              {isThreadDropdownActive && (
                <div className="absolute right-0 top-9 z-30 animate-modal-slide-in">
                  <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 w-[160px] text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown({ type: null, id: null });
                        onAvatarClick && onAvatarClick(authorId);
                      }}
                      className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-slate-50 text-slate-700"
                    >
                      <span>👤</span> {t("View Profile")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown({ type: null, id: null });
                        onReportThread && onReportThread(activeThread._id);
                      }}
                      className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-red-50 text-red-600"
                    >
                      <span>🛡️</span> {t("Report Post")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 w-8 h-8 rounded-full flex items-center justify-center transition-all border-none cursor-pointer"
              title="Close Drawer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pane Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {activeThread.content}
            </p>

            {(activeThread.companyLogo || activeThread.image) && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200/80 w-full h-[220px]">
                <img
                  src={activeThread.companyLogo || activeThread.image}
                  alt={activeThread.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("Replies")} ({activeThread.replies?.length || 0})
              </h3>
            </div>

            <div className="flex flex-col gap-3.5 mb-6">
              {activeThread.replies && activeThread.replies.map((reply) => {
                const rAuthorId = reply.author?._id || reply.author;
                const rAuthorName = reply.author?.name || t("Community Member");
                const isRepDropdownActive = activeDropdown.type === 'reply' && activeDropdown.id === reply._id;

                return (
                  <div key={reply._id} className="bg-slate-50/90 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-200/70 relative transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            reply.author?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthorName)}&background=random`
                          }
                          alt={rAuthorName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-85 shrink-0"
                          onClick={() => onAvatarClick && onAvatarClick(rAuthorId)}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-xs font-bold text-slate-900 cursor-pointer hover:text-[#00c2cb] transition-colors"
                            onClick={() => onAvatarClick && onAvatarClick(rAuthorId)}
                          >
                            {rAuthorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(reply.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                              ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Reply 3-Dots Dropdown Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(prev => prev.id === reply._id ? { type: null, id: null } : { type: 'reply', id: reply._id });
                          }}
                          className="bg-transparent border-none text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-full"
                          title="Comment Options"
                        >
                          ⋮
                        </button>
                        {isRepDropdownActive && (
                          <div className="absolute right-0 top-6 z-30 animate-modal-slide-in">
                            <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 w-[150px] text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdown({ type: null, id: null });
                                  onAvatarClick && onAvatarClick(rAuthorId);
                                }}
                                className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-slate-50 text-slate-700"
                              >
                                <span>👤</span> {t("View Profile")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdown({ type: null, id: null });
                                  onReportReply && onReportReply(activeThread._id, reply._id);
                                }}
                                className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-red-50 text-red-600"
                              >
                                <span>🛡️</span> {t("Report Comment")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 pl-9 whitespace-pre-wrap leading-relaxed">
                      {reply.content}
                    </div>
                  </div>
                );
              })}

              {(!activeThread.replies || activeThread.replies.length === 0) && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-1.5">
                  <span className="text-lg">💬</span>
                  <span>{t("No replies yet. Be the first to join the conversation!")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply input form */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 rounded-b-2xl sticky bottom-0">
          <form onSubmit={onReplySubmit} className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <span className="text-xs font-bold text-slate-700">{user?.name || "You"}</span>
            </div>

            <div className="relative flex items-center">
              <textarea
                placeholder={t("Write a response or answer...")}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 resize-none pr-[100px] min-h-[60px]"
                rows="2"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !replyContent.trim()}
                className="absolute bottom-2.5 right-2.5 bg-[#00c2cb] hover:bg-[#00a3ab] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer shadow-xs flex items-center gap-1"
              >
                {isSubmittingReply ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span>{t("Post →")}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Default: forum variant
  const isThreadDropdownActive = activeThread && activeDropdown.type === 'thread' && activeDropdown.id === activeThread._id;

  const authorName = activeThread?.author?.registeration_number || activeThread?.author?.name || t('Student');
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(authorName);
  const showFallback = !activeThread?.author?.avatar || activeThread?.author?.avatar.includes('ui-avatars.com') || activeThread?.author?.avatar.includes('name=');

  return (
    <div className={`flex-grow bg-white flex flex-col relative h-full border border-slate-200 rounded-2xl p-[22px] min-w-0 ${mobileView === "list" ? "max-[900px]:hidden" : ""}`}>
      {/* Header Row */}
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
        <div className="flex-1 flex flex-col h-full overflow-hidden text-left">
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

            {/* Thread author row */}
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

          {/* REPLIES LIST */}
          <div className="max-h-[500px] overflow-y-auto p-4 rounded-xl bg-[#efeae2] border border-slate-200/60 scrollbar-none flex-1">
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
                          <DiscussionReplyBubble
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
                                <DiscussionReplyBubble
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
                                  onAvatarClick={onAvatarClick}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white/40 border-2 border-dashed border-slate-300/40 rounded-xl">
                    <span className="text-[24px] mb-2">💬</span>
                    <p className="text-[12px] text-slate-500 font-medium">{t('No replies yet. Start the conversation!')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mt-4 shrink-0 relative">
            {replyingTo && (
              <div className="flex items-center justify-between bg-[#eef2ff] border border-[#c7d2fe] rounded-lg py-1 px-2.5 mb-2 animate-fade-in">
                <span className="text-[10px] font-bold text-[#4f46e5]">
                  Replying to <span className="underline">{replyingTo.authorName}</span>
                </span>
                <button 
                  type="button" 
                  className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold p-0.5 leading-none" 
                  onClick={() => setReplyingTo(null)}
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={onReplySubmit} className="flex gap-2">
              <textarea
                id="reply-textarea"
                rows="1"
                placeholder={replyingTo ? t("Write a reply to comment...") : t("Share your thoughts on this topic...")}
                className="flex-grow bg-white border border-slate-200/80 rounded-lg py-2 px-3 text-[12px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 resize-none h-[38px] custom-scrollbar"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-[#0a2342] text-white border-none py-1.5 px-4 rounded-lg text-[12px] font-black cursor-pointer transition-all duration-200 shrink-0 hover:bg-[#00c2cb] active:scale-95 flex items-center justify-center min-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingReply || !replyContent.trim()}
              >
                {isSubmittingReply ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  t('Reply')
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-slate-350">
          <span className="text-[44px] mb-2.5">💬</span>
          <h4 className="text-[13.5px] font-extrabold text-[#0a2342] mb-1">{t('Select a discussion thread')}</h4>
          <p className="text-[11.5px] text-slate-400 font-medium max-w-[220px]">{t('Choose a topic from the sidebar list to see the full conversation.')}</p>
        </div>
      )}
    </div>
  );
}
