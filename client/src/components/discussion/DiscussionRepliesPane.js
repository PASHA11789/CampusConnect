import React from "react";
import DiscussionReplyBubble from "./DiscussionReplyBubble";
import { getInitials, getAvatarColor } from "../../utils/helpers";
import { validateImageFileSize } from "../../utils/fileValidation";

const processImageFile = (file, callback) => {
  if (!file) return;
  const val = validateImageFileSize(file);
  if (!val.valid) {
    alert(val.message);
    return;
  }
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.src = evt.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxWidth = 1200;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => callback(evt.target.result);
  };
  reader.readAsDataURL(file);
};

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

  // Image attachment props (FB / IG comment style)
  replyImage = "",
  setReplyImage = () => { },

  // Career-specific action overrides
  onReportThread,
  onReportReply
}) {
  const [showImageInput, setShowImageInput] = React.useState(false);

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

    const getCareerCategoryBadge = (cat) => {
      switch (cat) {
        case "job_opportunity":
          return { label: t("Job Opportunity"), icon: "fa-solid fa-briefcase", bg: "bg-[#00c2cb]/20 text-[#00c2cb] border-[#00c2cb]/40" };
        case "mentorship_qa":
          return { label: t("Mentorship Q&A"), icon: "fa-solid fa-handshake", bg: "bg-purple-400/20 text-purple-300 border-purple-400/30" };
        case "general_discussion":
        default:
          return { label: t("General Discussion"), icon: "fa-solid fa-comments", bg: "bg-[#00c2cb]/20 text-[#00c2cb] border-[#00c2cb]/30" };
      }
    };
    const categoryBadge = getCareerCategoryBadge(activeThread.category);

    return (
      <div className="bg-white rounded-[2rem] flex flex-col h-full relative text-left overflow-hidden border border-slate-100 shadow-2xl font-sans">
        {/* Pane Header - Dark Navy Brand Header */}
        <div className="bg-gradient-to-r from-[#071A35] via-[#0a2342] to-[#0d2a42] p-5 sm:p-6 border-b border-white/10 flex justify-between items-start sticky top-0 z-20 shadow-md">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${categoryBadge.bg}`}>
                <i className={`${categoryBadge.icon} text-[10px]`} />
                <span>{categoryBadge.label}</span>
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight m-0 mb-3.5">
              {activeThread.title}
            </h2>

            <div className="flex items-center gap-3">
              <img
                src={
                  activeThread.author?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`
                }
                alt={authorName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#00c2cb]/60 shadow-sm cursor-pointer hover:scale-105 transition-all"
                onClick={() => onAvatarClick && onAvatarClick(authorId)}
              />
              <div className="flex flex-col">
                <span
                  className="text-xs sm:text-sm font-extrabold text-white cursor-pointer hover:text-[#00c2cb] transition-colors leading-none"
                  onClick={() => onAvatarClick && onAvatarClick(authorId)}
                >
                  {authorName}
                </span>
                <span className="text-[11px] text-white/70 font-semibold mt-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar text-[10px]" />
                  <span>{new Date(activeThread.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </span>
              </div>
            </div>
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
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 shadow-xs text-base font-bold"
                title="Post Actions"
              >
                ⋮
              </button>
              {isThreadDropdownActive && (
                <div className="absolute right-0 top-11 z-30 animate-modal-slide-in">
                  <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden py-1.5 w-[170px] text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown({ type: null, id: null });
                        onAvatarClick && onAvatarClick(authorId);
                      }}
                      className="w-full text-left bg-none border-none px-4 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2.5 transition-all hover:bg-slate-50 text-slate-700"
                    >
                      <i className="fa-solid fa-user text-xs text-slate-500" />
                      <span>{t("View Profile")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown({ type: null, id: null });
                        onReportThread && onReportThread(activeThread._id);
                      }}
                      className="w-full text-left bg-none border-none px-4 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2.5 transition-all hover:bg-red-50 text-red-600 border-t border-slate-100"
                    >
                      <i className="fa-solid fa-shield-halved text-xs text-red-500" />
                      <span>{t("Report Post")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer shadow-xs hover:rotate-90 duration-300 text-sm font-bold"
              title="Close Drawer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Pane Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-[#f8fafc] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
          {/* Thread Content Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {activeThread.content}
            </p>

            {(activeThread.companyLogo || activeThread.image) && (
              <div className="mt-1 rounded-2xl overflow-hidden border border-slate-200/80 w-full max-h-[320px] bg-slate-900/5 shadow-sm">
                <img
                  src={activeThread.companyLogo || activeThread.image}
                  alt={activeThread.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Replies Section */}
          <div className="pt-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <i className="fa-solid fa-comments text-xs" />
                <span>{t("Replies")}</span>
                <span className="bg-[#00c2cb]/15 text-[#0079c2] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border border-[#00c2cb]/20">
                  {activeThread.replies?.length || 0}
                </span>
              </h3>
            </div>

            <div className="flex flex-col gap-3.5 mb-2">
              {activeThread.replies && activeThread.replies.map((reply) => {
                const rAuthorId = reply.author?._id || reply.author;
                const rAuthorName = reply.author?.name || t("Community Member");
                const isRepDropdownActive = activeDropdown.type === 'reply' && activeDropdown.id === reply._id;

                return (
                  <div key={reply._id} className="bg-white hover:bg-slate-50/80 p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs relative transition-all duration-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            reply.author?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthorName)}&background=random`
                          }
                          alt={rAuthorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-85 shrink-0 shadow-2xs"
                          onClick={() => onAvatarClick && onAvatarClick(rAuthorId)}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-xs font-bold text-slate-900 cursor-pointer hover:text-[#00c2cb] transition-colors leading-none"
                            onClick={() => onAvatarClick && onAvatarClick(rAuthorId)}
                          >
                            {rAuthorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-1">
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
                          className="bg-transparent border-none text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                          title="Comment Options"
                        >
                          ⋮
                        </button>
                        {isRepDropdownActive && (
                          <div className="absolute right-0 top-7 z-30 animate-modal-slide-in">
                            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden py-1 w-[160px] text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdown({ type: null, id: null });
                                  onAvatarClick && onAvatarClick(rAuthorId);
                                }}
                                className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-slate-50 text-slate-700"
                              >
                                <i className="fa-solid fa-user text-xs text-slate-500" />
                                <span>{t("View Profile")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdown({ type: null, id: null });
                                  onReportReply && onReportReply(activeThread._id, reply._id);
                                }}
                                className="w-full text-left bg-none border-none px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-red-50 text-red-600 border-t border-slate-100"
                              >
                                <i className="fa-solid fa-shield-halved text-xs text-red-500" />
                                <span>{t("Report Comment")}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-[13px] text-slate-700 pl-10 whitespace-pre-wrap leading-relaxed font-normal">
                      {reply.content}
                    </div>
                  </div>
                );
              })}

              {(!activeThread.replies || activeThread.replies.length === 0) && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400 font-semibold">
                  <i className="fa-solid fa-comments text-2xl text-slate-300 mb-1" />
                  <span className="text-xs text-slate-500 font-bold">{t("No replies yet. Be the first to join the conversation!")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply input form */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white sticky bottom-0 z-20 shadow-[0_-10px_25px_rgba(0,0,0,0.03)] rounded-b-[2rem]">
          <form onSubmit={onReplySubmit} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                alt={user?.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <span className="text-[11px] font-bold text-slate-600">{t("Posting as")} <span className="text-[#071A35] font-extrabold">{user?.name || "You"}</span></span>
            </div>

            <div className="relative flex items-center">
              <textarea
                placeholder={t("Write a response or answer...")}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white focus:ring-4 focus:ring-[#00c2cb]/15 transition-all resize-none pr-[115px] min-h-[64px]"
                rows="2"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !replyContent.trim()}
                className="absolute bottom-3 right-3 bg-gradient-to-r from-[#071A35] to-[#0079c2] hover:from-[#0a2342] hover:to-[#00c2cb] text-white px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
              >
                {isSubmittingReply ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{t("Post Reply")}</span>
                    <i className="fa-solid fa-paper-plane text-[10px]" />
                  </>
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
    <div className={`w-full flex-grow bg-white flex flex-col relative h-full max-h-full min-h-0 overflow-hidden border border-slate-200 lg:rounded-2xl max-lg:rounded-none max-lg:border-x-0 p-3 sm:p-4 lg:p-4.5 min-w-0 ${mobileView === "list" ? "max-lg:hidden" : ""}`}>
      {/* Mobile Back Button Row */}
      <div className="lg:hidden flex items-center w-full mb-2 shrink-0">
        <button
          className="bg-[#071A35] hover:bg-[#0A2246] text-white text-[11.5px] font-black py-1.5 px-3.5 rounded-full cursor-pointer border-none shadow-sm transition-all flex items-center gap-1.5"
          onClick={() => {
            setMobileView("list");
            if (onClose) onClose();
          }}
        >
          <i className="fa-solid fa-arrow-left text-[11px]" />
          <span>{t("Back to list")}</span>
        </button>
      </div>

      {isThreadLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3.5 flex-1 w-full">
          <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
          <p className="text-[13px] text-slate-500 font-medium">{t('Fetching discussion thread...')}</p>
        </div>
      ) : activeThread ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-left w-full">
          {/* MAIN DISCUSSION CARD */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 sm:p-3.5 mb-2.5 flex flex-col gap-2.5 relative shrink-0 w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getCategoryTag(activeThread.title).class}`}>
                  {getCategoryTag(activeThread.title).label}
                </span>
              </div>

              {/* Header Actions: 3-Dots Dropdown & Close Button */}
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    className="bg-none border-none text-[15px] font-bold text-slate-400 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors"
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
                              <i className="fa-solid fa-pen-to-square text-xs text-slate-500" />
                              <span>{t('Edit')}</span>
                            </button>
                            <button
                              type="button"
                              className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-red-50 text-red-600"
                              onClick={() => {
                                setActiveDropdown({ type: null, id: null });
                                onDeleteThread(activeThread._id);
                              }}
                            >
                              <i className="fa-solid fa-trash-can text-xs text-red-500" />
                              <span>{t('Delete')}</span>
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
                            <i className="fa-solid fa-shield-halved text-xs text-slate-500" />
                            <span>{t('Report')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {onClose && (
                  <button
                    type="button"
                    className="bg-slate-200/60 hover:bg-red-50 hover:text-red-500 text-slate-500 w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 border-none shadow-2xs hover:shadow active:scale-95 ml-1"
                    onClick={onClose}
                    title={t("Close Discussion")}
                  >
                    <i className="fa-solid fa-xmark text-xs flex items-center justify-center" />
                  </button>
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
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 rounded-xl bg-[#efeae2] border border-slate-200/60 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-h-0 w-full">
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
                            <div className={`pl-4 flex flex-col gap-2 mt-1 mb-2 w-[85%] ${isParentOwner
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
                    <i className="fa-solid fa-comments text-xl text-slate-400 mb-1" />
                    <p className="text-[12px] text-slate-500 font-medium">{t('No replies yet. Start the conversation!')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reply Form (FB/IG Style Comment Section) */}
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
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>
            )}

            {/* Attached Image Thumbnail Preview Box */}
            {replyImage && (
              <div className="relative mb-2.5 w-fit group">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#00c2cb] shadow-md bg-slate-900/10">
                  <img
                    src={replyImage}
                    alt="Attachment preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setReplyImage("")}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md border-none cursor-pointer transition-transform hover:scale-110"
                  title="Remove Image"
                >
                  <i className="fa-solid fa-xmark text-[9px]" />
                </button>
              </div>
            )}

            {/* Optional Image Upload / Attachment Popup */}
            {showImageInput && (
              <div
                className="flex flex-col gap-2 mb-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm animate-modal-slide-in"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer?.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    processImageFile(file, (imgData) => {
                      setReplyImage(imgData);
                      setShowImageInput(false);
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#0a2342] flex items-center gap-1.5">
                    <i className="fa-solid fa-camera text-xs" /> <span>{t("Attach Photo to Reply")}</span>
                  </span>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold border-none bg-transparent cursor-pointer"
                    onClick={() => setShowImageInput(false)}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("reply-file-input");
                      if (input) input.click();
                    }}
                    className="bg-[#00c2cb] hover:bg-[#071A35] text-slate-950 hover:text-white border-none text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                  >
                    <i className="fa-solid fa-folder-open text-xs" /> <span>{t("Select from Device")}</span>
                  </button>

                  <input
                    id="reply-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processImageFile(file, (imgData) => {
                          setReplyImage(imgData);
                          setShowImageInput(false);
                        });
                      }
                    }}
                  />

                  <input
                    type="url"
                    placeholder={t("Or paste Image URL (https://...)...")}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#00c2cb]"
                    value={replyImage}
                    onChange={(e) => setReplyImage(e.target.value)}
                  />
                </div>
              </div>
            )}

            <form onSubmit={onReplySubmit} className="flex items-center gap-2 w-full">
              <input
                id="reply-input"
                type="text"
                placeholder={replyingTo ? t("Write a reply to comment...") : t("Share your thoughts on this topic...")}
                className="flex-grow bg-white border border-slate-200/90 rounded-xl py-2 px-3.5 text-[12px] font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#071A35] focus:ring-2 focus:ring-[#071A35]/10 h-[42px] transition-all shrink min-w-0"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />

              {/* Camera/Image Attachment Button (FB/IG Comment Style) */}
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`h-[42px] w-[42px] rounded-xl text-sm border border-slate-200/90 transition-all cursor-pointer shrink-0 flex items-center justify-center ${replyImage || showImageInput
                  ? "bg-[#00c2cb]/10 text-[#00c2cb] border-[#00c2cb]/40 font-bold"
                  : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                title={t("Attach photo to reply")}
              >
                <i className="fa-solid fa-camera" />
              </button>

              <button
                type="submit"
                className="h-[42px] bg-[#071A35] hover:bg-[#0A2246] text-white border-none py-1.5 px-5 rounded-xl text-[12px] font-black cursor-pointer transition-all duration-200 shrink-0 active:scale-95 flex items-center justify-center min-w-[75px] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
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
          <div className="w-14 h-14 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center mb-2.5 text-[#00c2cb]">
            <i className="fa-solid fa-comments text-2xl" />
          </div>
          <h4 className="text-[13.5px] font-extrabold text-[#0a2342] mb-1">{t('Select a discussion thread')}</h4>
          <p className="text-[11.5px] text-slate-400 font-medium max-w-[220px]">{t('Choose a topic from the sidebar list to see the full conversation.')}</p>
        </div>
      )}
    </div>
  );
}
