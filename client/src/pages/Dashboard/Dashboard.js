import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
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
      } catch (e) { }
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
        } catch (err) { }
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
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          time={time}
          user={user}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4 [&>*]:animate-fade-in">
          <WelcomeBanner user={user} avatar={getPersonalizedAvatar(avatar)} />
          <CanteenWidget />

          <div className="grid grid-cols-[0.9fr_1.1fr] gap-6 max-[1200px]:grid-cols-1">
            <div className="flex flex-col gap-6 min-w-0">
              <ForumsWidget
                forums={dashboardData.forums}
                onThreadClick={handleThreadClick}
              />
            </div>

            <div className="flex flex-col gap-6 min-w-0">
              <PetitionsWidget petitions={dashboardData.petitions} />
              <div className="bg-white border border-slate-200 rounded-2xl p-[22px] grid grid-cols-2 gap-5 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                <LostFoundWidget items={dashboardData.lostAndFound} />
                <BusRoutesWidget busRoutes={dashboardData.busRoutes} />
              </div>
            </div>
          </div>

          <footer className="mt-5 py-3 border-t border-slate-200 text-center">
            <p className="text-[12px] text-slate-400 font-medium tracking-wide">
              {t('© 2026 CampusConnect. An idea by')} <span className="text-[#0a2342] font-bold">{t('Mr. Sagheer Ahmad')}</span> &{" "}
              <span className="text-[#0a2342] font-bold">{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>



      {/* ── THREAD DETAIL MODAL ── */}
      {selectedThreadId && (
        <div className="fixed inset-0 bg-[#0a2342]/40 backdrop-blur-[8px] flex items-center justify-center z-[2000] animate-modal-fade-in" onClick={() => setSelectedThreadId(null)}>
          <div className="w-[90%] max-w-[620px] max-h-[85vh] bg-white rounded-[20px] border border-white/80 shadow-[0_20px_50px_rgba(10,35,66,0.15)] flex flex-col overflow-hidden animate-modal-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-[16px] font-black text-[#0a2342] tracking-tight">{t('Discussion Thread')}</h3>
              <button className="bg-none border-none text-[26px] leading-none text-slate-400 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-slate-100 hover:text-red-500" onClick={() => setSelectedThreadId(null)}>×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isThreadLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3.5">
                  <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
                  <p className="text-[13px] text-slate-500 font-medium">{t('Fetching discussion thread...')}</p>
                </div>
              ) : activeThread ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[38px] h-[38px] rounded-full shrink-0" style={{
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
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-[#0a2342]">{t('Student')}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{t('Posted on ')}{new Date(activeThread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0a2342', marginTop: '12px', marginBottom: '8px' }}>
                    {activeThread.title}
                  </h4>

                  <div className="text-[13.5px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 whitespace-pre-wrap">
                    {activeThread.content}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h5 className="text-[13.5px] font-extrabold text-[#0a2342] border-b border-slate-100 pb-2">{t('Replies')} ({activeThread.replies ? activeThread.replies.filter(r => !r.isHidden).length : 0})</h5>
                    <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                      {activeThread.replies && activeThread.replies.filter(r => !r.isHidden).length > 0 ? (
                        activeThread.replies.filter(r => !r.isHidden).map((reply, i) => (
                          <div key={i} className="flex gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in">
                            <div className="w-7 h-7 rounded-full shrink-0" style={{
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
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[11.5px] font-bold text-[#0a2342]">{t('Student')}</span>
                                <span className="text-[10.5px] text-slate-400 font-medium">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-[12.5px] text-slate-600 leading-normal whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-6 text-[12.5px] text-slate-400 font-medium border-[1.5px] border-dashed border-slate-200 rounded-lg bg-slate-50">{t('No replies yet. Be the first to join the conversation!')}</p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleReplySubmit} className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-3">
                    <textarea
                      placeholder="Write your response/comment..."
                      className="w-full px-3.5 py-3 font-inherit text-[13.5px] border-[1.5px] border-slate-200 rounded-lg text-[#0a2342] font-medium transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:shadow-[0_0_0_3px_rgba(0,194,203,0.1)] min-h-[64px] p-2.5 text-[13px] bg-white"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                    />
                    <div className="flex justify-end">
                      <button type="submit" className="bg-[#0a2342] text-white border-none font-inherit text-[12px] font-bold px-4.5 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:enabled:bg-[#00c2cb] disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmittingReply}>
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
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button className="bg-slate-200 text-slate-600 border-none font-inherit text-[13px] font-bold px-5 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-300 hover:text-slate-800" onClick={() => setSelectedThreadId(null)}>
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
