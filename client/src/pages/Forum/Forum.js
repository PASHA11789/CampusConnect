import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
// Layout Components

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Subcomponents
import ThreadListPane from "./components/ThreadListPane";
import RepliesPane from "./components/RepliesPane";
import CreateThreadModal from "./components/CreateThreadModal";

const t = (s) => s;

export default function Forum() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [selectedThreadId, setSelectedThreadId] = useState(location.state?.threadId || null);
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // AI Moderation UI states
  const [toast, setToast] = useState(null);
  const [revealedReplies, setRevealedReplies] = useState(new Set());
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState(null);

  // Redesign states
  const [threadsLoaded, setThreadsLoaded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [mobileView, setMobileView] = useState(location.state?.threadId ? "detail" : "list");
  const [replyingTo, setReplyingTo] = useState(null); // { replyId, authorName }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Authenticate and load profile on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (e) { }
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);

        setUser(data);
        if (data.avatar) {
          setAvatar(data.avatar);
        }
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Dismiss dropdowns when clicking anywhere else
  useEffect(() => {
    const handleDocumentClick = () => {
      if (activeDropdown.id !== null) {
        setActiveDropdown({ type: null, id: null });
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [activeDropdown]);

  // Fetch forum threads and initialize socket connection
  useEffect(() => {
    const fetchForumThreads = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/forums", config);
        console.log("🔥 Forums API Data:", data);
        setThreads(data.threads || []);
      } catch (error) {
        console.error("Error fetching forums:", error);
      } finally {
        setThreadsLoaded(true);
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

      socket.on("reply_updated", (data) => {
        if (data && data.threadId) {
          setActiveThread((prevActive) => {
            if (prevActive && prevActive._id === data.threadId) {
              return {
                ...prevActive,
                replies: prevActive.replies.map((r) =>
                  r._id === data.replyid ? { ...r, content: data.content } : r
                )
              };
            }
            return prevActive;
          });
        }
      });

      socket.on("reply_deleted", (data) => {
        if (data && data.threadId) {
          setActiveThread((prevActive) => {
            if (prevActive && prevActive._id === data.threadId) {
              return {
                ...prevActive,
                repliesCount: data.repliesCount,
                replies: prevActive.replies.filter((r) => r._id !== data.replyId && r.parentId !== data.replyId)
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

  // Reset pagination on category or search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // ── TOAST NOTIFICATION HELPER ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const handleThreadClick = useCallback(async (id) => {
    setSelectedThreadId(id);
    setIsThreadLoading(true);
    setActiveThread(null);
    setReplyingTo(null);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/forums/${id}`, config);
      setActiveThread(data.thread);
    } catch (error) {
      console.error("Error fetching thread details:", error);
      showToast(error.response?.data?.message || error.message || "Failed to load thread details.", 'error');
      setSelectedThreadId(null);
    } finally {
      setIsThreadLoading(false);
    }
  }, [showToast]);

  // Load thread details on redirect from Dashboard
  useEffect(() => {
    if (selectedThreadId && !activeThread) {
      handleThreadClick(selectedThreadId);
    }
  }, [selectedThreadId, activeThread, handleThreadClick]);

  const handleCancelModal = () => {
    setIsCreateOpen(false);
    setEditingThreadId(null);
    setNewThreadTitle("");
    setNewThreadContent("");
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Are you sure you want to permanently delete this discussion?")) return;
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/forums/${threadId}`, config);
      showToast("Discussion deleted successfully.", 'success');
      setThreads((prev) => prev.filter((t) => t._id !== threadId));
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setActiveThread(null);
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      showToast(error.response?.data?.message || "Failed to delete discussion.", 'error');
    }
  };

  const handleReportContent = (type, id) => {
    showToast("This content has been reported to moderators for review.", 'success');
    setActiveDropdown({ type: null, id: null });
  };

  const handleCreateThreadSubmit = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    setIsSubmittingThread(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingThreadId) {
        const { data } = await axios.put(`/api/forums/${editingThreadId}`, {
          title: newThreadTitle,
          content: newThreadContent
        }, config);

        if (data.underReview) {
          showToast("Your updated post is under review by AI moderation.", 'warning');
        } else {
          showToast("Discussion updated successfully.", 'success');
          setThreads((prev) =>
            prev.map((t) =>
              t._id === editingThreadId
                ? { ...t, title: newThreadTitle }
                : t
            )
          );
          setActiveThread((prev) => {
            if (prev && prev._id === editingThreadId) {
              return { ...prev, title: newThreadTitle, content: newThreadContent };
            }
            return prev;
          });
        }
        setEditingThreadId(null);
      } else {
        const { data } = await axios.post("/api/forums", {
          title: newThreadTitle,
          content: newThreadContent
        }, config);

        if (data.underReview) {
          showToast("Your post was flagged by AI moderation and sent for review. It won't appear publicly until a moderator clears it.", 'warning');
        } else {
          setThreads((prev) => {
            const exists = prev.some((t) => t._id === data.thread?._id);
            if (exists) return prev;
            return [data.thread, ...prev];
          });
          if (data.thread) {
            handleThreadClick(data.thread._id);
          }
        }
      }

      setIsCreateOpen(false);
      setNewThreadTitle("");
      setNewThreadContent("");
    } catch (error) {
      console.error("Error submitting thread:", error);
      alert(error.response?.data?.message || "Failed to submit discussion thread.");
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeThread) return;
    setIsSubmittingReply(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/forums/${activeThread._id}/replies`, {
        content: replyContent,
        parentId: replyingTo?.replyId || null
      }, config);

      if (data.underReview) {
        showToast("Your reply contains flagged keywords and has been sent for moderator review.", 'warning');
      } else {
        await handleThreadClick(activeThread._id);

        setThreads((prev) =>
          prev.map((t) =>
            t._id === activeThread._id
              ? { ...t, repliesCount: t.repliesCount + 1 }
              : t
          )
        );
      }

      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
      showToast("Failed to submit comment. Please try again.", 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim() || !activeThread) return;
    const originalContent = editReplyContent;
    const oldReplies = [...activeThread.replies];

    // Optimistically update UI state immediately
    setActiveThread((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        replies: prev.replies.map((r) =>
          r._id === replyId ? { ...r, content: originalContent } : r
        )
      };
    });
    setEditingReplyId(null);
    setEditReplyContent("");

    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/forums/${activeThread._id}/replies/${replyId}`, {
        content: originalContent
      }, config);

      showToast("Comment updated successfully.", 'success');
    } catch (error) {
      console.error("Error updating reply:", error);
      showToast(error.response?.data?.message || "Failed to update comment.", 'error');
      // Rollback to previous state on error
      setActiveThread((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          replies: oldReplies
        };
      });
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/forums/${activeThread._id}/replies/${replyId}`, config);

      await handleThreadClick(activeThread._id);

      setThreads((prev) =>
        prev.map((t) => {
          if (t._id === activeThread._id) {
            const deletedCount = activeThread.replies.filter(
              (r) => r._id === replyId || r.parentId === replyId
            ).length;
            return { ...t, repliesCount: Math.max(0, t.repliesCount - deletedCount) };
          }
          return t;
        })
      );

      showToast("Comment deleted successfully.", 'success');
      setDeletingReplyId(null);
    } catch (error) {
      console.error("Error deleting reply:", error);
      showToast(error.response?.data?.message || "Failed to delete comment.", 'error');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploading(true);

    const token = sessionStorage.getItem("token");
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

        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            const updatedUser = { ...parsedUser, avatar: data.avatar };
            setUser(updatedUser);
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            console.error("Failed to update user object in local storage:", err);
          }
        }
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");

      const userStr = sessionStorage.getItem("user");
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
      return { label: t("Academics"), class: "bg-purple-100 text-purple-700" };
    }
    if (lower.includes("coding") || lower.includes("tech") || lower.includes("web") || lower.includes("software") || lower.includes("computer")) {
      return { label: t("Tech Hub"), class: "bg-blue-100 text-blue-700" };
    }
    if (lower.includes("canteen") || lower.includes("sports") || lower.includes("match") || lower.includes("play") || lower.includes("game")) {
      return { label: t("Campus Life"), class: "bg-green-100 text-green-700" };
    }
    if (lower.includes("help") || lower.includes("question") || lower.includes("how") || lower.includes("need")) {
      return { label: t("Q & A"), class: "bg-orange-100 text-orange-700" };
    }
    return { label: t("General"), class: "bg-slate-100 text-slate-600" };
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

  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThreads = filteredThreads.slice(startIndex, startIndex + itemsPerPage);

  // Clear selection if the selected thread is filtered out
  useEffect(() => {
    if (threadsLoaded && selectedThreadId) {
      const isStillVisible = filteredThreads.some(t => t._id === selectedThreadId);
      if (!isStillVisible) {
        setSelectedThreadId(null);
        setActiveThread(null);
      }
    }
  }, [filteredThreads, selectedThreadId, threadsLoaded]);

  const categoriesList = ["All", "Academics", "Tech Hub", "Campus Life", "Q & A", "General"];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t('Loading your profile...')}</p>
      </div>
    );
  }

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

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">
          {/* ── FORUM HEADER ── */}
          <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex flex-col">
              <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">{t("Campus Discussions")}</h1>
              <p className="text-[12px] text-slate-500 mt-1 font-semibold">{t("Join the conversation with your peers")}</p>
            </div>

            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm">
                  <svg className="w-4 h-4 text-slate-400 ml-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("Search topics, tags, or peers...")}
                    className="w-[240px] max-md:w-full bg-transparent border-none text-[13px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none py-2 pr-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="bg-[#0a2342] text-white border-none py-2 px-5 rounded-full text-[12px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb] whitespace-nowrap">
                  {t("Search")}
                </button>
              </div>
            </div>
          </div>

          {/* ── CATEGORY FILTER TABS ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full border text-[12px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? "bg-[#00c2cb] border-[#00c2cb] text-white hover:bg-[#00b2bb]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00c2cb] hover:border-[#00c2cb]"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {t(cat)}
              </button>
            ))}
          </div>

          {/* ── SPLIT LAYOUT ── */}
          <div className={`flex-1 ${selectedThreadId ? "grid grid-cols-[340px_1fr] gap-6" : "w-full"} rounded-2xl overflow-hidden min-h-[500px] max-[900px]:grid-cols-1`}>
            <ThreadListPane
              mobileView={mobileView}
              filteredThreads={paginatedThreads}
              selectedThreadId={selectedThreadId}
              onThreadClick={handleThreadClick}
              setMobileView={setMobileView}
              onStartDiscussion={() => setIsCreateOpen(true)}
              getCategoryTag={getCategoryTag}
              formatDate={formatDate}
              t={t}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            {selectedThreadId && (
              <RepliesPane
                mobileView={mobileView}
                setMobileView={setMobileView}
                isThreadLoading={isThreadLoading}
                activeThread={activeThread}
                user={user}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReply={isSubmittingReply}
                onReplySubmit={handleReplySubmit}
                revealedReplies={revealedReplies}
                onRevealReply={(replyId) => setRevealedReplies(prev => new Set([...prev, replyId]))}
                editingReplyId={editingReplyId}
                setEditingReplyId={setEditingReplyId}
                editReplyContent={editReplyContent}
                setEditReplyContent={setEditReplyContent}
                onUpdateReply={handleUpdateReply}
                deletingReplyId={deletingReplyId}
                setDeletingReplyId={setDeletingReplyId}
                onDeleteReply={handleDeleteReply}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                onEditThread={(thread) => {
                  setEditingThreadId(thread._id);
                  setNewThreadTitle(thread.title || "");
                  setNewThreadContent(thread.content || "");
                  setIsCreateOpen(true);
                }}
                onDeleteThread={handleDeleteThread}
                onReportContent={handleReportContent}
                formatDate={formatDate}
                getCategoryTag={getCategoryTag}
                t={t}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onClose={() => {
                  setSelectedThreadId(null);
                  setActiveThread(null);
                  setReplyingTo(null);
                  if (location.state?.threadId) {
                    navigate(location.pathname, { replace: true, state: {} });
                  }
                }}
              />
            )}
          </div>

          <footer className="mt-5 py-3 border-t border-slate-200 text-center">
            <p className="text-[12px] text-slate-400 font-medium tracking-wide">
              {t('© 2026 CampusConnect. An idea by')} <span className="text-[#0a2342] font-bold">{t('Mr. Sagheer Ahmad')}</span> &{" "}
              <span className="text-[#0a2342] font-bold">{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>

      <CreateThreadModal
        isOpen={isCreateOpen}
        isEditing={!!editingThreadId}
        title={newThreadTitle}
        setTitle={setNewThreadTitle}
        content={newThreadContent}
        setContent={setNewThreadContent}
        onSubmit={handleCreateThreadSubmit}
        onCancel={handleCancelModal}
        isSubmitting={isSubmittingThread}
        t={t}
      />

      {/* ── AI MODERATION TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="text-[18px] mt-0.5">
            {toast.type === 'warning' && <span>⚠️</span>}
            {toast.type === 'error' && <span>❌</span>}
            {toast.type === 'success' && <span>✅</span>}
            {toast.type === 'info' && <span>ℹ️</span>}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === 'warning' ? 'AI Moderation Alert'
                : toast.type === 'error' ? 'Error'
                  : toast.type === 'success' ? 'Success' : 'Notice'}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
