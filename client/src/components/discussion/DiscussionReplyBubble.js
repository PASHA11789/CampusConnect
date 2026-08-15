import React from "react";
import { getInitials, getAvatarColor } from "../../utils/helpers";

export default function DiscussionReplyBubble({
  reply,
  user,
  revealedReplies = new Set(),
  onReveal,
  editingReplyId,
  setEditingReplyId,
  editReplyContent,
  setEditReplyContent,
  onEditSave,
  deletingReplyId,
  setDeletingReplyId,
  onDeleteConfirm,
  activeDropdown,
  setActiveDropdown,
  onReport,
  t = (s) => s,
  isChild = false,
  onReplyClick,
  onAvatarClick
}) {
  const replyKey = reply._id;
  const isFlagged = reply.isHidden;
  const isRevealed = revealedReplies.has(replyKey);

  const isReplyOwner = reply.author && (
    (typeof reply.author === 'string' && reply.author === user._id) ||
    (typeof reply.author === 'object' && reply.author._id === user._id)
  );

  const authorName = reply.author?.registeration_number || reply.author?.name || t('Student');
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(authorName);
  const isDropdownActive = activeDropdown.type === 'reply' && activeDropdown.id === replyKey;

  const nameColor = 'text-[#071A35] font-black';
  const metaColor = isReplyOwner ? 'text-[#0079c2]' : 'text-slate-400';
  const dotColor = isReplyOwner ? 'text-[#00c2cb]' : 'text-slate-300';
  const bodyColor = isReplyOwner ? 'text-[#071A35]' : 'text-slate-700';
  const buttonColor = isReplyOwner
    ? 'text-[#0079c2] hover:bg-[#d5f3f6] hover:text-[#071A35]' 
    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700';

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setActiveDropdown(prev =>
      prev.id === replyKey ? { type: null, id: null } : { type: 'reply', id: replyKey }
    );
  };

  const showFallback = !reply.author?.avatar || reply.author?.avatar.includes('ui-avatars.com') || reply.author?.avatar.includes('name=');

  return (
    <div className={`relative flex gap-2.5 py-2 px-3.5 rounded-2xl animate-fade-in border transition-all duration-200 ease-out shadow-2xs ${
      isDropdownActive ? 'z-30' : 'z-10'
    } ${
      isChild
        ? 'w-full'
        : isReplyOwner ? 'self-end max-w-[88%] sm:max-w-[82%] w-fit' : 'self-start max-w-[88%] sm:max-w-[82%] w-fit'
    } ${
      isFlagged 
        ? 'bg-red-50/50 border-red-200 border-l-4 border-l-red-500' 
        : isReplyOwner 
          ? 'bg-[#EAF8F9] border-[#BCEBF0] text-[#071A35] shadow-xs' 
          : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300'
    }`}>
      <div className="flex-1 flex flex-col min-w-0">

        {/* REPLY CARD HEADER */}
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8.5px] shrink-0 overflow-hidden ${onAvatarClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              style={showFallback ? { backgroundColor: avatarColor.bg, color: avatarColor.text } : {}}
              onClick={() => onAvatarClick && reply.author && onAvatarClick(typeof reply.author === 'object' ? reply.author._id : reply.author)}
            >
              {showFallback ? (
                <span>{initials}</span>
              ) : (
                <img src={reply.author.avatar} alt={authorName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className={`flex items-center gap-1 text-[10px] ${metaColor} font-bold`}>
              <span className={`${nameColor} font-extrabold`}>{authorName}</span>
              <span className={dotColor}>•</span>
              <span className="font-medium text-[9.5px]">
                {new Date(reply.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                  ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                }
              </span>
            </div>
          </div>

          {/* DROPDOWN ACTIONS */}
          {(!isFlagged || isReplyOwner) && (
            <div className="relative">
              <button
                type="button"
                className={`bg-none border-none text-[15px] font-bold ${buttonColor} cursor-pointer w-5 h-5 flex items-center justify-center rounded-full`}
                onClick={toggleDropdown}
              >
                ⋮
              </button>
              {isDropdownActive && (
                <div className="absolute right-0 top-7 z-20">
                  <div className="relative z-20 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden py-1 w-[120px]">
                    <>
                      <button
                        type="button"
                        className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-slate-50 text-slate-700"
                        onClick={() => {
                          setActiveDropdown({ type: null, id: null });
                          const targetParentId = reply.parentId || replyKey;
                          onReplyClick(targetParentId, authorName);
                        }}
                      >
                        <i className="fa-solid fa-reply text-xs text-slate-500" />
                        <span>{t('Reply')}</span>
                      </button>
                      {isReplyOwner && (
                        <>
                          <button
                            type="button"
                            className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-slate-50 text-slate-700"
                            onClick={() => {
                              setActiveDropdown({ type: null, id: null });
                              setEditReplyContent(reply.content || "");
                              setDeletingReplyId(null);
                              setEditingReplyId(replyKey);
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
                              setEditingReplyId(null);
                              setDeletingReplyId(replyKey);
                            }}
                          >
                            <i className="fa-solid fa-trash-can text-xs text-red-500" />
                            <span>{t('Delete')}</span>
                          </button>
                        </>
                      )}
                      {!isReplyOwner && (
                        <button
                          type="button"
                          className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-slate-50 text-slate-700"
                          onClick={() => {
                            setActiveDropdown({ type: null, id: null });
                            onReport('reply', replyKey);
                          }}
                        >
                          <i className="fa-solid fa-shield-halved text-xs text-slate-500" />
                          <span>{t('Report')}</span>
                        </button>
                      )}
                    </>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BUBBLE BODY */}
        <div className={`text-[11.5px] ${bodyColor} leading-normal relative`}>
          {editingReplyId === replyKey ? (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full px-3 py-2 text-[12px] text-slate-800 font-medium border border-slate-200 rounded-lg min-h-[64px] focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 bg-white"
                value={editReplyContent}
                onChange={(e) => setEditReplyContent(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="bg-[#0a2342] text-white border-none py-1 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb]"
                  onClick={() => onEditSave(replyKey)}
                >
                  {t('Save')}
                </button>
                <button
                  type="button"
                  className="bg-slate-200 text-slate-600 border-none py-1 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all hover:bg-slate-300"
                  onClick={() => setEditingReplyId(null)}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {isFlagged && !isRevealed ? (
                <div className="flex flex-col items-start gap-1">
                  <p className="whitespace-pre-wrap leading-relaxed select-none filter blur-[5px]">
                    {reply.content}
                  </p>
                </div>
              ) : (
                <>
                  {isFlagged && <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full mb-1.5 uppercase"><i className="fa-solid fa-triangle-exclamation text-[9px]" /> {t('Flagged')}</span>}
                  <p className="whitespace-pre-wrap leading-relaxed">{reply.content}</p>

                  {reply.image && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-[180px] bg-slate-900/5 shadow-xs w-fit max-w-full">
                      <img 
                        src={reply.image} 
                        alt="Reply attachment" 
                        className="w-auto max-w-full h-auto max-h-[180px] object-cover hover:scale-[1.02] transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </>
              )}

              {deletingReplyId === replyKey && (
                <div className="flex items-center gap-2 mt-2 bg-red-50 border border-red-100 p-2 rounded-lg text-[11.5px] font-semibold text-red-700">
                  <span>{t('Delete?')}</span>
                  <button
                    type="button"
                    className="bg-red-600 text-white border-none py-0.5 px-2.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-700"
                    onClick={() => onDeleteConfirm(replyKey)}
                  >
                    {t('Yes')}
                  </button>
                  <button
                    type="button"
                    className="bg-slate-200 text-slate-600 border-none py-0.5 px-2.5 rounded text-[10px] font-bold cursor-pointer hover:bg-slate-300"
                    onClick={() => setDeletingReplyId(null)}
                  >
                    {t('No')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
