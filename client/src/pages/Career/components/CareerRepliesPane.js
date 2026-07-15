import React, { useState } from "react";
import axios from "axios";

export default function CareerRepliesPane({ 
  activeThread, 
  user, 
  onClose, 
  showToast, 
  onReplyAdded,
  onAvatarClick,
  onReportThread,
  onReportReply
}) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracks dropdown visibility: { type: 'thread' | 'reply' | null, id: replyId | null }
  const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/careers/${activeThread._id}/reply`, {
        content: replyContent
      }, config);

      if (data.underReview) {
        showToast("Your reply contains flagged keywords and has been sent for moderator review.", "warning");
      } else {
        showToast("Reply posted successfully.", "success");
        if (data.reply) {
          onReplyAdded(activeThread._id, data.reply);
        } else {
          onReplyAdded(activeThread._id, {
            _id: `temp-${Date.now()}`,
            content: replyContent,
            author: user,
            createdAt: new Date().toISOString()
          });
        }
      }
      setReplyContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
      showToast(error.response?.data?.message || "Failed to post reply.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isThreadOwner = activeThread.author && (
    (typeof activeThread.author === 'string' && activeThread.author === user._id) ||
    (typeof activeThread.author === 'object' && activeThread.author._id === user._id)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-fade-in relative text-left">
      {/* Pane Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-2xl">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={activeThread.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.author?.name || "User")}&background=random`}
              alt={activeThread.author?.name}
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onAvatarClick && onAvatarClick(activeThread.author?._id || activeThread.author)}
            />
            <div>
              <div 
                className="text-[13px] font-bold text-[#0a2342] leading-none cursor-pointer hover:underline"
                onClick={() => onAvatarClick && onAvatarClick(activeThread.author?._id || activeThread.author)}
              >
                {activeThread.author?.name}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {new Date(activeThread.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <h2 className="text-[18px] font-black text-[#0a2342] mt-3 leading-snug">{activeThread.title}</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Thread Actions Dropdown */}
          {!isThreadOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(prev => prev.type === 'thread' ? { type: null, id: null } : { type: 'thread', id: activeThread._id })}
                className="text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer text-[14px] font-bold border-none"
              >
                ⋮
              </button>
              {activeDropdown.type === 'thread' && (
                <div className="absolute right-0 top-9 z-20">
                  <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 w-[130px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown({ type: null, id: null });
                        onReportThread && onReportThread(activeThread._id);
                      }}
                      className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-bold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-red-50 text-red-600"
                    >
                      🛡️ Report Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all border-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div className="p-5 overflow-y-auto flex-1">
        <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap mb-8">
          {activeThread.content}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-[13px] font-bold text-[#0a2342] mb-4 tracking-wide uppercase">
            Replies ({activeThread.replies?.length || 0})
          </h3>
          
          <div className="flex flex-col gap-4 mb-6">
            {activeThread.replies && activeThread.replies.map((reply) => {
              const isReplyOwner = reply.author && (
                (typeof reply.author === 'string' && reply.author === user._id) ||
                (typeof reply.author === 'object' && reply.author._id === user._id)
              );
              const authorId = reply.author?._id || reply.author;
              const authorName = reply.author?.name || "Student";
              const isRepDropdownActive = activeDropdown.type === 'reply' && activeDropdown.id === reply._id;

              return (
                <div key={reply._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={reply.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`}
                        alt={authorName}
                        className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-85"
                        onClick={() => onAvatarClick && onAvatarClick(authorId)}
                      />
                      <span 
                        className="text-[12px] font-bold text-[#0a2342] cursor-pointer hover:underline"
                        onClick={() => onAvatarClick && onAvatarClick(authorId)}
                      >
                        {authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(reply.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                          ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        }
                      </span>

                      {/* Reply Actions Trigger */}
                      {!isReplyOwner && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(prev => prev.id === reply._id ? { type: null, id: null } : { type: 'reply', id: reply._id })}
                            className="bg-transparent border-none text-[13px] font-bold text-slate-400 hover:text-slate-650 cursor-pointer p-0.5 rounded-full"
                          >
                            ⋮
                          </button>
                          {isRepDropdownActive && (
                            <div className="absolute right-0 top-5 z-20">
                              <div className="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 w-[130px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDropdown({ type: null, id: null });
                                    onReportReply && onReportReply(activeThread._id, reply._id);
                                  }}
                                  className="w-full text-left bg-none border-none px-3.5 py-2 text-[12px] font-bold cursor-pointer flex items-center gap-1.5 transition-all hover:bg-red-50 text-red-600"
                                >
                                  🛡️ Report Comment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[13px] text-slate-650 pl-8 whitespace-pre-wrap leading-relaxed">
                    {reply.content}
                  </div>
                </div>
              );
            })}
            
            {(!activeThread.replies || activeThread.replies.length === 0) && (
              <div className="text-center py-6 text-[13px] text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
                No replies yet. Be the first to join the conversation!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply input form */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            placeholder="Write a reply..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] resize-none pr-[90px]"
            rows="3"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyContent.trim()}
            className="absolute bottom-3 right-3 bg-[#0a2342] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:bg-[#00c2cb] disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
