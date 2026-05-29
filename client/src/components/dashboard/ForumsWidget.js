import React from 'react';
import './ForumsWidget.css';

export const ForumsWidget = ({ forums = [], onThreadClick, onCreateClick }) => {
  const formatDate = (date) => {
    if (!date) return 'some time ago';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getCategoryTag = (title) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("exam") || lower.includes("study") || lower.includes("course") || lower.includes("assignment") || lower.includes("class")) {
      return { label: "Academics", class: "tag-academic" };
    }
    if (lower.includes("coding") || lower.includes("tech") || lower.includes("web") || lower.includes("software") || lower.includes("computer")) {
      return { label: "Tech Hub", class: "tag-tech" };
    }
    if (lower.includes("canteen") || lower.includes("sports") || lower.includes("match") || lower.includes("play") || lower.includes("game")) {
      return { label: "Campus Life", class: "tag-life" };
    }
    if (lower.includes("help") || lower.includes("question") || lower.includes("how") || lower.includes("need")) {
      return { label: "Q & A", class: "tag-qna" };
    }
    return { label: "General", class: "tag-general" };
  };

  const isRecent = (date) => {
    if (!date) return false;
    const diff = new Date() - new Date(date);
    return diff < 86400000; // 24 hours
  };

  return (
    <div className="db-card widget-forum premium-forum">
      <div className="db-card-head">
        <div>
          <h3 className="db-card-title premium-title">Student Forums</h3>
          <p className="forum-subtitle">Engage, ask, and share with fellow classmates</p>
        </div>
        <a href="/forum" className="db-card-link">View all →</a>
      </div>

      <div className="widget-content scrollable premium-scroll">
        {forums && forums.length > 0 ? forums.map((post, i) => {
          const category = getCategoryTag(post.title);

          return (
            <div key={i} className="forum-item-premium" onClick={() => onThreadClick && onThreadClick(post._id)}>
              <div className="forum-avatar-wrapper">
                <div className="forum-avatar-fallback" style={{ background: 'linear-gradient(135deg, #00c2cb, #0a2342)', color: '#ffffff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                {isRecent(post.createdAt) && <span className="active-pulse-dot" title="Recent activity" />}
              </div>

              <div className="forum-info-premium">
                <div className="forum-top-row">
                  <span className={`forum-category-badge ${category.class}`}>{category.label}</span>
                  <span className="forum-time-badge">{formatDate(post.createdAt)}</span>
                </div>
                <div className="forum-title-premium">{post.title || 'Untitled Discussion'}</div>
                <div className="forum-footer-row">
                  <span className="forum-author-name">by Student</span>
                  <div className="forum-replies-indicator">
                    <svg className="reply-bubble-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{post.repliesCount || 0} {post.repliesCount === 1 ? 'reply' : 'replies'}</span>
                  </div>
                </div>
              </div>
              <div className="forum-item-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          );
        }) : (
          <div className="forum-empty-state">
            <span className="empty-icon">💬</span>
            <p>No active discussions found</p>
            <button className="btn-empty-create" onClick={onCreateClick}>Start the first discussion</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumsWidget;
