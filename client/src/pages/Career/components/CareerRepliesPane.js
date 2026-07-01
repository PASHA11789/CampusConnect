import React, { useState } from "react";
import axios from "axios";

export default function CareerRepliesPane({ activeThread, user, onClose, showToast, onReplyAdded }) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          // Fallback if the reply isn't returned directly, we can trigger a refetch or optimistic update
          onReplyAdded(activeThread._id, {
            _id: Date.now().toString(),
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-fade-in relative">
      <div className="p-5 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={activeThread.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeThread.author?.name || "User")}&background=random`}
              alt={activeThread.author?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="text-[13px] font-bold text-[#0a2342] leading-none">
                {activeThread.author?.name}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {new Date(activeThread.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <h2 className="text-[18px] font-black text-[#0a2342] mt-3">{activeThread.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          ✕
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap mb-8">
          {activeThread.content}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-[13px] font-bold text-[#0a2342] mb-4 tracking-wide uppercase">
            Replies ({activeThread.replies?.length || 0})
          </h3>
          
          <div className="flex flex-col gap-4 mb-6">
            {activeThread.replies && activeThread.replies.map((reply) => (
              <div key={reply._id} className="bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={reply.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.name || "User")}&background=random`}
                      alt={reply.author?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-[12px] font-bold text-[#0a2342]">
                      {reply.author?.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[13px] text-slate-600 pl-8 whitespace-pre-wrap">
                  {reply.content}
                </div>
              </div>
            ))}
            {(!activeThread.replies || activeThread.replies.length === 0) && (
              <div className="text-center py-6 text-[13px] text-slate-400">
                No replies yet. Be the first to join the conversation!
              </div>
            )}
          </div>
        </div>
      </div>

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
            className="absolute bottom-3 right-3 bg-[#0a2342] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:bg-[#00c2cb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
