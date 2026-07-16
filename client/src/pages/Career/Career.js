import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { formatDate } from "../../utils/helpers";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Subcomponents
import CareerThreadListPane from "../../components/discussion/DiscussionThreadListPane";
import CareerRepliesPane from "../../components/discussion/DiscussionRepliesPane";
import CreateCareerThreadModal from "../../components/discussion/CreateDiscussionThreadModal";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import MyProfileModal from "../../components/profile/MyProfileModal";

const t = (s) => s;

export default function Career() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  const [threads, setThreads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);

  // Modal / Input states
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [category, setCategory] = useState("general_discussion");
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });

  const [toast, setToast] = useState(null);

  // Profile modal states
  const [selectedPublicUserId, setSelectedPublicUserId] = useState(null);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

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
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/careers", config);
        setThreads(data.threads || data || []);
      } catch (error) {
        console.error("Error fetching career threads:", error);
      }
    };

    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    if (threads.length > 0) {
      const threadIdFromState = location.state?.threadId;
      if (threadIdFromState) {
        const found = threads.find((t) => t._id === threadIdFromState);
        if (found) {
          setSelectedThreadId(found._id);
          setActiveThread(found);
        }
      }
    }
  }, [threads, location.state]);

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

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const handleThreadClick = useCallback((thread) => {
    setSelectedThreadId(thread._id);
    setActiveThread(thread);
  }, []);

  const handleCreateThreadSubmit = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    // Extra safety check on the frontend
    const isAlumni = user?.role === 'alumni' || user?.role === 'admin' || user?.role === 'campus_admin';
    if (category === "job_opportunity" && !isAlumni) {
      showToast("Only alumni can post Job Opportunities.", "error");
      return;
    }

    setIsSubmittingThread(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.post("/api/careers", {
        title: newThreadTitle,
        content: newThreadContent,
        category
      }, config);

      if (data.underReview) {
        showToast("Your post contains flagged keywords and has been sent for moderator review.", "warning");
      } else {
        showToast("Career thread created successfully.", "success");
        const newThread = data.thread || {
          _id: Date.now().toString(),
          title: newThreadTitle,
          content: newThreadContent,
          category,
          author: user,
          createdAt: new Date().toISOString(),
          replies: []
        };
        setThreads([newThread, ...threads]);
      }

      // Reset form
      setNewThreadTitle("");
      setNewThreadContent("");
      setCategory("general_discussion");
      setIsCreateOpen(false);
      
    } catch (error) {
      console.error("Error creating thread:", error);
      showToast(error.response?.data?.message || "Failed to create thread.", "error");
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
      const { data } = await axios.post(`/api/careers/${activeThread._id}/reply`, {
        content: replyContent
      }, config);

      if (data.underReview) {
        showToast("Your reply contains flagged keywords and has been sent for moderator review.", "warning");
      } else {
        showToast("Reply posted successfully.", "success");
        const addedReply = data.reply || {
          _id: `temp-${Date.now()}`,
          content: replyContent,
          author: user,
          createdAt: new Date().toISOString()
        };
        handleReplyAdded(activeThread._id, addedReply);
      }
      setReplyContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
      showToast(error.response?.data?.message || "Failed to post reply.", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyAdded = (threadId, newReply) => {
    setActiveThread(prev => ({
      ...prev,
      replies: [...(prev.replies || []), newReply]
    }));
    setThreads(prev => prev.map(t => 
      t._id === threadId ? { ...t, replies: [...(t.replies || []), newReply] } : t
    ));
  };

  const handleAvatarChange = async (e) => {
    // Stub
  };

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    return url;
  };

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

  const handleReportThread = async (threadId) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/careers/${threadId}/report`, {}, config);
      showToast(data.message || "Thread reported successfully.", "success");
      setThreads(prev => prev.filter(t => t._id !== threadId));
      setSelectedThreadId(null);
      setActiveThread(null);
    } catch (error) {
      console.error("Failed to report career thread:", error);
      showToast(error.response?.data?.message || "Failed to report thread.", "error");
    }
  };

  const handleReportReply = async (threadId, replyId) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/careers/${threadId}/replies/${replyId}/report`, {}, config);
      showToast(data.message || "Reply reported successfully.", "success");
      
      setActiveThread(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: prev.replies.filter(r => r._id !== replyId)
        };
      });
      setThreads(prev => prev.map(t => {
        if (t._id === threadId) {
          return { ...t, replies: t.replies.filter(r => r._id !== replyId) };
        }
        return t;
      }));
    } catch (error) {
      console.error("Failed to report reply:", error);
      showToast(error.response?.data?.message || "Failed to report reply.", "error");
    }
  };

  const filteredThreads = threads.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const query = searchTerm.toLowerCase();
    const matchesSearch = (post.title || "").toLowerCase().includes(query) || (post.content || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categoriesList = ["All", "job_opportunity", "mentorship_qa", "general_discussion"];

  const getCategoryLabel = (cat) => {
    if (cat === "job_opportunity") return "Job Opportunities";
    if (cat === "mentorship_qa") return "Mentorship Q&A";
    if (cat === "general_discussion") return "General Discussion";
    return cat;
  };

  const isAlumni = user?.role === 'alumni' || user?.role === 'admin' || user?.role === 'campus_admin';

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
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">
          <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex flex-col text-left">
              <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">{t("Career Paths")}</h1>
              <p className="text-[12px] text-slate-500 mt-1 font-semibold">{t("Find opportunities and get mentorship from alumni")}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm">
                <input
                  type="text"
                  placeholder={t("Search threads...")}
                  className="w-[240px] max-md:w-full bg-transparent border-none text-[13px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none py-2 px-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="bg-[#0a2342] text-white border-none py-2 px-5 rounded-full text-[12px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb]"
                onClick={() => {
                  setNewThreadTitle("");
                  setNewThreadContent("");
                  setCategory("general_discussion");
                  setIsCreateOpen(true);
                }}
              >
                {t("New Thread")}
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full border text-[12px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? "bg-[#00c2cb] border-[#00c2cb] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {t(getCategoryLabel(cat))}
              </button>
            ))}
          </div>

          <div className={`flex-1 ${selectedThreadId ? "grid grid-cols-[340px_1fr] gap-6" : "w-full"} rounded-2xl overflow-hidden min-h-[500px] max-[900px]:grid-cols-1`}>
            <CareerThreadListPane
              filteredThreads={filteredThreads}
              selectedThreadId={selectedThreadId}
              onThreadClick={handleThreadClick}
              getCategoryLabel={getCategoryLabel}
              variant="career"
              formatDate={formatDate}
              t={t}
            />

            {selectedThreadId && activeThread && (
              <CareerRepliesPane
                variant="career"
                activeThread={activeThread}
                user={user}
                onClose={() => {
                  setSelectedThreadId(null);
                  setActiveThread(null);
                }}
                showToast={showToast}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                isSubmittingReply={isSubmittingReply}
                onReplySubmit={handleReplySubmit}
                onAvatarClick={openPublicProfile}
                onReportThread={handleReportThread}
                onReportReply={handleReportReply}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            )}
          </div>
        </div>
      </main>

      <CreateCareerThreadModal
        variant="career"
        isOpen={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onSubmit={handleCreateThreadSubmit}
        isSubmitting={isSubmittingThread}
        title={newThreadTitle}
        setTitle={setNewThreadTitle}
        content={newThreadContent}
        setContent={setNewThreadContent}
        category={category}
        setCategory={setCategory}
        isAlumni={isAlumni}
        showToast={showToast}
        user={user}
        t={t}
      />

      <PublicProfileModal
        isOpen={isPublicProfileOpen}
        onClose={() => setIsPublicProfileOpen(false)}
        userId={selectedPublicUserId}
        showToast={showToast}
      />

      <MyProfileModal
        isOpen={isMyProfileOpen}
        onClose={() => setIsMyProfileOpen(false)}
        user={user}
        setUser={setUser}
        avatar={getPersonalizedAvatar(avatar)}
        handleAvatarChange={handleAvatarChange}
        isUploading={isUploading}
        showToast={showToast}
      />

      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="flex-1 flex flex-col gap-0.5 text-left">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === 'warning' ? 'Warning' : toast.type === 'error' ? 'Error' : toast.type === 'success' ? 'Success' : 'Notice'}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
