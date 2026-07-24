import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDate, SOCKET_URL } from "../../utils/helpers";
import { io } from "socket.io-client";
import { createPortal } from "react-dom";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

export default function ModerationRoom() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Moderation state
  const [activeTab, setActiveTab] = useState("forums");
  const [queue, setQueue] = useState({ forums: [], petitions: [], lostFound: [] });
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
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/moderation/queue", config);
      setQueue(data.queue || { forums: [], petitions: [], lostFound: [] });
      setCounts(data.counts || { forums: 0, petitions: 0, lostFound: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      showToast(error.response?.data?.message || "Failed to load moderation queue.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Authenticate user on mount
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
        // Redirect regular students
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
        console.log("⚡ Connected to moderation updates socket");
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

      socket.on("new_petition_pending", (data) => {
        showToast("New petition pending moderator approval.", "info");
        fetchQueue();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, fetchQueue, showToast]);

  // Handle avatar changes
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
      showToast("Failed to upload avatar.", "error");

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

  // ── MODERATOR ACTIONS ──

  // Restore Flagged Forum Thread
  const handleRestoreThread = async (threadId) => {
    setActioningId(threadId);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/forums/${threadId}/moderate`, {}, config);
      showToast(data.message || "Thread restored successfully.", "success");
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
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/moderation/career/${threadId}/moderate`, { action: "Approve" }, config);
      showToast(data.message || "Career thread restored successfully.", "success");
      fetchQueue();
    } catch (error) {
      console.error("Failed to restore career thread:", error);
      showToast(error.response?.data?.message || "Failed to restore career thread.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // Restore Flagged Comment/Reply (unify Forums and Career comments)
  const handleRestoreReply = async (threadId, replyId, replyType) => {
    setActioningId(replyId);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = replyType === 'forum_reply' ? 'reply' : 'career_reply';
      const { data } = await axios.put(`/api/moderation/${endpoint}/${replyId}/moderate`, { action: "Approve", threadId }, config);
      showToast(data.message || "Comment restored successfully.", "success");
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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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

  // Moderate Profile Report (Approve/Reject)
  const handleModerateProfileReport = async (reportId, action) => {
    setActioningId(reportId);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t('Loading portal dashboard...')}</p>
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
        <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
          <Sidebar />

          <main className="flex-1 flex flex-col min-w-0">
            <Topbar
              time={time}
              user={user}
              setUser={setUser}
              avatar={getPersonalizedAvatar(avatar)}
              handleAvatarChange={handleAvatarChange}
              isUploading={isUploading}
            />

            <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">

              {/* Header Row */}
              <div className="relative flex justify-between items-center bg-gradient-to-r from-[#0d1e33] to-[#0a2342] border border-slate-200/20 rounded-3xl p-7 shadow-lg overflow-hidden">
                <div className="flex flex-col z-10">
                  <h1 className="text-[26px] font-black text-white tracking-tight flex items-center gap-2">
                    <span>🛡️</span> Moderator Control Room
                  </h1>
                  <p className="text-[13px] text-slate-300 mt-2 font-semibold max-w-[600px]">
                    Manage pending submissions, flag lists, and academic community guidelines enforcement.
                  </p>
                </div>
                <div className="z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span className="text-[12px] text-slate-200 font-bold">Pending:</span>
                  <span className="bg-[#00c2cb] text-slate-900 px-2 py-0.5 rounded-full text-[12px] font-black">
                    {counts.total} items
                  </span>
                </div>
              </div>

              {/* Navigation Control Tabs */}
              <div className="flex border-b border-slate-200 gap-4 mt-2">
                <button
                  onClick={() => setActiveTab("forums")}
                  className={`pb-3 px-1 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "forums"
                    ? "border-[#00c2cb] text-[#00c2cb]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Flagged Discussions ({reportedForums.length + reportedCareers.length} Threads, {flaggedReplies.length} Comments)
                </button>
                <button
                  onClick={() => setActiveTab("petitions")}
                  className={`pb-3 px-1 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "petitions"
                    ? "border-[#00c2cb] text-[#00c2cb]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Pending Petitions ({queue.petitions.length})
                </button>
                <button
                  onClick={() => setActiveTab("lostfound")}
                  className={`pb-3 px-1 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "lostfound"
                    ? "border-[#00c2cb] text-[#00c2cb]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Flagged Lost & Found ({queue.lostFound?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("oldUnclaimed")}
                  className={`pb-3 px-1 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === "oldUnclaimed"
                    ? "border-[#00c2cb] text-[#00c2cb]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                >
                  Old Unclaimed (10d+) ({queue.oldUnclaimed?.length || 0})
                </button>
              </div>

              {/* Main Dashboard Panel */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3.5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
                  <p className="text-[13px] text-slate-500 font-medium">{t("Loading moderation queue items...")}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6">

                  {/* TAB 1: FORUMS */}
                  {activeTab === "forums" && (
                    <div className="flex flex-col gap-8">

                      {/* Flagged Forum Threads */}
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                          📁 Reported Discussion Threads ({reportedForums.length})
                        </h3>
                        {reportedForums.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {reportedForums.map((thread) => (
                              <div
                                key={thread._id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5 relative overflow-hidden"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                                      Flagged Forum Thread
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Started by <strong className="text-slate-600">{thread.author?.registeration_number || thread.author?.name}</strong> • {formatDate(thread.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={actioningId === thread._id}
                                      onClick={() => handleRestoreThread(thread._id)}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      ✅ Keep & Restore
                                    </button>
                                    <button
                                      disabled={actioningId === thread._id}
                                      onClick={() => handleDeleteThread(thread._id, false)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      🗑️ Delete Post
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[15px] font-extrabold text-[#0a2342]">{thread.title}</h4>
                                  <p className="text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                    {thread.content}
                                  </p>
                                </div>
                                {thread.reportedBy && thread.reportedBy.length > 0 && (
                                  <div className="text-[10.5px] font-semibold text-slate-400 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg w-fit">
                                    Reported by community ({thread.reportedBy.length} report)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                            No reported discussion threads in the queue.
                          </div>
                        )}
                      </div>

                      {/* Flagged Career Threads */}
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                          💼 Reported Career Threads ({reportedCareers.length})
                        </h3>
                        {reportedCareers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {reportedCareers.map((thread) => (
                              <div
                                key={thread._id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5 relative overflow-hidden"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 uppercase">
                                      Flagged Career Thread
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Started by <strong className="text-slate-600">{thread.author?.registeration_number || thread.author?.name}</strong> • {formatDate(thread.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={actioningId === thread._id}
                                      onClick={() => handleRestoreCareerThread(thread._id)}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      ✅ Keep & Restore
                                    </button>
                                    <button
                                      disabled={actioningId === thread._id}
                                      onClick={() => handleDeleteThread(thread._id, true)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      🗑️ Delete Post
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[15px] font-extrabold text-[#0a2342]">{thread.title}</h4>
                                  <p className="text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                    {thread.content}
                                  </p>
                                </div>
                                {thread.reportedBy && thread.reportedBy.length > 0 && (
                                  <div className="text-[10.5px] font-semibold text-slate-400 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg w-fit">
                                    Reported by community ({thread.reportedBy.length} report)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                            No reported career threads in the queue.
                          </div>
                        )}
                      </div>

                      {/* Flagged Comments */}
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                          💬 Reported Comments & Replies ({flaggedReplies.length})
                        </h3>
                        {flaggedReplies.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {flaggedReplies.map(({ threadId, threadTitle, reply, type }) => (
                              <div
                                key={reply._id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase">
                                      {type === 'forum_reply' ? 'Forum Flagged Comment' : 'Career Flagged Comment'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Under discussion: <strong className="text-slate-600">"{threadTitle}"</strong> • {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={actioningId === reply._id}
                                      onClick={() => handleRestoreReply(threadId, reply._id, type)}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      ✅ Keep Comment
                                    </button>
                                    <button
                                      disabled={actioningId === reply._id}
                                      onClick={() => handleDeleteReply(threadId, reply._id, type)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      🗑️ Delete Comment
                                    </button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[11px] text-slate-400 font-semibold">
                                    Reply by: <strong className="text-slate-700">{reply.author?.registeration_number || reply.author?.name || "Student"}</strong>
                                  </span>
                                  <p className="text-[12.5px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                    {reply.content}
                                  </p>
                                </div>
                                {reply.reportedBy && reply.reportedBy.length > 0 && (
                                  <div className="text-[10.5px] font-semibold text-slate-400 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg w-fit">
                                    Reported by community ({reply.reportedBy.length} report)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                            No reported comments in the queue.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: PETITIONS */}
                  {activeTab === "petitions" && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                        📋 Petitions Awaiting Review ({queue.petitions.length})
                      </h3>
                      {queue.petitions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {queue.petitions.map((petition) => (
                            <div
                              key={petition._id}
                              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                                      {petition.level} Scope
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Created by <strong className="text-slate-600">{petition.creator?.registeration_number || petition.creator?.name}</strong> • {formatDate(petition.createdAt)}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-[#00c2cb] font-extrabold uppercase">
                                    Target Milestone: {petition.milestone ? `${petition.milestone} signatures` : "No Limit"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={actioningId === petition._id}
                                    onClick={() => handleModeratePetition(petition._id, "Approve")}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Approve & Publish
                                  </button>
                                  <button
                                    disabled={actioningId === petition._id}
                                    onClick={() => handleModeratePetition(petition._id, "Reject")}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Reject & Delete
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-[15.5px] font-extrabold text-[#0a2342]">{petition.title}</h4>
                                <p className="text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                  {petition.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                          No petitions awaiting moderation approval.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LOST & FOUND */}
                  {activeTab === "lostfound" && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                        🔍 Lost & Found Items Awaiting Review ({queue.lostFound?.length || 0})
                      </h3>
                      {queue.lostFound && queue.lostFound.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {queue.lostFound.map((item) => (
                            <div
                              key={item._id}
                              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${item.type === "LOST"
                                      ? "bg-rose-50 text-rose-600 border-rose-100"
                                      : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      }`}>
                                      {item.type}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Reported by <strong className="text-slate-600">{item.reporter?.registeration_number || item.reporter?.name}</strong> • {formatDate(item.createdAt)}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    Location: {item.location} {item.surrenderedAt ? `• Surrendered at: ${item.surrenderedAt}` : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={actioningId === item._id}
                                    onClick={() => handleModerateLostFound(item._id, "Approve")}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Approve & Publish
                                  </button>
                                  <button
                                    disabled={actioningId === item._id}
                                    onClick={() => handleModerateLostFound(item._id, "Reject")}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Reject & Delete
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-4 items-start max-sm:flex-col">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.itemName}
                                    className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="text-[15.5px] font-extrabold text-[#0a2342]">{item.itemName}</h4>
                                  <p className="text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                          No Lost & Found items awaiting moderation approval.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "oldUnclaimed" && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[16px] font-black text-[#0a2342] flex items-center gap-2">
                        🧹 Unclaimed Posts Older than 10 Days ({queue.oldUnclaimed?.length || 0})
                      </h3>
                      <p className="text-[13px] text-slate-500 font-semibold mb-2">
                        These are unclaimed Lost & Found items that have been open for more than 10 days. You can delete them to clear clutter.
                      </p>
                      {queue.oldUnclaimed && queue.oldUnclaimed.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {queue.oldUnclaimed.map((item) => {
                            const ageInDays = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                              <div
                                key={item._id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${item.type === "LOST"
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        }`}>
                                        {item.type}
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        Reported by <strong className="text-slate-600">{item.reporter?.registeration_number || item.reporter?.name}</strong> • {formatDate(item.createdAt)}
                                      </span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                        {ageInDays} days old
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      Location: {item.location} {item.surrenderedAt ? `• Surrendered at: ${item.surrenderedAt}` : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={actioningId === item._id}
                                      onClick={() => handleDeleteOldUnclaimed(item._id)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      🗑️ Delete to Clear Clutter
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-4 items-start max-sm:flex-col">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.itemName}
                                      className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="text-[15.5px] font-extrabold text-[#0a2342]">{item.itemName}</h4>
                                    <p className="text-[12.5px] text-slate-600 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                          No unclaimed items older than 10 days in the system.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 5: PROFILE REPORTS */}
              {activeTab === "profileReports" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[13px] font-bold text-slate-600">
                      User Profile Violations ({queue.profileReports?.length || 0} Reports)
                    </span>
                  </div>

                  {queue.profileReports && queue.profileReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {queue.profileReports.map((report) => (
                        <div
                          key={report._id}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                <img
                                  src={report.targetUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.targetUser?.name || "User")}&background=random`}
                                  alt="Target Avatar"
                                  className="w-12 h-12 rounded-full object-cover border-2 border-rose-200"
                                />
                                <div>
                                  <h4 className="text-[14.5px] font-black text-[#0a2342]">
                                    {report.targetUser?.name || "Student User"}
                                  </h4>
                                  <span className="text-[11px] font-bold text-slate-400">
                                    Target User ID: {report.targetUser?._id}
                                  </span>
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-black uppercase">
                                {report.reason}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Report Details</div>
                              <p className="text-[12.5px] font-semibold text-slate-700 leading-relaxed">
                                {report.details || "No additional context provided."}
                              </p>
                              {report.reportedBy && (
                                <div className="text-[11px] font-bold text-slate-400 pt-1">
                                  Reported by: <strong className="text-slate-600">{report.reportedBy.name || "Student"}</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleModerateProfileReport(report._id, "Approve")}
                              disabled={actioningId === report._id}
                              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[12px] font-black tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              ✅ Resolve Violation & Reset Avatar
                            </button>
                            <button
                              onClick={() => handleModerateProfileReport(report._id, "Reject")}
                              disabled={actioningId === report._id}
                              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[12px] font-bold transition-all disabled:opacity-50"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                      No pending user profile violation reports.
                    </div>
                  )}
                </div>
              )}

              {/* Footer branding */}
              <footer className="mt-8 py-3 border-t border-slate-200 text-center">
                <p className="text-[12px] text-slate-400 font-medium tracking-wide">
                  {t('© 2026 CampusConnect. Moderation Engine.')}
                </p>
              </footer>
            </div>
          </main>

          {/* Toast alert system */}
          {toast && (
            <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' :
              toast.type === 'error' ? 'border-l-4 border-l-red-500' :
                toast.type === 'success' ? 'border-l-4 border-l-emerald-500' :
                  'border-l-4 border-l-[#00c2cb]'
              }`}>
              <div className="text-[18px] mt-0.5">
                {toast.type === 'warning' && <span>⚠️</span>}
                {toast.type === 'error' && <span>❌</span>}
                {toast.type === 'success' && <span>✅</span>}
                {toast.type === 'info' && <span>ℹ️</span>}
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <strong className="text-[13px] font-black text-[#0a2342]">
                  {toast.type === 'warning' ? 'Warning' :
                    toast.type === 'error' ? 'Error' :
                      toast.type === 'success' ? 'Success' : 'Moderator Alert'}
                </strong>
                <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
              </div>
              <button className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1" onClick={() => setToast(null)}>×</button>
            </div>
          )}

          {/* Custom Delete Confirmation Modal */}
          {deleteConfirm.isOpen && createPortal(
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4 animate-modal-fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 flex flex-col gap-5 animate-modal-slide-in">
                <div className="flex items-center gap-3 text-rose-600">
                  <span className="text-[28px]">⚠️</span>
                  <h3 className="text-[17.5px] font-black text-slate-900">Are you sure?</h3>
                </div>

                <p className="text-[13.5px] text-slate-500 leading-relaxed font-semibold">
                  Are you sure you want to delete this {deleteConfirm.type === 'thread' ? 'discussion thread' : 'comment'}? This action is permanent and cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: false, type: null, targetId: null, extraId: null })}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-[13px] font-extrabold transition-all cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-[13px] font-extrabold transition-all shadow-md shadow-red-600/10 cursor-pointer border-none"
                  >
                    Delete {deleteConfirm.type === 'thread' ? 'Post' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      );
    }
