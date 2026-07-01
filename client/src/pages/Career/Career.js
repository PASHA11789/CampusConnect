import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Subcomponents
import CareerThreadListPane from "./components/CareerThreadListPane";
import CareerRepliesPane from "./components/CareerRepliesPane";
import CreateCareerThreadModal from "./components/CreateCareerThreadModal";

const t = (s) => s;

export default function Career() {
  const navigate = useNavigate();
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

  const [toast, setToast] = useState(null);

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

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const handleThreadClick = useCallback((thread) => {
    setSelectedThreadId(thread._id);
    setActiveThread(thread);
  }, []);

  const handleThreadCreated = (newThread) => {
    setThreads([newThread, ...threads]);
    setIsCreateOpen(false);
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
    // Simplified stub for profile picture changing to match forum
  };

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    return url;
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
            <div className="flex flex-col">
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
                onClick={() => setIsCreateOpen(true)}
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
              threads={filteredThreads}
              selectedThreadId={selectedThreadId}
              onThreadClick={handleThreadClick}
              getCategoryLabel={getCategoryLabel}
            />

            {selectedThreadId && activeThread && (
              <CareerRepliesPane
                activeThread={activeThread}
                user={user}
                onClose={() => {
                  setSelectedThreadId(null);
                  setActiveThread(null);
                }}
                showToast={showToast}
                onReplyAdded={handleReplyAdded}
              />
            )}
          </div>
        </div>
      </main>

      <CreateCareerThreadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleThreadCreated}
        showToast={showToast}
        user={user}
      />

      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="flex-1 flex flex-col gap-0.5">
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
