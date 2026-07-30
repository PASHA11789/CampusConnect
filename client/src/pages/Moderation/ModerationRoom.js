import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDate, SOCKET_URL, getInitials } from "../../utils/helpers";
import { io } from "socket.io-client";
import { createPortal } from "react-dom";

// Layout & Modal Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import PublicProfileModal from "../../components/profile/PublicProfileModal";

const t = (s) => s;

export default function ModerationRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states for inspecting profiles and posts
  const [profileModalUserId, setProfileModalUserId] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);

  // Moderation state
  const [activeTab, setActiveTab] = useState("forums");
  const [queue, setQueue] = useState({ forums: [], petitions: [], lostFound: [], oldUnclaimed: [], profileReports: [], complaints: [] });
  const [counts, setCounts] = useState({ forums: 0, petitions: 0, lostFound: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, targetId: null, extraId: null });

  // ── TOAST NOTIFICATION HELPER ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  // Helper for letter-based avatar
  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  // Fetch queue from backend
  const fetchQueue = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/moderation/queue", config);
      setQueue(data.queue || { forums: [], petitions: [], lostFound: [], oldUnclaimed: [], profileReports: [] });
      setCounts(data.counts || { forums: 0, petitions: 0, lostFound: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      if (error.response?.status === 401) {
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showToast("Session expired or invalid token. Please log in again.", "error");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      showToast(error.response?.data?.message || "Failed to load moderation queue.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showToast]);

  // Authenticate user on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
        if (parsedUser.role !== "admin" && parsedUser.role !== "student_mod" && parsedUser.role !== "campus_admin") {
          navigate("/dashboard");
          return;
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

        if (data.role !== "admin" && data.role !== "student_mod" && data.role !== "campus_admin") {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Fetch queue & set up websocket connections
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "student_mod" || user.role === "campus_admin")) {
      fetchQueue();

      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        socket.emit("join_room", "mod_room");
        if (user.department) {
          socket.emit("join_room", `mod_room_${user.department}`);
        }
      });

      socket.on("new_reported_content", (data) => {
        showToast(data.message || "New flagged item submitted.", "info");
        fetchQueue();
      });

      socket.on("new_flagged_content", (data) => {
        showToast(data.message || "New flagged Lost & Found item submitted.", "info");
        fetchQueue();
      });

      socket.on("new_petition_pending", () => {
        showToast("New petition pending moderator approval.", "info");
        fetchQueue();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, fetchQueue, showToast]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      };
      const { data } = await axios.post("/api/auth/avatar", formData, config);
      setAvatar(data.avatarUrl);
      setUser(prev => ({ ...prev, avatar: data.avatarUrl }));
      const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.avatar = data.avatarUrl;
        sessionStorage.setItem("user", JSON.stringify(u));
        localStorage.setItem("user", JSON.stringify(u));
      }
      showToast("Profile avatar updated!", "success");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast("Failed to update avatar.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const getAuthToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");

  // Restore Flagged Forum Thread
  const handleRestoreThread = async (threadId) => {
    setActioningId(threadId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/forums/${threadId}/restore`, {}, config);
      showToast("Thread restored successfully.", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to restore thread:", error);
      showToast(error.response?.data?.message || "Failed to restore thread.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Restore Flagged Career Thread
  const handleRestoreCareerThread = async (threadId) => {
    setActioningId(threadId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/moderation/career/${threadId}/moderate`, { action: "Approve" }, config);
      showToast("Career post approved and restored.", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to restore career thread:", error);
      showToast(error.response?.data?.message || "Failed to restore career post.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Restore Flagged Comment/Reply
  const handleRestoreReply = async (threadId, replyId, replyType = 'forum_reply') => {
    setActioningId(replyId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = replyType === 'forum_reply'
        ? `/api/forums/${threadId}/replies/${replyId}/restore`
        : `/api/careers/${threadId}/replies/${replyId}/restore`;

      await axios.put(endpoint, {}, config);
      showToast("Comment restored successfully.", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to restore reply:", error);
      showToast(error.response?.data?.message || "Failed to restore comment.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Trigger delete confirmation modal for threads
  const handleDeleteThread = (threadId, isCareer = false) => {
    setDeleteConfirm({ isOpen: true, type: isCareer ? "career" : "thread", targetId: threadId });
  };

  // Trigger delete confirmation modal for replies/comments
  const handleDeleteReply = (threadId, replyId, replyType = 'forum_reply') => {
    setDeleteConfirm({
      isOpen: true,
      type: replyType === 'forum_reply' ? "comment" : "career_reply",
      targetId: replyId,
      extraId: threadId
    });
  };

  // Perform actual deletion of flagged thread or comment
  const confirmDelete = async () => {
    const { type, targetId, extraId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, type: null, targetId: null, extraId: null });
    setActioningId(targetId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (type === "thread") {
        await axios.delete(`/api/forums/${targetId}`, config);
        showToast("Thread permanently deleted.", "success");
      } else if (type === "career") {
        await axios.put(`/api/moderation/career/${targetId}/moderate`, { action: "Reject" }, config);
        showToast("Career post permanently deleted.", "success");
      } else if (type === "comment") {
        await axios.delete(`/api/forums/${extraId}/replies/${targetId}`, config);
        showToast("Comment permanently deleted.", "success");
      } else if (type === "career_reply") {
        await axios.delete(`/api/careers/${extraId}/replies/${targetId}`, config);
        showToast("Career reply permanently deleted.", "success");
      }
      fetchQueue();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      showToast(error.response?.data?.message || `Failed to delete ${type}.`, "error");
    } finally {
      setActioningId(null);
    }
  };

  // Moderate Petition (Approve/Reject)
  const handleModeratePetition = async (petitionId, action) => {
    setActioningId(petitionId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/petitions/${petitionId}/moderate`, { action }, config);
      showToast(data.message || `Petition ${action}ed successfully.`, "success");
      fetchQueue();
    } catch (error) {
      console.error(`Failed to ${action} petition:`, error);
      showToast(error.response?.data?.message || `Failed to ${action} petition.`, "error");
    } finally {
      setActioningId(null);
    }
  };

  // Moderate Lost & Found (Approve/Reject)
  const handleModerateLostFound = async (itemId, action) => {
    setActioningId(itemId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/moderation/lostfound/${itemId}/moderate`, { action }, config);
      showToast(data.message || `Lost & Found item ${action}ed successfully.`, "success");
      fetchQueue();
    } catch (error) {
      console.error(`Failed to ${action} Lost & Found item:`, error);
      showToast(error.response?.data?.message || `Failed to ${action} Lost & Found item.`, "error");
    } finally {
      setActioningId(null);
    }
  };

  // Delete Old Unclaimed Lost & Found Item
  const handleDeleteOldUnclaimed = async (itemId) => {
    setActioningId(itemId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/lost-found/${itemId}`, config);
      showToast("Old unclaimed item successfully removed to clear clutter.", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to delete unclaimed item:", error);
      showToast(error.response?.data?.message || "Failed to delete unclaimed item.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Sanitize obscene avatar and issue disciplinary warning to student
  const handleSanitizeAndWarnUser = async (targetUserId, reportId) => {
    if (!targetUserId) {
      showToast("Cannot warn user: User ID unavailable.", "error");
      return;
    }
    setActioningId(reportId || targetUserId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post(`/api/users/${targetUserId}/warn`, {
        reason: "Obscene Avatar / Guidelines Violation",
        details: "Your profile picture was removed and reset to default by Campus Moderation due to community guidelines violation.",
        sanitizeAvatar: true
      }, config);

      if (reportId) {
        await axios.put(`/api/moderation/profile_report/${reportId}/moderate`, { action: "Approve" }, config);
      }

      showToast("Avatar reset to default and warning card issued to student screen!", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to sanitize avatar:", error);
      showToast(error.response?.data?.message || "Failed to issue warning.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Moderate Profile Report (Approve/Reject)
  const handleModerateProfileReport = async (reportId, action) => {
    setActioningId(reportId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/moderation/profile_report/${reportId}/moderate`, { action }, config);
      showToast(data.message || `Profile report ${action === "Approve" ? "resolved" : "dismissed"}.`, "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to moderate profile report:", error);
      showToast(error.response?.data?.message || "Failed to moderate profile report.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Moderate Complaint or Suggestion (Approve/Reject)
  const handleModerateComplaint = async (complaintId, action) => {
    setActioningId(complaintId);
    try {
      const token = getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/moderation/complaint/${complaintId}/moderate`, { action }, config);
      showToast(data.message || `Complaint ${action === "Approve" ? "resolved" : "dismissed"}.`, "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to moderate complaint:", error);
      showToast(error.response?.data?.message || "Failed to moderate complaint.", "error");
    } finally {
      setActioningId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#FAF7F0]">
        <div className="w-9 h-9 border-3 border-[#E8E1D5] border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14px] font-bold">{t('Loading moderation portal...')}</p>
      </div>
    );
  }

  // Helper to retrieve formatted item reports (Forum & Careers)
  const getFlaggedReplies = () => {
    const repliesList = [];

    // Forum replies
    if (queue.forums) {
      queue.forums.forEach((thread) => {
        if (thread.replies && thread.replies.length > 0) {
          thread.replies.forEach((reply) => {
            if (reply.isHidden || (reply.reportedBy && reply.reportedBy.length > 0)) {
              repliesList.push({
                threadId: thread._id,
                threadTitle: thread.title,
                reply: reply,
                type: 'forum_reply'
              });
            }
          });
        }
      });
    }

    // Career path replies
    if (queue.careers) {
      queue.careers.forEach((thread) => {
        if (thread.replies && thread.replies.length > 0) {
          thread.replies.forEach((reply) => {
            if (reply.isHidden || (reply.reportedBy && reply.reportedBy.length > 0)) {
              repliesList.push({
                threadId: thread._id,
                threadTitle: thread.title,
                reply: reply,
                type: 'career_reply'
              });
            }
          });
        }
      });
    }

    return repliesList;
  };

  const flaggedReplies = getFlaggedReplies();
  const reportedForums = queue.forums?.filter(thread => thread.isHidden || (thread.reportedBy && thread.reportedBy.length > 0)) || [];
  const reportedCareers = queue.careers?.filter(thread => thread.isHidden || (thread.reportedBy && thread.reportedBy.length > 0)) || [];

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F0] font-sans text-slate-800 animate-fade-in">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-full">

          {/* ── HERO BANNER ── */}
          <div className="bg-[#071A35] rounded-[1.5rem] p-5 sm:p-7 text-white border border-white/10 shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            {/* Glow Accents */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col text-left z-10">
              <div className="bg-white/10 text-[#00c2cb] text-[10px] sm:text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-2.5 border border-white/10">
                <span>⚖️</span>
                <span>COMMUNITY SAFETY &amp; MODERATION</span>
              </div>
              <h1 className="text-[22px] sm:text-[26px] font-black text-white leading-tight tracking-tight mb-1">
                Moderator Control Room
              </h1>
              <p className="text-[11.5px] sm:text-[12px] font-semibold text-white/70 max-w-[600px] leading-relaxed m-0">
                Enforce Minhaj University academic community guidelines, review pending petitions, evaluate reported content, and inspect user profiles.
              </p>
            </div>

            <button
              onClick={fetchQueue}
              disabled={isLoading}
              className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-[12px] sm:text-[12.5px] transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 z-10 hover:scale-105 active:scale-95 border-none disabled:opacity-50"
            >
              <span className={`text-sm ${isLoading ? 'animate-spin' : ''}`}>🔄</span> Refresh Queue
            </button>
          </div>

          {/* ── METRIC STAT CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#071A35]/10 text-[#071A35] flex items-center justify-center text-lg shrink-0">
                🛡️
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{counts.total}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">Total Queue</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-lg shrink-0">
                💬
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{reportedForums.length + reportedCareers.length + flaggedReplies.length}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">Flagged Posts</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00c2cb]/15 text-[#00a8b5] flex items-center justify-center text-lg shrink-0">
                📋
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{queue.petitions.length}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">Pending Petitions</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                🔍
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{queue.lostFound?.length || 0}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">Lost &amp; Found</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-lg shrink-0">
                👤
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{queue.profileReports?.length || 0}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">User Reports</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E1D5] p-3.5 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg shrink-0">
                💡
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[19px] font-black text-[#071A35] leading-none">{queue.complaints?.length || 0}</span>
                <span className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">Complaints &amp; Suggestions</span>
              </div>
            </div>
          </div>

          {/* ── CATEGORY TAB NAVIGATION BAR ── */}
          <div className="bg-white rounded-[1.5rem] border border-[#E8E1D5] p-2.5 sm:p-3 shadow-[0_8px_25px_rgba(7,26,53,0.04)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
              <button
                onClick={() => setActiveTab("forums")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none w-full ${activeTab === "forums"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>💬</span>
                <span className="truncate">Discussions</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "forums" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {reportedForums.length + reportedCareers.length + flaggedReplies.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("petitions")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none w-full ${activeTab === "petitions"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>📋</span>
                <span className="truncate">Petitions</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "petitions" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {queue.petitions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("lostfound")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none w-full ${activeTab === "lostfound"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>🔍</span>
                <span className="truncate">Lost &amp; Found</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "lostfound" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {queue.lostFound?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("oldUnclaimed")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none w-full ${activeTab === "oldUnclaimed"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>🧹</span>
                <span className="truncate">Old Unclaimed</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "oldUnclaimed" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {queue.oldUnclaimed?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("profileReports")}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none w-full ${activeTab === "profileReports"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>👤</span>
                <span className="truncate">User Reports</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "profileReports" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {queue.profileReports?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("complaints")}
                className={`px-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 border-none w-full min-w-0 overflow-hidden ${activeTab === "complaints"
                    ? "bg-[#00c2cb] text-[#071A35] shadow-sm scale-102"
                    : "bg-[#FAF7F0] text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                <span>💡</span>
                <span className="truncate min-w-0">Complaints</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${activeTab === "complaints" ? "bg-[#071A35] text-[#00c2cb]" : "bg-slate-200 text-slate-700"}`}>
                  {queue.complaints?.length || 0}
                </span>
              </button>
            </div>
          </div>

          {/* ── MAIN CONTENT CONTAINER ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-[1.5rem] border border-[#E8E1D5] shadow-sm">
              <div className="w-9 h-9 border-3 border-[#E8E1D5] border-t-[#00c2cb] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400">{t("Loading moderation queue items...")}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6">

              {/* ──── TAB 1: FORUMS & DISCUSSIONS ──── */}
              {activeTab === "forums" && (
                <div className="flex flex-col gap-8">

                  {/* Flagged Forum Threads */}
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                        📁 Reported Discussion Threads ({reportedForums.length})
                      </h3>
                    </div>

                    {reportedForums.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {reportedForums.map((thread) => (
                          <div
                            key={thread._id}
                            className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-4 text-left hover:border-[#00c2cb] transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                                  Flagged Forum Thread
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-bold">
                                  Author: <strong className="text-[#071A35]">{thread.author?.registeration_number || thread.author?.name || "Student"}</strong> • {formatDate(thread.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {thread.author?._id && (
                                  <button
                                    onClick={() => setProfileModalUserId(thread.author._id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                    title="View Author Profile"
                                  >
                                    👤 Author Profile
                                  </button>
                                )}
                                <button
                                  onClick={() => setInspectItem({ type: 'forum_thread', title: thread.title, content: thread.content, author: thread.author, createdAt: thread.createdAt, reportedBy: thread.reportedBy, id: thread._id })}
                                  className="bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  👁️ Inspect Content
                                </button>
                                <button
                                  disabled={actioningId === thread._id}
                                  onClick={() => handleRestoreThread(thread._id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  ✅ Keep
                                </button>
                                <button
                                  disabled={actioningId === thread._id}
                                  onClick={() => handleDeleteThread(thread._id, false)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[15.5px] font-black text-[#071A35] mb-1.5">{thread.title}</h4>
                              <p className="text-[12.5px] font-semibold text-slate-600 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E8E1D5]/70 leading-relaxed max-h-[140px] overflow-y-auto custom-scrollbar m-0">
                                {thread.content}
                              </p>
                            </div>

                            {thread.reportedBy && thread.reportedBy.length > 0 && (
                              <div className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg w-fit flex items-center gap-1.5">
                                ⚠️ Reported by community ({thread.reportedBy.length} report)
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-8 text-center text-slate-400 font-bold shadow-xs">
                        ✨ No reported discussion threads in the queue.
                      </div>
                    )}
                  </div>

                  {/* Flagged Career Threads */}
                  <div className="flex flex-col gap-3.5">
                    <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                      💼 Reported Career Threads ({reportedCareers.length})
                    </h3>

                    {reportedCareers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {reportedCareers.map((thread) => (
                          <div
                            key={thread._id}
                            className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-4 text-left hover:border-[#00c2cb] transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                                  Flagged Career Post
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-bold">
                                  Author: <strong className="text-[#071A35]">{thread.author?.registeration_number || thread.author?.name || "Student"}</strong> • {formatDate(thread.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {thread.author?._id && (
                                  <button
                                    onClick={() => setProfileModalUserId(thread.author._id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                    title="View Author Profile"
                                  >
                                    👤 Author Profile
                                  </button>
                                )}
                                <button
                                  onClick={() => setInspectItem({ type: 'career_thread', title: thread.title, content: thread.content, author: thread.author, createdAt: thread.createdAt, reportedBy: thread.reportedBy, id: thread._id })}
                                  className="bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  👁️ Inspect Content
                                </button>
                                <button
                                  disabled={actioningId === thread._id}
                                  onClick={() => handleRestoreCareerThread(thread._id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  ✅ Keep
                                </button>
                                <button
                                  disabled={actioningId === thread._id}
                                  onClick={() => handleDeleteThread(thread._id, true)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[15.5px] font-black text-[#071A35] mb-1.5">{thread.title}</h4>
                              <p className="text-[12.5px] font-semibold text-slate-600 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E8E1D5]/70 leading-relaxed max-h-[140px] overflow-y-auto custom-scrollbar m-0">
                                {thread.content}
                              </p>
                            </div>

                            {thread.reportedBy && thread.reportedBy.length > 0 && (
                              <div className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg w-fit flex items-center gap-1.5">
                                ⚠️ Reported by community ({thread.reportedBy.length} report)
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-8 text-center text-slate-400 font-bold shadow-xs">
                        ✨ No reported career threads in the queue.
                      </div>
                    )}
                  </div>

                  {/* Flagged Comments & Replies */}
                  <div className="flex flex-col gap-3.5">
                    <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                      💬 Reported Comments &amp; Replies ({flaggedReplies.length})
                    </h3>

                    {flaggedReplies.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {flaggedReplies.map(({ threadId, threadTitle, reply, type }) => (
                          <div
                            key={reply._id}
                            className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-3 text-left hover:border-[#00c2cb] transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                  {type === 'forum_reply' ? 'Forum Comment' : 'Career Comment'}
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-bold">
                                  Thread: <strong className="text-[#071A35]">"{threadTitle}"</strong> • {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {reply.author?._id && (
                                  <button
                                    onClick={() => setProfileModalUserId(reply.author._id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                    title="View Comment Author Profile"
                                  >
                                    👤 Author Profile
                                  </button>
                                )}
                                <button
                                  onClick={() => setInspectItem({ type: type === 'forum_reply' ? 'Forum Comment' : 'Career Comment', title: threadTitle, content: reply.content, author: reply.author, createdAt: reply.createdAt, reportedBy: reply.reportedBy, id: reply._id })}
                                  className="bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  👁️ Inspect Comment
                                </button>
                                <button
                                  disabled={actioningId === reply._id}
                                  onClick={() => handleRestoreReply(threadId, reply._id, type)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  ✅ Keep
                                </button>
                                <button
                                  disabled={actioningId === reply._id}
                                  onClick={() => handleDeleteReply(threadId, reply._id, type)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[11.5px] text-slate-400 font-extrabold">
                                Comment Author: <strong className="text-[#071A35]">{reply.author?.registeration_number || reply.author?.name || "Student"}</strong>
                              </span>
                              <p className="text-[12.5px] font-semibold text-slate-700 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E8E1D5]/70 leading-relaxed m-0">
                                {reply.content}
                              </p>
                            </div>

                            {reply.reportedBy && reply.reportedBy.length > 0 && (
                              <div className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg w-fit flex items-center gap-1.5">
                                ⚠️ Reported by community ({reply.reportedBy.length} report)
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E8E1D5] rounded-2xl p-8 text-center text-slate-400 font-bold shadow-xs">
                        ✨ No reported comments or replies in the queue.
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ──── TAB 2: PETITIONS ──── */}
              {activeTab === "petitions" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                    📋 Petitions Awaiting Review ({queue.petitions.length})
                  </h3>

                  {queue.petitions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {queue.petitions.map((petition) => (
                        <div
                          key={petition._id}
                          className="bg-white border border-[#E8E1D5] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-4 text-left hover:border-[#00c2cb] transition-all"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                                  {petition.level} Scope
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-bold">
                                  Created by <strong className="text-[#071A35]">{petition.creator?.registeration_number || petition.creator?.name}</strong> • {formatDate(petition.createdAt)}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#00a8b5] font-black uppercase">
                                🎯 Target Milestone: {petition.milestone ? `${petition.milestone} signatures required` : "Open Goal"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              {petition.creator?._id && (
                                <button
                                  onClick={() => setProfileModalUserId(petition.creator._id)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                  title="View Creator Profile"
                                >
                                  👤 Creator Profile
                                </button>
                              )}
                              <button
                                onClick={() => setInspectItem({ type: 'petition', title: petition.title, content: petition.description, author: petition.creator, createdAt: petition.createdAt, level: petition.level, milestone: petition.milestone, id: petition._id })}
                                className="bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                              >
                                👁️ Inspect Petition
                              </button>
                              <button
                                disabled={actioningId === petition._id}
                                onClick={() => handleModeratePetition(petition._id, "Approve")}
                                className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] px-3.5 py-1.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all shadow-sm border-none cursor-pointer flex items-center gap-1"
                              >
                                ✅ Approve
                              </button>
                              <button
                                disabled={actioningId === petition._id}
                                onClick={() => handleModeratePetition(petition._id, "Reject")}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[16px] font-black text-[#071A35] mb-2">{petition.title}</h4>
                            <p className="text-[12.5px] font-semibold text-slate-600 bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E1D5]/70 leading-relaxed m-0">
                              {petition.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-400 font-bold shadow-xs flex flex-col items-center gap-2">
                      <span className="text-3xl">🎉</span>
                      <span>No petitions awaiting moderation approval!</span>
                    </div>
                  )}
                </div>
              )}

              {/* ──── TAB 3: LOST & FOUND ──── */}
              {activeTab === "lostfound" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                    🔍 Lost &amp; Found Items Awaiting Review ({queue.lostFound?.length || 0})
                  </h3>

                  {queue.lostFound && queue.lostFound.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {queue.lostFound.map((item) => (
                        <div
                          key={item._id}
                          className="bg-white border border-[#E8E1D5] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-4 text-left hover:border-[#00c2cb] transition-all"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${item.type === "LOST"
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}>
                                  {item.type} ITEM
                                </span>
                                <span className="text-[11.5px] text-slate-500 font-bold">
                                  Reported by <strong className="text-[#071A35]">{item.reporter?.registeration_number || item.reporter?.name}</strong> • {formatDate(item.createdAt)}
                                </span>
                              </div>
                              <span className="text-[11.5px] text-slate-600 font-bold">
                                📍 Location: <span className="text-[#071A35]">{item.location}</span> {item.surrenderedAt ? `• Surrendered at: ${item.surrenderedAt}` : ""}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              {item.reporter?._id && (
                                <button
                                  onClick={() => setProfileModalUserId(item.reporter._id)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                  title="View Reporter Profile"
                                >
                                  👤 Reporter Profile
                                </button>
                              )}
                              <button
                                onClick={() => setInspectItem({ type: 'Lost & Found', title: item.itemName, content: item.description, author: item.reporter, createdAt: item.createdAt, location: item.location, image: item.image, id: item._id })}
                                className="bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                              >
                                👁️ Inspect Details
                              </button>
                              <button
                                disabled={actioningId === item._id}
                                onClick={() => handleModerateLostFound(item._id, "Approve")}
                                className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] px-3.5 py-1.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all shadow-sm border-none cursor-pointer flex items-center gap-1"
                              >
                                ✅ Approve
                              </button>
                              <button
                                disabled={actioningId === item._id}
                                onClick={() => handleModerateLostFound(item._id, "Reject")}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-4 items-start max-sm:flex-col">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.itemName}
                                className="w-24 h-24 object-cover rounded-xl border border-[#E8E1D5] shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="text-[16px] font-black text-[#071A35] mb-2">{item.itemName}</h4>
                              <p className="text-[12.5px] font-semibold text-slate-600 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E8E1D5]/70 leading-relaxed m-0">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-400 font-bold shadow-xs flex flex-col items-center gap-2">
                      <span className="text-3xl">🎉</span>
                      <span>No Lost &amp; Found items awaiting moderation approval.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ──── TAB 4: OLD UNCLAIMED LOST & FOUND ──── */}
              {activeTab === "oldUnclaimed" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <h3 className="text-[14.5px] font-black text-[#071A35] uppercase tracking-wide flex items-center gap-2">
                      🧹 Unclaimed Posts Older than 10 Days ({queue.oldUnclaimed?.length || 0})
                    </h3>
                    <p className="text-[12px] font-semibold text-slate-500 m-0">
                      These unclaimed Lost &amp; Found items have been open for over 10 days. You can purge old listings to maintain a clean directory.
                    </p>
                  </div>

                  {queue.oldUnclaimed && queue.oldUnclaimed.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {queue.oldUnclaimed.map((item) => {
                        const ageInDays = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div
                            key={item._id}
                            className="bg-white border border-[#E8E1D5] rounded-2xl p-5 shadow-[0_4px_20px_rgba(7,26,53,0.03)] flex flex-col gap-4 text-left hover:border-[#00c2cb] transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${item.type === "LOST"
                                      ? "bg-rose-50 text-rose-600 border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}>
                                    {item.type}
                                  </span>
                                  <span className="text-[11.5px] text-slate-500 font-bold">
                                    Reported by <strong className="text-[#071A35]">{item.reporter?.registeration_number || item.reporter?.name}</strong> • {formatDate(item.createdAt)}
                                  </span>
                                  <span className="text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    ⏳ {ageInDays} days active
                                  </span>
                                </div>
                                <span className="text-[11.5px] text-slate-600 font-bold">
                                  📍 Location: <span className="text-[#071A35]">{item.location}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {item.reporter?._id && (
                                  <button
                                    onClick={() => setProfileModalUserId(item.reporter._id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                    title="View Reporter Profile"
                                  >
                                    👤 Reporter Profile
                                  </button>
                                )}
                                <button
                                  disabled={actioningId === item._id}
                                  onClick={() => handleDeleteOldUnclaimed(item._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-[12px] font-extrabold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                                >
                                  🗑️ Purge &amp; Delete
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start max-sm:flex-col">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.itemName}
                                  className="w-24 h-24 object-cover rounded-xl border border-[#E8E1D5] shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="text-[16px] font-black text-[#071A35] mb-1.5">{item.itemName}</h4>
                                <p className="text-[12.5px] font-semibold text-slate-600 bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E8E1D5]/70 leading-relaxed m-0">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-400 font-bold shadow-xs flex flex-col items-center gap-2">
                      <span className="text-3xl">🧹</span>
                      <span>No unclaimed items older than 10 days in the system.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ──── TAB 5: PROFILE REPORTS ──── */}
              {activeTab === "profileReports" && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-[#071A35] m-0">User Profile Violation Reports</h3>
                      <p className="text-[11.5px] text-slate-500 font-semibold m-0 mt-0.5">Inspect flagged avatars, issue disciplinary warnings, or dismiss report entries.</p>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {queue.profileReports?.length || 0} Reports
                    </span>
                  </div>

                  {queue.profileReports && queue.profileReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {queue.profileReports.map((report) => (
                        <div
                          key={report._id}
                          className="bg-white rounded-[1.5rem] border border-[#E8E1D5] p-5 shadow-xs flex flex-col justify-between gap-4 text-left hover:border-[#00c2cb] transition-all max-w-full min-w-0 overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 min-w-0">
                            {/* Top Header Badges & Date */}
                            <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 text-rose-700 shrink-0">
                                  🚨 Profile Report
                                </span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 max-w-full truncate">
                                  {report.reason || "Guidelines Violation"}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold shrink-0">{formatDate(report.createdAt)}</span>
                            </div>

                            {/* Target User Info Row */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                              <img
                                src={report.targetUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.targetUser?.name || "User")}&background=random`}
                                alt="Target Avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-rose-200 shrink-0"
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <h4 className="text-[14px] font-black text-[#071A35] m-0 leading-tight truncate">
                                  {report.targetUser?.name || "Student User"}
                                </h4>
                                <span className="text-[11px] font-bold text-slate-400 truncate">
                                  {report.targetUser?.registeration_number ? `Reg: ${report.targetUser.registeration_number}` : `ID: ${report.targetUser?._id}`}
                                </span>
                              </div>
                              {report.targetUser?._id && (
                                <button
                                  onClick={() => setProfileModalUserId(report.targetUser._id)}
                                  className="text-[11px] font-extrabold text-[#071A35] hover:text-[#00c2cb] bg-white border border-[#E8E1D5] px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs transition-colors shrink-0"
                                >
                                  👤 Profile
                                </button>
                              )}
                            </div>

                            {/* Report Context Box */}
                            <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#E8E1D5]/70 flex flex-col gap-1 min-w-0">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Report Details</div>
                              <p className="text-[12.5px] font-semibold text-slate-700 leading-relaxed m-0 break-words">
                                {report.details || "No additional context provided."}
                              </p>
                            </div>

                            {/* Reporter Footer Row */}
                            {report.reportedBy && (
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between min-w-0 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-full bg-[#071A35] text-[#00c2cb] flex items-center justify-center font-black text-[10px] shrink-0">
                                    {getInitials(report.reportedBy.name || "R")}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-500 truncate">
                                    Reported by: <strong className="text-[#071A35]">{report.reportedBy.name || "Student"}</strong>
                                  </span>
                                </div>
                                {report.reportedBy._id && (
                                  <button
                                    onClick={() => setProfileModalUserId(report.reportedBy._id)}
                                    className="text-[10.5px] font-bold text-[#00a8b5] hover:underline border-none bg-transparent p-0 cursor-pointer shrink-0"
                                  >
                                    🔍 Reporter Profile
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center gap-2 pt-3 border-t border-[#E8E1D5]/60 flex-wrap sm:flex-nowrap">
                            {report.targetUser?._id && (
                              <button
                                onClick={() => handleSanitizeAndWarnUser(report.targetUser._id, report._id)}
                                disabled={actioningId === report._id}
                                className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50 border-none cursor-pointer text-center whitespace-nowrap"
                              >
                                🚨 Reset &amp; Warn
                              </button>
                            )}
                            <button
                              onClick={() => handleModerateProfileReport(report._id, "Approve")}
                              disabled={actioningId === report._id}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50 border-none cursor-pointer text-center whitespace-nowrap"
                            >
                              ✅ Resolve
                            </button>
                            <button
                              onClick={() => handleModerateProfileReport(report._id, "Reject")}
                              disabled={actioningId === report._id}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 border-none cursor-pointer text-center shrink-0"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-400 font-bold shadow-xs flex flex-col items-center gap-2">
                      <span className="text-3xl">🛡️</span>
                      <span>No pending user profile violation reports.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ──── TAB 6: SUGGESTIONS & COMPLAINTS ──── */}
              {activeTab === "complaints" && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-[#071A35] m-0">Campus Suggestions &amp; Complaints Queue</h3>
                      <p className="text-[11.5px] text-slate-500 font-semibold m-0 mt-0.5">Review, resolve, or dismiss user feedback submitted across the campus portal.</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {queue.complaints?.length || 0} Pending
                    </span>
                  </div>

                  {queue.complaints && queue.complaints.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {queue.complaints.map((item) => (
                        <div key={item._id} className="bg-white rounded-[1.5rem] border border-[#E8E1D5] p-5 shadow-xs flex flex-col justify-between gap-4 max-w-full min-w-0 overflow-hidden">
                          <div className="flex flex-col gap-3 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                  item.type === 'suggestion' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.type === 'suggestion' ? '💡 Suggestion' : '⚠️ Complaint'}
                                </span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 max-w-full truncate">
                                  {item.category || 'General'}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                  item.priority === 'Urgent' ? 'bg-red-100 text-red-700 animate-pulse' :
                                  item.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {item.priority || 'Medium'} Priority
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold shrink-0">{formatDate(item.createdAt)}</span>
                            </div>

                            <h4 className="text-[15px] font-black text-[#071A35] m-0 leading-snug break-words min-w-0 max-w-full">{item.title}</h4>
                            <p className="text-[13px] font-medium text-slate-700 m-0 line-clamp-3 leading-relaxed break-words min-w-0 max-w-full">{item.description}</p>

                            {item.targetDepartment && (
                              <span className="text-[11.5px] font-extrabold text-[#00c2cb] bg-[#071A35]/5 px-3 py-1 rounded-xl w-fit max-w-full break-words min-w-0">
                                🏢 Target Department: {item.targetDepartment}
                              </span>
                            )}

                            {/* Submitter info */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between min-w-0 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#071A35] text-[#00c2cb] flex items-center justify-center font-black text-[11px] shrink-0 overflow-hidden border border-[#E8E1D5]">
                                  {item.isAnonymous ? (
                                    <span>👤</span>
                                  ) : item.submittedBy?.avatar ? (
                                    <img src={item.submittedBy.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{getInitials(item.submittedBy?.name || 'S')}</span>
                                  )}
                                </div>
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-[11.5px] font-extrabold text-[#071A35] truncate">
                                    {item.isAnonymous ? 'Anonymous Student' : (item.submittedBy?.name || 'Student User')}
                                  </span>
                                  {!item.isAnonymous && item.submittedBy?.registeration_number && (
                                    <span className="text-[10px] font-semibold text-slate-400 truncate">{item.submittedBy.registeration_number}</span>
                                  )}
                                </div>
                              </div>
                              {!item.isAnonymous && item.submittedBy?._id && (
                                <button
                                  onClick={() => setProfileModalUserId(item.submittedBy._id)}
                                  className="text-[10.5px] font-bold text-[#071A35] hover:text-[#00c2cb] bg-slate-100 px-2.5 py-1 rounded-lg border-none cursor-pointer shrink-0"
                                >
                                  👤 Profile
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-3 border-t border-[#E8E1D5]/60">
                            <button
                              onClick={() => setInspectItem({
                                type: item.type === 'suggestion' ? 'Suggestion' : 'Complaint',
                                title: item.title,
                                content: item.description,
                                author: item.isAnonymous ? { name: 'Anonymous Student' } : item.submittedBy,
                                createdAt: item.createdAt,
                                id: item._id
                              })}
                              className="flex-1 py-2 px-3 bg-[#071A35]/5 hover:bg-[#071A35]/10 text-[#071A35] border border-[#071A35]/20 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center"
                            >
                              👁️ Inspect
                            </button>
                            <button
                              disabled={actioningId === item._id}
                              onClick={() => handleModerateComplaint(item._id, "Approve")}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50 border-none cursor-pointer text-center"
                            >
                              ✅ Resolve
                            </button>
                            <button
                              disabled={actioningId === item._id}
                              onClick={() => handleModerateComplaint(item._id, "Reject")}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 border-none cursor-pointer text-center"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-400 font-bold shadow-xs flex flex-col items-center gap-2">
                      <span className="text-3xl">💡</span>
                      <span>No pending campus suggestions or complaints.</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Footer branding */}
          <footer className="mt-6 py-4 border-t border-[#E8E1D5]/60 text-center">
            <p className="text-[11.5px] text-slate-400 font-bold tracking-wide m-0">
              {t('© 2026 CampusConnect. Moderation & Guidelines Engine.')}
            </p>
          </footer>

        </div>
      </main>

      {/* ── TOAST ALERT NOTIFICATIONS ── */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-[#E8E1D5] rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' :
            toast.type === 'error' ? 'border-l-4 border-l-red-500' :
              toast.type === 'success' ? 'border-l-4 border-l-[#00c2cb]' :
                'border-l-4 border-l-[#071A35]'
          }`}>
          <div className="text-[18px] mt-0.5">
            {toast.type === 'warning' && <span>⚠️</span>}
            {toast.type === 'error' && <span>❌</span>}
            {toast.type === 'success' && <span>✅</span>}
            {toast.type === 'info' && <span>ℹ️</span>}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 text-left">
            <strong className="text-[13px] font-black text-[#071A35]">
              {toast.type === 'warning' ? 'Warning' :
                toast.type === 'error' ? 'Error' :
                  toast.type === 'success' ? 'Success' : 'Moderator Alert'}
            </strong>
            <p className="text-[12px] font-semibold text-slate-600 leading-normal m-0">{toast.message}</p>
          </div>
          <button className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirm.isOpen && createPortal(
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm z-[4000] flex items-center justify-center p-4 animate-modal-fade-in" onClick={() => setDeleteConfirm({ isOpen: false, type: null, targetId: null, extraId: null })}>
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8E1D5] shadow-2xl overflow-hidden animate-modal-slide-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#071A35] px-6 py-4 flex items-center gap-3 text-white">
              <span className="text-xl">⚠️</span>
              <h3 className="text-base font-black text-white m-0">Confirm Delete Action</h3>
            </div>

            <div className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60">
              <p className="text-[13px] font-semibold text-slate-700 leading-relaxed m-0">
                Are you sure you want to permanently delete this {deleteConfirm.type === 'thread' ? 'discussion thread' : deleteConfirm.type === 'career' ? 'career post' : 'comment'}? This operation cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, type: null, targetId: null, extraId: null })}
                  className="bg-white border border-[#E8E1D5] text-[#071A35] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer border-none"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── INSPECT & VERIFICATION MODAL ── */}
      {inspectItem && createPortal(
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm z-[4000] flex items-center justify-center p-4 animate-modal-fade-in" onClick={() => setInspectItem(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E1D5] shadow-2xl overflow-hidden animate-modal-slide-in text-left flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#071A35] px-6 py-4 flex justify-between items-center text-white border-b border-[#071A35]">
              <div className="flex items-center gap-3">
                <span className="text-xl">👁️</span>
                <h3 className="text-base font-black text-white m-0">Inspect &amp; Verify Moderation Item</h3>
              </div>
              <button onClick={() => setInspectItem(null)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60 overflow-y-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-[#00c2cb] text-[#071A35] uppercase tracking-wider">
                  {inspectItem.type ? inspectItem.type.replace('_', ' ') : 'Item'}
                </span>
                {inspectItem.createdAt && (
                  <span className="text-[11.5px] text-slate-500 font-bold">
                    Submitted: {formatDate(inspectItem.createdAt)}
                  </span>
                )}
              </div>

              {/* Author Info & Visit Profile Button */}
              {inspectItem.author && (
                <div className="bg-white border border-[#E8E1D5] p-3.5 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#071A35] text-[#00c2cb] flex items-center justify-center font-black text-sm">
                      {inspectItem.author.name ? inspectItem.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-black text-[#071A35]">{inspectItem.author.name || "Student User"}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{inspectItem.author.registeration_number || inspectItem.author.email || "ID: " + inspectItem.author._id}</span>
                    </div>
                  </div>
                  {inspectItem.author._id && (
                    <button
                      onClick={() => setProfileModalUserId(inspectItem.author._id)}
                      className="bg-[#071A35] hover:bg-[#00c2cb] hover:text-[#071A35] text-white px-3.5 py-1.5 rounded-xl text-[11.5px] font-extrabold transition-all cursor-pointer border-none flex items-center gap-1.5"
                    >
                      👤 Visit User Profile
                    </button>
                  )}
                </div>
              )}

              {/* Title & Body Content */}
              <div className="bg-white border border-[#E8E1D5] p-4 rounded-2xl flex flex-col gap-2">
                {inspectItem.title && (
                  <h4 className="text-[16px] font-black text-[#071A35] leading-snug m-0">{inspectItem.title}</h4>
                )}
                {inspectItem.content && (
                  <p className="text-[13px] font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap m-0">
                    {inspectItem.content}
                  </p>
                )}
                {inspectItem.location && (
                  <span className="text-[11.5px] text-slate-500 font-bold pt-1">📍 Location: {inspectItem.location}</span>
                )}
                {inspectItem.image && (
                  <img src={inspectItem.image} alt="Reported Attachment" className="w-full max-h-60 object-cover rounded-xl border border-slate-200 mt-2" />
                )}
              </div>

              {/* Report Context */}
              {inspectItem.reportedBy && inspectItem.reportedBy.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col gap-1 text-left">
                  <strong className="text-[12px] font-black text-amber-800">⚠️ Community Reports ({inspectItem.reportedBy.length})</strong>
                  <span className="text-[11.5px] font-semibold text-amber-700">Users have flagged this content for review. Please verify against campus guidelines.</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#E8E1D5] flex justify-between items-center gap-3">
              {inspectItem.id && (
                <button
                  onClick={() => {
                    const targetId = inspectItem.threadId || inspectItem.id;
                    const itemType = inspectItem.type;
                    setInspectItem(null);
                    if (itemType === 'petition') {
                      navigate(`/petitions?id=${inspectItem.id}`);
                    } else if (itemType === 'forum_thread' || itemType === 'Forum Comment') {
                      navigate(`/forum?threadId=${targetId}`);
                    } else if (itemType === 'career_thread' || itemType === 'Career Comment') {
                      navigate(`/career?id=${targetId}`);
                    } else if (itemType === 'Lost & Found') {
                      navigate(`/lost-found?id=${inspectItem.id}`);
                    }
                  }}
                  className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                >
                  🔗 Open &amp; Inspect Live on Page
                </button>
              )}
              <button
                onClick={() => setInspectItem(null)}
                className="bg-white border border-[#E8E1D5] text-[#071A35] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PUBLIC PROFILE MODAL ── */}
      <PublicProfileModal
        isOpen={!!profileModalUserId}
        onClose={() => setProfileModalUserId(null)}
        userId={profileModalUserId}
        currentUser={user}
      />
    </div>
  );
}
