import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./Dashboard.css";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Dashboard Widgets
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import CanteenWidget from "../../components/dashboard/CanteenWidget";
import ForumsWidget from "../../components/dashboard/ForumsWidget";
import PetitionsWidget from "../../components/dashboard/PetitionsWidget";
import LostFoundWidget from "../../components/dashboard/LostFoundWidget";
import BusRoutesWidget from "../../components/dashboard/BusRoutesWidget";

const t = (s) => s;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    notifications: { forums: 0, petitions: 0, updates: 0 },
    forums: [],
    petitions: [],
    lostAndFound: [],
    busRoutes: []
  });

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    // Auth guard
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Load initial user details from cache for premium instant rendering
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

    // Fetch latest user profile dynamically from server to sync state & avoid stale cache
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
        console.error("Failed to fetch latest user profile from server:", error);
      }
    };
    fetchUserProfile();

    // Remove legacy global avatar cache to avoid leaking profile pictures between different users
    localStorage.removeItem("userAvatar");

    // Clock
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/dashboard/summary", config);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    if (user) {
      fetchDashboardData();

      // Establish Socket.io connection for real-time updates
      const socket = io("http://localhost:5000");

      socket.on("connect", () => {
        console.log("⚡ Connected to live updates socket");
      });

      socket.on("new_forum_thread", (data) => {
        console.log("⚡ New forum thread received via socket:", data);
        if (data && data.thread) {
          setDashboardData((prevData) => {
            // Check if thread already exists to avoid duplicates
            const threadExists = prevData.forums.some(
              (f) => f._id === data.thread._id
            );
            if (threadExists) return prevData;

            // Prepend new thread and limit to 5 threads maximum
            return {
              ...prevData,
              forums: [data.thread, ...prevData.forums].slice(0, 5)
            };
          });
        }
      });

      socket.on("new_reply", (data) => {
        console.log("⚡ New reply received via socket:", data);
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

          setDashboardData((prevData) => ({
            ...prevData,
            forums: prevData.forums.map((f) =>
              f._id === data.threadId ? { ...f, repliesCount: data.repliesCount } : f
            )
          }));
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from live updates socket");
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

      if (data.underReview) {
        alert("Your reply contains flagged keywords and has been sent for moderator review.");
      } else {
        setActiveThread(prev => {
          if (!prev) return null;
          return {
            ...prev,
            repliesCount: prev.repliesCount + 1,
            replies: [...prev.replies, data.reply]
          };
        });

        setDashboardData(prev => ({
          ...prev,
          forums: prev.forums.map(f => f._id === activeThread._id ? { ...f, repliesCount: f.repliesCount + 1 } : f)
        }));
      }

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

    // Premium micro-animation / optimistic update: preview image immediately
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

        // Sync with user details in state & local storage
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
      
      // Revert to original database-saved avatar on error
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

  if (!user) return null;

  return (
    <div className="db-root">
      <Sidebar />

      <main className="db-main">
        <Topbar
          time={time}
          user={user}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="db-content">
          <WelcomeBanner user={user} avatar={getPersonalizedAvatar(avatar)} />
          <CanteenWidget />

          <div className="db-main-grid">
            <div className="db-left-col">
              <ForumsWidget 
                forums={dashboardData.forums} 
                onThreadClick={handleThreadClick}
              />
            </div>

            <div className="db-right-col">
              <PetitionsWidget petitions={dashboardData.petitions} />
              <div className="utility-container">
                <LostFoundWidget items={dashboardData.lostAndFound} />
                <BusRoutesWidget busRoutes={dashboardData.busRoutes} />
              </div>
            </div>
          </div>

          <footer className="db-footer">
            <p>
              {t('© 2026 CampusConnect. An idea by')} <span>{t('Mr. Sagheer Ahmad')}</span> &{" "}
              <span>{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>



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
                    <h5 className="replies-title">{t('Replies')} ({activeThread.replies ? activeThread.replies.filter(r => !r.isHidden).length : 0})</h5>
                    <div className="replies-list">
                      {activeThread.replies && activeThread.replies.filter(r => !r.isHidden).length > 0 ? (
                        activeThread.replies.filter(r => !r.isHidden).map((reply, i) => (
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
                      placeholder="Write your response/comment..."
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
