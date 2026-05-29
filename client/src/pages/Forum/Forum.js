import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./Forum.css";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

export default function Forum() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Forum-specific states
  const [threads, setThreads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Authenticate and load profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (e) {}
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);
        
        setUser(data);
        if (data.avatar) {
          setAvatar(data.avatar);
        }
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Fetch forum threads and initialize socket connection
  useEffect(() => {
    const fetchForumThreads = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/forums", config);
        console.log("🔥 Forums API Data:", data);
        setThreads(data.threads || []);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    if (user) {
      fetchForumThreads();

      const socket = io("http://localhost:5000");

      socket.on("connect", () => {
        console.log("⚡ Connected to forum updates socket");
      });

      socket.on("new_forum_thread", (data) => {
        if (data && data.thread) {
          setThreads((prevThreads) => {
            const exists = prevThreads.some((t) => t._id === data.thread._id);
            if (exists) return prevThreads;
            return [data.thread, ...prevThreads];
          });
        }
      });

      socket.on("new_reply", (data) => {
        if (data && data.threadId) {
          setActiveThread((prevActive) => {
            if (prevActive && prevActive._id === data.threadId) {
              const replyExists = prevActive.replies.some(
                (r) => r._id === data.reply._id
              );
              if (replyExists) return prevActive;
              return {
                ...prevActive,
                repliesCount: data.repliesCount,
                replies: [...prevActive.replies, data.reply]
              };
            }
            return prevActive;
          });

          setThreads((prevThreads) =>
            prevThreads.map((t) =>
              t._id === data.threadId
                ? { ...t, repliesCount: data.repliesCount }
                : t
            )
          );
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const handleThreadClick = async (id) => {
    setSelectedThreadId(id);
    setIsThreadLoading(true);
    setActiveThread(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/forums/${id}`, config);
      setActiveThread(data.thread);
    } catch (error) {
      console.error("Error fetching thread details:", error);
      alert("Failed to load thread discussion details.");
      setSelectedThreadId(null);
    } finally {
      setIsThreadLoading(false);
    }
  };

  const handleCreateThreadSubmit = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    setIsSubmittingThread(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post("/api/forums", {
        title: newThreadTitle,
        content: newThreadContent
      }, config);

      if (data.underReview) {
        alert("Your post contains flagged keywords and has been sent for moderator review.");
      } else {
        setThreads((prev) => {
          const exists = prev.some((t) => t._id === data.thread?._id);
          if (exists) return prev;
          return [data.thread, ...prev];
        });
      }

      setIsCreateOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (error) {
      console.error("Error creating thread:", error);
      alert(error.response?.data?.message || "Failed to create discussion thread.");
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeThread) return;
    setIsSubmittingReply(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/forums/${activeThread._id}/replies`, {
        content: replyContent
      }, config);

      setActiveThread((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          repliesCount: prev.repliesCount + 1,
          replies: [...prev.replies, data.reply]
        };
      });

      setThreads((prev) =>
        prev.map((t) =>
          t._id === activeThread._id
            ? { ...t, repliesCount: t.repliesCount + 1 }
            : t
        )
      );

      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to submit comment.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put("/api/auth/update-avatar", formData, config);

      if (data.avatar) {
        setAvatar(data.avatar);

        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            const updatedUser = { ...parsedUser, avatar: data.avatar };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            console.error("Failed to update user object in local storage:", err);
          }
        }
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setAvatar(parsedUser.avatar || null);
        } catch (err) {}
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  // Helper formatting helpers
  const formatDate = (date) => {
    if (!date) return t('some time ago');
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return t('Just now');
    if (diff < 3600) return `${Math.floor(diff / 60)}${t('m ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t('h ago')}`;
    return `${Math.floor(diff / 86400)}${t('d ago')}`;
  };

  const getCategoryTag = (title) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("exam") || lower.includes("study") || lower.includes("course") || lower.includes("assignment") || lower.includes("class")) {
      return { label: t("Academics"), class: "tag-academic" };
    }
    if (lower.includes("coding") || lower.includes("tech") || lower.includes("web") || lower.includes("software") || lower.includes("computer")) {
      return { label: t("Tech Hub"), class: "tag-tech" };
    }
    if (lower.includes("canteen") || lower.includes("sports") || lower.includes("match") || lower.includes("play") || lower.includes("game")) {
      return { label: t("Campus Life"), class: "tag-life" };
    }
    if (lower.includes("help") || lower.includes("question") || lower.includes("how") || lower.includes("need")) {
      return { label: t("Q & A"), class: "tag-qna" };
    }
    return { label: t("General"), class: "tag-general" };
  };

  const getMockSnippet = (title) => {
    const lower = (title || "").toLowerCase();
    if (lower.includes("exam") || lower.includes("study") || lower.includes("course") || lower.includes("assignment") || lower.includes("class")) {
      return t("Prepare for your midterms and finals, share study guides, and coordinate study sessions with fellow classmates.");
    }
    if (lower.includes("coding") || lower.includes("tech") || lower.includes("web") || lower.includes("software") || lower.includes("computer")) {
      return t("Discuss coding challenges, software engineering trends, frameworks like React 19, and local hackathons.");
    }
    if (lower.includes("canteen") || lower.includes("sports") || lower.includes("match") || lower.includes("play") || lower.includes("game")) {
      return t("Get canteen menu reviews, coordinate sports matches, or check campus athletics schedules.");
    }
    if (lower.includes("help") || lower.includes("question") || lower.includes("how") || lower.includes("need")) {
      return t("Need help with campus resources or project tasks? Ask your questions here and get quick feedback.");
    }
    return t("Join the discussion on campus events, university life, academic schedules, and general topics.");
  };

  const isRecent = (date) => {
    if (!date) return false;
    const diff = new Date() - new Date(date);
    return diff < 86400000; 
  };

  // Filtering Logic
  const filteredThreads = threads.filter((post) => {
    if (post.isHidden) return false;

    const category = getCategoryTag(post.title).label;
    const matchesCategory =
      selectedCategory === "All" || category === selectedCategory;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (post.title || "").toLowerCase().includes(query) ||
      (post.content || "").toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const categoriesList = ["All", "Academics", "Tech Hub", "Campus Life", "Q & A", "General"];

  console.log("🔥 Render Forum - user:", user?.name, "threads length:", threads.length, "filtered length:", filteredThreads.length);

  if (!user) {
    console.log("🔥 Render Forum - user is null, returning loading screen");
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '14px', background: '#f0f4f8' }}>
        <div className="spinner"></div>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: '14.5px', fontWeight: '600' }}>{t('Loading your profile...')}</p>
      </div>
    );
  }

  return (
    <div className="forum-root-page">
      <Sidebar />

      <main className="forum-main-frame">
        <Topbar
          time={time}
          user={user}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="forum-content-container">
          {/* ── FORUM HEADER ── */}
          <div className="forum-page-header">
            <div className="header-meta">
              <h1 className="forum-page-title">{t("Campus Discussion Forum")}</h1>
              <p className="forum-page-subtitle">{t("Share ideas, ask questions, and collaborate with your peers")}</p>
            </div>
            
            <div className="header-actions">
              <div className="forum-search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={t("Search discussions...")}
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="btn-start-discussion" onClick={() => setIsCreateOpen(true)}>
                <span className="plus-icon">+</span> {t("Start Discussion")}
              </button>
            </div>
          </div>

          {/* ── CATEGORY FILTER TABS ── */}
          <div className="forum-category-tabs">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`category-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {t(cat)}
              </button>
            ))}
          </div>

          {/* ── DISCUSSION FEED LIST ── */}
          <div className="forum-threads-feed">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((post, i) => {
                const category = getCategoryTag(post.title);
                return (
                  <div
                    key={i}
                    className="forum-feed-card"
                    onClick={() => handleThreadClick(post._id)}
                  >
                    <div className="card-top-header">
                      <div className="card-avatar-section">
                        <div className="anonymous-avatar" style={{
                          background: 'linear-gradient(135deg, #00c2cb, #0a2342)',
                          color: '#ffffff'
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <span className="anonymous-author">{t("by Student")}</span>
                        {isRecent(post.createdAt) && <span className="feed-pulse-dot" title={t("Recent activity")} />}
                      </div>

                      <div className="card-badge-section">
                        <span className={`forum-tag-badge ${category.class}`}>{category.label}</span>
                        <span className="feed-relative-time">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    <div className="card-body-section">
                      <h3 className="feed-thread-title">{post.title || t('Untitled Discussion')}</h3>
                      <p className="feed-thread-snippet">
                        {post.content ? (post.content.length > 180 ? `${post.content.substring(0, 180)}...` : post.content) : getMockSnippet(post.title)}
                      </p>
                    </div>

                    <div className="card-footer-section">
                      <div className="reply-metrics">
                        <svg className="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{post.repliesCount || 0} {post.repliesCount === 1 ? t('reply') : t('replies')}</span>
                      </div>
                      <div className="card-action-trigger">
                        <span>{t("Join Conversation")}</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="forum-empty-feed">
                <span className="empty-icon-bubble">💬</span>
                <h3>{t("No discussions found")}</h3>
                <p>{t("Be the first to share an idea, ask a query, or start a debate with fellow students")}</p>
                <button className="btn-empty-start" onClick={() => setIsCreateOpen(true)}>
                  {t("Start the first topic")}
                </button>
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <footer className="db-footer">
            <p>
              {t('© 2026 CampusConnect. An idea by')} <span>{t('Mr. Sagheer Ahmad')}</span> &{" "}
              <span>{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>

      {/* ── CREATE DISCUSSION MODAL ── */}
      {isCreateOpen && (
        <div className="forum-modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="forum-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="forum-modal-header">
              <h3 className="forum-modal-title">{t('Start a New Discussion')}</h3>
              <button className="btn-modal-close" onClick={() => setIsCreateOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateThreadSubmit}>
              <div className="forum-modal-body">
                <div className="form-group">
                  <label htmlFor="thread-title">{t('Discussion Title')}</label>
                  <input
                    id="thread-title"
                    type="text"
                    placeholder={t("e.g. Study Group for Midterms or Canteen reviews")}
                    className="form-input"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="thread-content">{t('Description / Question Details')}</label>
                  <textarea
                    id="thread-content"
                    placeholder={t("Explain your question or details of the discussion...")}
                    className="form-input form-textarea"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="forum-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCreateOpen(false)}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-modal-submit" disabled={isSubmittingThread}>
                  {isSubmittingThread ? t("Publishing...") : t("Post Discussion")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── THREAD DETAIL MODAL ── */}
      {selectedThreadId && (
        <div className="forum-modal-overlay" onClick={() => setSelectedThreadId(null)}>
          <div className="forum-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="forum-modal-header">
              <h3 className="forum-modal-title">{t('Discussion Thread')}</h3>
              <button className="btn-modal-close" onClick={() => setSelectedThreadId(null)}>×</button>
            </div>
            <div className="forum-modal-body">
              {isThreadLoading ? (
                <div className="forum-loading-state">
                  <div className="spinner"></div>
                  <p>{t('Fetching discussion thread...')}</p>
                </div>
              ) : activeThread ? (
                <>
                  <div className="thread-detail-header">
                    <div className="thread-detail-avatar-fallback" style={{
                      background: 'linear-gradient(135deg, #0a2342, #00c2cb)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="thread-detail-meta">
                      <span className="thread-detail-author">{t('Student')}</span>
                      <span className="thread-detail-time">{t('Posted on ')}{new Date(activeThread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0a2342', marginTop: '12px', marginBottom: '8px' }}>
                    {activeThread.title}
                  </h4>

                  <div className="thread-detail-content">
                    {activeThread.content}
                  </div>

                  <div className="replies-section">
                    <h5 className="replies-title">{t('Replies')} ({activeThread.replies?.length || 0})</h5>
                    <div className="replies-list">
                      {activeThread.replies && activeThread.replies.length > 0 ? (
                        activeThread.replies.map((reply, i) => (
                          <div key={i} className="reply-item">
                            <div className="reply-avatar-fallback" style={{
                              background: 'linear-gradient(135deg, #64748b, #94a3b8)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </div>
                            <div className="reply-info">
                              <div className="reply-header">
                                <span className="reply-author">{t('Student')}</span>
                                <span className="reply-time">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="reply-content-text">{reply.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-replies-prompt">{t('No replies yet. Be the first to join the conversation!')}</p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleReplySubmit} className="add-reply-box">
                    <textarea
                      placeholder={t("Write your response/comment...")}
                      className="form-input reply-textarea"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                    />
                    <div className="reply-submit-row">
                      <button type="submit" className="btn-reply-send" disabled={isSubmittingReply}>
                        {isSubmittingReply ? t("Posting...") : t("Send Comment")}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                  {t('Failed to load details.')}
                </div>
              )}
            </div>
            <div className="forum-modal-footer">
              <button className="btn-modal-cancel" onClick={() => setSelectedThreadId(null)}>
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
