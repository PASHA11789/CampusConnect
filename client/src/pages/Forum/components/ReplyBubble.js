import React from "react";

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

export default function ReplyBubble({
  reply,
  user,
  revealedReplies,
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
  t,
  isChild = false,
  onReplyClick
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

  const isDark = isReplyOwner && !isFlagged;
  const nameColor = isDark ? 'text-white' : 'text-slate-600';
  const metaColor = isDark ? 'text-[#a2d4ec]' : 'text-slate-400';
  const dotColor = isDark ? 'text-[#5f97b0]' : 'text-slate-200';
  const bodyColor = isDark ? 'text-white' : 'text-slate-600';
  const buttonColor = isDark 
    ? 'text-[#a2d4ec] hover:bg-[#113e51] hover:text-white' 
    : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700';

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setActiveDropdown(prev =>
      prev.id === replyKey ? { type: null, id: null } : { type: 'reply', id: replyKey }
    );
  };

  const showFallback = !reply.author?.avatar || reply.author?.avatar.includes('ui-avatars.com') || reply.author?.avatar.includes('name=');

  return (
    <div className={`relative flex gap-2 py-1.5 px-2.5 rounded-lg animate-fade-in border transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.05)] ${
      isDropdownActive ? 'z-30' : 'z-10'
    } ${
      isChild
        ? 'w-full'
        : isReplyOwner ? 'self-end ml-10 max-w-[85%] w-fit' : 'self-start mr-10 max-w-[85%] w-fit'
    } ${
      isFlagged 
        ? 'bg-slate-50 border-slate-200 border-l-4 border-l-red-500 hover:border-slate-300' 
        : isReplyOwner 
          ? 'bg-[#1a5269] border-[#113e51] hover:border-[#0f3444]' 
          : 'bg-white border-slate-200/70 hover:border-slate-300'
    }`}>
      <div className="flex-1 flex flex-col min-w-0">

        {/* REPLY CARD HEADER */}
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9.5px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] shrink-0 overflow-hidden"
              style={showFallback ? { backgroundColor: avatarColor.bg, color: avatarColor.text } : {}}
            >
              {showFallback ? (
                <span>{initials}</span>
              ) : (
                <img src={reply.author.avatar} alt={authorName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className={`flex items-center gap-1 text-[10.5px] ${metaColor} font-semibold`}>
              <span className={`${nameColor} font-bold`}>{authorName}</span>
              <span className={dotColor}>•</span>
              <span className="font-medium">
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
                        💬 {t('Reply')}
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
                            ✏️ {t('Edit')}
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
                            🗑️ {t('Delete')}
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
                          🛡️ {t('Report')}
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
                <p className="whitespace-pre-wrap leading-relaxed select-none filter blur-[5px]">
                  {reply.content}
                </p>
              ) : (
                <>
                  {isFlagged && <span className="inline-block text-[9.5px] font-extrabold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full mb-1.5 uppercase">⚠️ {t('Flagged')}</span>}
                  <p className="whitespace-pre-wrap leading-relaxed">{reply.content}</p>
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
