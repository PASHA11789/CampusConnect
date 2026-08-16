import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import { formatDate, SOCKET_URL } from "../../utils/helpers";
import { io } from "socket.io-client";
// Layout Components

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Subcomponents
import ThreadListPane from "../../components/discussion/DiscussionThreadListPane";
import RepliesPane from "../../components/discussion/DiscussionRepliesPane";
import CreateThreadModal from "../../components/discussion/CreateDiscussionThreadModal";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import MyProfileModal from "../../components/profile/MyProfileModal";
import ForumReportModal from "../../components/discussion/ForumReportModal";

const t = (s) => s;

export default function Forum() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryTargetId = searchParams.get("threadId") || searchParams.get("id");

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Forum-specific states
  const [threads, setThreads] = useState([]);
  // Map of threadId -> true for threads this user has bookmarked. Held here
  // rather than in each card so the state survives re-sorting and pagination.
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(queryTargetId || location.state?.threadId || null);

  useEffect(() => {
    const targetId = searchParams.get("threadId") || searchParams.get("id") || location.state?.threadId;
    if (targetId) {
      setSelectedThreadId(targetId);
    }
  }, [searchParams, location]);
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [newThreadImage, setNewThreadImage] = useState("");
  const [replyImage, setReplyImage] = useState("");

  // Tags & Live Search Suggestions State
  const [newThreadTags, setNewThreadTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  // Debounced live search suggestions fetch
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const token = sessionStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/forums/search?q=${encodeURIComponent(searchTerm)}`, config);
        setSuggestions(data || []);
        setShowSuggestionsDropdown(true);
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [selectedPublicUserId, setSelectedPublicUserId] = useState(null);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

  // Forum Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { type: 'thread'|'reply', id: string }
  const [isReportingContent, setIsReportingContent] = useState(false);

  const openPublicProfile = (userId) => {
    if (userId) {
      if (userId === user?._id) {
        setIsMyProfileOpen(true);
      } else {
        setSelectedPublicUserId(userId);
        setIsPublicProfileOpen(true);
      }
    }
  };

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
    const handleDocumentClick = (e) => {
      if (activeDropdown.id !== null) {
        setActiveDropdown({ type: null, id: null });
      }
      if (!e.target.closest('.search-container')) {
        setShowSuggestionsDropdown(false);
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
      const startTime = performance.now();
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/forums", config);
        const totalDuration = (performance.now() - startTime).toFixed(1);
        console.log(`⏱ [Client Performance] Forum list load time: ${totalDuration} ms (< 3000ms target)`);
        const loadedThreads = data.threads || [];
        setThreads(loadedThreads);

        // The list endpoint stamps isSaved on each thread, so the initial
        // bookmark state comes back with the feed — no second request.
        const initialBookmarks = {};
        loadedThreads.forEach((thread) => {
          if (thread.isSaved) initialBookmarks[thread._id] = true;
        });
        setBookmarkedIds(initialBookmarks);
      } catch (error) {
        console.error("Error fetching forums:", error);
      } finally {
        setThreadsLoaded(true);
      }
    };

    if (user) {
      fetchForumThreads();

      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        console.log("[Socket] Connected to forum updates socket");
      });

      socket.on("new_forum_thread", (data) => {
        if (data && data.thread) {
          if (data.sentAt) {
            const latencyMs = Date.now() - data.sentAt;
            console.log(`⚡ [Live Update Latency] New discussion reached client in ${latencyMs} ms (< 2000ms target)`);
          }
          setThreads((prevThreads) => {
            const exists = prevThreads.some((t) => t._id === data.thread._id);
            if (exists) return prevThreads;
            return [data.thread, ...prevThreads];
          });
        }
      });

      socket.on("new_reply", (data) => {
        if (data && data.threadId) {
          if (data.sentAt) {
            const latencyMs = Date.now() - data.sentAt;
            console.log(`⚡ [Live Update Latency] Reply reached client in ${latencyMs} ms (< 2000ms target)`);
          }
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

  // ── BOOKMARKS ──
  // BookmarkButton has already called the API and rolled itself back on
  // failure; this only mirrors the confirmed result into page state so the
  // icon stays correct when the list re-renders.
  const handleBookmarkToggle = useCallback((threadId, isSaved) => {
    setBookmarkedIds((prev) => {
      const next = { ...prev };
      if (isSaved) next[threadId] = true;
      else delete next[threadId];
      return next;
    });
    showToast(
      isSaved ? "Discussion saved to bookmarks." : "Discussion removed from bookmarks.",
      "success"
    );
  }, [showToast]);

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

  // Sync thread when location.state is updated dynamically (e.g. from topbar notification click)
  useEffect(() => {
    if (location.state?.threadId) {
      setSelectedThreadId(location.state.threadId);
      handleThreadClick(location.state.threadId);
    }
  }, [location.state?.threadId, handleThreadClick]);

  const handleCancelModal = () => {
    setIsCreateOpen(false);
    setEditingThreadId(null);
    setNewThreadTitle("");
    setNewThreadContent("");
    setNewThreadImage("");
    setNewThreadTags([]);
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

  // Opens the report reason modal; actual submission happens in handleReportConfirm
  const handleReportContent = (type, id) => {
    setReportTarget({ type, id });
    setIsReportModalOpen(true);
    setActiveDropdown({ type: null, id: null });
  };

  // Called when the user picks a reason and clicks Submit in ForumReportModal
  const handleReportConfirm = async (reason, details) => {
    if (!reportTarget) return;
    const { type, id } = reportTarget;
    setIsReportingContent(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (type === 'thread') {
        const { data } = await axios.post(`/api/forums/${id}/report`, { reason, details }, config);
        showToast(data.message || "Discussion thread has been reported.", 'success');
        setThreads((prev) => prev.filter((t) => t._id !== id));
        if (selectedThreadId === id) {
          setSelectedThreadId(null);
          setActiveThread(null);
        }
      } else if (type === 'reply') {
        if (!activeThread) return;
        const { data } = await axios.post(
          `/api/forums/${activeThread._id}/replies/${id}/report`,
          { reason, details },
          config
        );
        showToast(data.message || "Comment has been reported.", 'success');
        setActiveThread((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            replies: prev.replies.map((r) => r._id === id ? { ...r, isHidden: true } : r)
          };
        });
      }

      setIsReportModalOpen(false);
      setReportTarget(null);
    } catch (error) {
      console.error(`Error reporting ${type}:`, error);
      showToast(error.response?.data?.message || `Failed to report ${type}.`, 'error');
    } finally {
      setIsReportingContent(false);
    }
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
          content: newThreadContent,
          image: newThreadImage,
          tags: newThreadTags
        }, config);

        if (data.underReview) {
          showToast("Your updated post is under review by AI moderation.", 'warning');
        } else {
          showToast("Discussion updated successfully.", 'success');
          setThreads((prev) =>
            prev.map((t) =>
              t._id === editingThreadId
                ? { ...t, title: newThreadTitle, image: newThreadImage, tags: newThreadTags }
                : t
            )
          );
          setActiveThread((prev) => {
            if (prev && prev._id === editingThreadId) {
              return { ...prev, title: newThreadTitle, content: newThreadContent, image: newThreadImage, tags: newThreadTags };
            }
            return prev;
          });
        }
        setEditingThreadId(null);
      } else {
        const { data } = await axios.post("/api/forums", {
          title: newThreadTitle,
          content: newThreadContent,
          image: newThreadImage,
          tags: newThreadTags
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
      setNewThreadImage("");
      setNewThreadTags([]);
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
        image: replyImage,
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
      setReplyImage("");
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
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t('Loading your profile...')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F0] font-sans text-[#211A24] animate-fade-in">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6 max-w-full [&>*]:animate-fade-in">
          
          {/* Hero Banner (Matching Design Mockup) */}
          <div className="bg-[#071A35] rounded-[1.5rem] p-5 sm:p-7 text-white border border-white/10 shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col text-left z-10">
              <h1 className="text-[22px] sm:text-[26px] font-black text-white leading-tight tracking-tight mb-1.5">
                Campus Discussions
              </h1>
              <p className="text-[11.5px] sm:text-[12px] font-semibold text-white/70 max-w-[550px] leading-relaxed m-0">
                Share what matters, find your people, and keep the campus conversation moving.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingThreadId(null);
                setNewThreadTitle("");
                setNewThreadContent("");
                setNewThreadImage("");
                setIsCreateOpen(true);
              }}
              className="bg-[#00c2cb] hover:bg-[#00a8b5] text-white font-black px-5 py-3 rounded-full text-[12px] sm:text-[12.5px] transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 z-10 hover:scale-105 active:scale-95 border-none"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>{t("Start a Discussion")}</span>
            </button>
          </div>

          {/* Search & Category Filter Section */}
          <div className="relative z-50 bg-white rounded-[1.5rem] border border-[#E8E1D5] p-4 flex flex-col gap-3 shadow-[0_8px_25px_rgba(7,26,53,0.04)]">
            {/* Search Input */}
            <div className="search-container relative flex items-center w-full z-50">
              <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder={t("Search topics, tags, or peers...")}
                className="bg-[#FAF7F0] border border-[#E8E1D5] rounded-full pl-10 pr-4 py-2.5 text-[12px] font-medium text-[#211A24] placeholder-[#211A24]/50 outline-none w-full shadow-inner focus:ring-2 focus:ring-[#071A35]/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestionsDropdown(true); }}
              />

              {/* Live Autocomplete Suggestions Dropdown */}
              {showSuggestionsDropdown && (
                <div className="absolute left-0 right-0 top-[108%] z-[9999] bg-white border border-[#E8E1D5] rounded-2xl shadow-[0_20px_50px_rgba(7,26,53,0.25)] overflow-hidden text-left animate-modal-fade-in p-2.5">
                  <div className="flex justify-between items-center px-3 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-lightbulb text-[#00c2cb]" />
                      <span>{isSearchingSuggestions ? t("Searching...") : t("Matching Discussions")}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestionsDropdown(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <i className="fa-solid fa-xmark text-[10px]" />
                      <span>{t("Close")}</span>
                    </button>
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto scrollbar-none">
                      {suggestions.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setShowSuggestionsDropdown(false);
                            handleThreadClick(item._id);
                            setMobileView("detail");
                          }}
                          className="p-2.5 rounded-xl hover:bg-[#FAF7F0] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author?.name || "Student")}&background=071A35&color=fff`}
                              alt="Avatar"
                              className="w-7 h-7 rounded-full object-cover border border-[#071A35]/10 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[12.5px] font-bold text-[#071A35] group-hover:text-[#00c2cb] transition-colors truncate m-0">
                                {item.title}
                              </h4>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  {item.tags.slice(0, 3).map((tg, i) => (
                                    <span key={i} className="text-[9.5px] font-bold text-[#00c2cb] bg-[#00c2cb]/10 px-1.5 py-0.2 rounded">
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <i className="fa-solid fa-comment text-[10px]" />
                              <span>{item.repliesCount || 0}</span>
                            </span>
                            <i className="fa-solid fa-arrow-right text-[10px] text-slate-400 group-hover:text-[#071A35] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-[11.5px] font-semibold text-slate-400">
                      {t("No related discussions found")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {/* Saved items. Pushed to the far right and given the accent
                  treatment so it reads as an action, not another category. */}
              {categoriesList.map((cat) => {
                const isActiveCat = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[11.5px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                      isActiveCat
                        ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                        : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}

              <button
                onClick={() => navigate("/bookmarks")}
                title={t("View your saved posts")}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11.5px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border border-[#E8E1D5] bg-[#FAF7F0] text-[#211A24]/70 hover:bg-[#00c2cb]/10 hover:border-[#00c2cb] hover:text-[#00808a]"
              >
                <i className="fa-solid fa-bookmark text-xs flex items-center justify-center" />
                {t("Saved")}
              </button>
            </div>
          </div>

          {/* ── SPLIT LAYOUT ── */}
          <div className={`flex-1 ${selectedThreadId ? "grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-230px)] min-h-[480px] max-h-[720px] max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] max-lg:rounded-none" : "w-full"} rounded-2xl overflow-hidden`}>
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
              onAvatarClick={openPublicProfile}
              showBookmark
              bookmarkedIds={bookmarkedIds}
              onBookmarkToggle={handleBookmarkToggle}
              onBookmarkError={(message) => showToast(message, "error")}
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
                  setNewThreadImage(thread.image || "");
                  setIsCreateOpen(true);
                }}
                onDeleteThread={handleDeleteThread}
                onReportContent={handleReportContent}
                formatDate={formatDate}
                getCategoryTag={getCategoryTag}
                t={t}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyImage={replyImage}
                setReplyImage={setReplyImage}
                onClose={() => {
                  setSelectedThreadId(null);
                  setActiveThread(null);
                  setReplyingTo(null);
                  setReplyImage("");
                  if (location.state?.threadId) {
                    navigate(location.pathname, { replace: true, state: {} });
                  }
                }}
                onAvatarClick={openPublicProfile}
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
        postImage={newThreadImage}
        setPostImage={setNewThreadImage}
        tags={newThreadTags}
        setTags={setNewThreadTags}
        onSubmit={handleCreateThreadSubmit}
        onCancel={handleCancelModal}
        isSubmitting={isSubmittingThread}
        t={t}
      />

      {/* ── AI MODERATION TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="text-[18px] mt-0.5 flex items-center justify-center">
            {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation text-amber-500" />}
            {toast.type === 'error' && <i className="fa-solid fa-circle-xmark text-red-500" />}
            {toast.type === 'success' && <i className="fa-solid fa-circle-check text-emerald-500" />}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info text-[#00c2cb]" />}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === 'warning' ? 'AI Moderation Alert'
                : toast.type === 'error' ? 'Error'
                  : toast.type === 'success' ? 'Success' : 'Notice'}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button className="text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1 p-1" onClick={() => setToast(null)}>
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>
      )}


      {/* Forum Report Modal */}
      <ForumReportModal
        isOpen={isReportModalOpen}
        onClose={() => { setIsReportModalOpen(false); setReportTarget(null); }}
        onConfirm={handleReportConfirm}
        type={reportTarget?.type || 'thread'}
        isSubmitting={isReportingContent}
      />

      {/* Profile Modals */}
      <PublicProfileModal
        isOpen={isPublicProfileOpen}
        onClose={() => {
          setIsPublicProfileOpen(false);
          setSelectedPublicUserId(null);
        }}
        userId={selectedPublicUserId}
        currentUser={user}
      />
      <MyProfileModal
        isOpen={isMyProfileOpen}
        onClose={() => setIsMyProfileOpen(false)}
        user={user}
        onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          // Sync with local session storage
          const userStr = sessionStorage.getItem("user");
          if (userStr) {
            try {
              const parsed = JSON.parse(userStr);
              sessionStorage.setItem("user", JSON.stringify({ ...parsed, ...updatedUser }));
            } catch (e) {}
          }
        }}
      />
    </div>
  );
}
