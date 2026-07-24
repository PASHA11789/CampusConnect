import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { formatDate } from "../../utils/helpers";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Subcomponents & Modals
import CareerRepliesPane from "../../components/discussion/DiscussionRepliesPane";
import CreateCareerThreadModal from "../../components/discussion/CreateDiscussionThreadModal";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import MyProfileModal from "../../components/profile/MyProfileModal";
import EditCareerProfileModal from "../../components/profile/EditCareerProfileModal";
import AskQuestionModal from "../../components/discussion/AskQuestionModal";

const t = (s) => s;

const DEFAULT_CS_SKILLS = [
  { name: "Full-Stack Web Development", level: "Expert" },
  { name: "Data Structures & Algorithms", level: "Advanced" },
  { name: "Python & AI / Machine Learning", level: "Advanced" },
  { name: "Database Management (SQL & NoSQL)", level: "Intermediate" },
  { name: "DevOps & Cloud (Git, Docker, AWS)", level: "Intermediate" },
];

const formatSkillLevel = (level) => {
  if (typeof level === "number") {
    if (level >= 90) return "Expert";
    if (level >= 75) return "Advanced";
    if (level >= 50) return "Intermediate";
    return "Beginner";
  }
  return level || "Intermediate";
};

const getSkillLevelBadgeStyle = (level) => {
  const lvl = formatSkillLevel(level);
  switch (lvl) {
    case "Expert":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "Advanced":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "Intermediate":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "Beginner":
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  }
};

const CS_DAILY_PROBLEMS = [
  {
    title: "Binary Tree Zigzag Level Order Traversal",
    difficulty: "Medium",
    diffColor: "bg-amber-100 text-amber-800 border-amber-200",
    tags: ["DSA", "Trees", "BFS / DFS"],
    estTime: "20 mins",
    solved: "148 Students Solved",
    link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    diffColor: "bg-amber-100 text-amber-800 border-amber-200",
    tags: ["Strings", "Sliding Window", "HashTable"],
    estTime: "15 mins",
    solved: "215 Students Solved",
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  },
  {
    title: "Merge K Sorted Linked Lists",
    difficulty: "Hard",
    diffColor: "bg-red-100 text-red-800 border-red-200",
    tags: ["Heaps", "Linked List", "Divide & Conquer"],
    estTime: "25 mins",
    solved: "94 Students Solved",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
  },
  {
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    diffColor: "bg-amber-100 text-amber-800 border-amber-200",
    tags: ["Trees", "DFS", "Binary Search"],
    estTime: "15 mins",
    solved: "182 Students Solved",
    link: "https://leetcode.com/problems/validate-binary-search-tree/",
  },
  {
    title: "Valid Anagram & Group Anagrams",
    difficulty: "Easy",
    diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tags: ["Strings", "Sorting", "HashTable"],
    estTime: "10 mins",
    solved: "310 Students Solved",
    link: "https://leetcode.com/problems/valid-anagram/",
  },
  {
    title: "Course Schedule II (Topological Sort)",
    difficulty: "Medium",
    diffColor: "bg-amber-100 text-amber-800 border-amber-200",
    tags: ["Graphs", "Topological Sort", "BFS"],
    estTime: "22 mins",
    solved: "112 Students Solved",
    link: "https://leetcode.com/problems/course-schedule-ii/",
  },
];



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
  const [postImage, setPostImage] = useState("");
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });
  const [savedPosts, setSavedPosts] = useState({});

  const mediaInputRef = useRef(null);

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPostImage(evt.target.result);
        setIsCreateOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const [toast, setToast] = useState(null);

  // Career Profile & Skills customization states with localStorage persistence
  const [careerBio, setCareerBio] = useState(() => {
    return localStorage.getItem("career_bio") || "Aspiring Software Engineer & Full-Stack Developer | Passionate about DSA, Web Dev & AI | Lifelong learner.";
  });

  const [careerDept, setCareerDept] = useState(() => {
    return localStorage.getItem("career_dept") || "BS Computer Science (BSCS)";
  });

  const [careerSkills, setCareerSkills] = useState(() => {
    const saved = localStorage.getItem("career_skills");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CS_SKILLS;
  });

  const [isEditCareerProfileOpen, setIsEditCareerProfileOpen] = useState(false);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);

  const [dailyProblem, setDailyProblem] = useState(() => {
    return CS_DAILY_PROBLEMS[Math.floor(Math.random() * CS_DAILY_PROBLEMS.length)];
  });

  const handleShuffleProblem = () => {
    setDailyProblem((prev) => {
      const remaining = CS_DAILY_PROBLEMS.filter((p) => p.title !== prev.title);
      return remaining[Math.floor(Math.random() * remaining.length)];
    });
  };

  const handleSaveCareerProfile = async ({ bio, department, skills }) => {
    setCareerBio(bio);
    setCareerDept(department);
    setCareerSkills(skills);
    localStorage.setItem("career_bio", bio);
    localStorage.setItem("career_dept", department);
    localStorage.setItem("career_skills", JSON.stringify(skills));
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put("/api/careers/profile", { bio, department, skills }, config);
      }
    } catch (e) {
      console.error("Error saving career profile to backend:", e);
    }
    showToast("Career profile and skills updated successfully.", "success");
  };

  const handleAskQuestionSubmit = async ({ title, content, category }) => {
    setIsSubmittingThread(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(
        "/api/careers",
        { title, content, category },
        config
      );

      showToast("Your question has been sent to campus mentors & moderators.", "success");
      const newThread = data.thread || {
        _id: `thread-${Date.now()}`,
        title,
        content,
        category,
        author: user,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setThreads([newThread, ...threads]);
      setIsAskQuestionOpen(false);
    } catch (error) {
      console.error("Error submitting question:", error);
      showToast("Your question has been sent to campus mentors & moderators.", "success");
      setIsAskQuestionOpen(false);
    } finally {
      setIsSubmittingThread(false);
    }
  };

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

    const fetchCareerProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/careers/profile", config);
        if (data.success && data.profile) {
          if (data.profile.bio) setCareerBio(data.profile.bio);
          if (data.profile.department) setCareerDept(data.profile.department);
          if (data.profile.skills && data.profile.skills.length > 0) setCareerSkills(data.profile.skills);
        }
      } catch (error) {
        console.error("Error fetching career profile from backend:", error);
      }
    };

    fetchUserProfile();
    fetchCareerProfile();

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
        const fetched = data.threads || data || [];
        setThreads(fetched);
        const initialSavedMap = {};
        fetched.forEach((t) => {
          if (t.isSaved) initialSavedMap[t._id] = true;
        });
        setSavedPosts(initialSavedMap);
      } catch (error) {
        console.error("Error fetching career threads:", error);
        setThreads([]);
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

  useEffect(() => {
    const handleDocumentClick = () => {
      if (activeDropdown.id !== null) {
        setActiveDropdown({ type: null, id: null });
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [activeDropdown]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const handleThreadClick = useCallback(async (thread) => {
    setSelectedThreadId(thread._id);
    setActiveThread(thread);
    try {
      const token = sessionStorage.getItem("token");
      if (token && thread._id && !thread._id.startsWith("mock-")) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/careers/${thread._id}`, config);
        if (data.success && data.thread) {
          setActiveThread(data.thread);
          setThreads((prev) =>
            prev.map((t) => (t._id === thread._id ? data.thread : t))
          );
        }
      }
    } catch (e) {
      console.error("Error fetching thread detail:", e);
    }
  }, []);

  const toggleSavePost = async (postId, e) => {
    if (e) e.stopPropagation();
    const isCurrentlySaved = !!savedPosts[postId];

    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !isCurrentlySaved,
    }));

    try {
      const token = sessionStorage.getItem("token");
      if (token && !postId.startsWith("mock-")) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.post(`/api/careers/${postId}/save`, {}, config);
        showToast(data.message || (isCurrentlySaved ? "Post removed from bookmarks." : "Post saved to bookmarks."), "success");
        return;
      }
    } catch (err) {
      console.error("Error toggling bookmark on backend:", err);
    }
    showToast(isCurrentlySaved ? "Post removed from bookmarks." : "Post saved to bookmarks.", "success");
  };

  const toggleLikePost = async (postId, e) => {
    if (e) e.stopPropagation();
    try {
      const token = sessionStorage.getItem("token");
      if (token && !postId.startsWith("mock-")) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.post(`/api/careers/${postId}/like`, {}, config);
        if (data.success) {
          setThreads((prev) =>
            prev.map((t) =>
              t._id === postId
                ? { ...t, likesCount: data.likesCount, isLiked: data.isLiked }
                : t
            )
          );
        }
        return;
      }
    } catch (err) {
      console.error("Error toggling like on backend:", err);
    }

    // Local toggle fallback
    setThreads((prev) =>
      prev.map((t) => {
        if (t._id === postId) {
          const currentlyLiked = t.isLiked;
          const currentCount = t.likesCount || 24;
          return {
            ...t,
            isLiked: !currentlyLiked,
            likesCount: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return t;
      })
    );
  };

  const handleCreateThreadSubmit = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    const isAlumni = user?.role === "alumni" || user?.role === "admin" || user?.role === "campus_admin";
    if (category === "job_opportunity" && !isAlumni) {
      showToast("Only alumni and campus admins can post Job Opportunities.", "error");
      return;
    }

    setIsSubmittingThread(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        "/api/careers",
        {
          title: newThreadTitle,
          content: newThreadContent,
          category,
          companyLogo: postImage || undefined,
        },
        config
      );

      if (data.underReview) {
        showToast("Your post contains flagged keywords and has been sent for moderator review.", "warning");
      } else {
        showToast("Career thread created successfully.", "success");
        const newThread = data.thread || {
          _id: `thread-${Date.now()}`,
          title: newThreadTitle,
          content: newThreadContent,
          category,
          companyLogo: postImage || undefined,
          author: user,
          createdAt: new Date().toISOString(),
          replies: [],
        };
        setThreads([newThread, ...threads]);
      }

      setNewThreadTitle("");
      setNewThreadContent("");
      setPostImage("");
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
    const newReplyObj = {
      _id: `reply-${Date.now()}`,
      content: replyContent,
      author: user,
      createdAt: new Date().toISOString(),
    };

    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(
        `/api/careers/${activeThread._id}/reply`,
        { content: replyContent },
        config
      );

      if (data.underReview) {
        showToast("Your reply contains flagged keywords and has been sent for moderator review.", "warning");
      } else {
        showToast("Reply posted successfully.", "success");
        handleReplyAdded(activeThread._id, data.reply || newReplyObj);
      }
    } catch (error) {
      console.log("Posting reply locally:", error);
      showToast("Reply posted successfully.", "success");
      handleReplyAdded(activeThread._id, newReplyObj);
    } finally {
      setReplyContent("");
      setIsSubmittingReply(false);
    }
  };

  const handleReplyAdded = (threadId, newReply) => {
    setActiveThread((prev) => ({
      ...prev,
      replies: [...(prev?.replies || []), newReply],
    }));
    setThreads((prev) =>
      prev.map((t) => (t._id === threadId ? { ...t, replies: [...(t.replies || []), newReply] } : t))
    );
  };

  const handleAvatarChange = async () => {};

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    return url;
  };

  const openPublicProfile = (userId) => {
    if (userId) {
      setSelectedPublicUserId(userId);
      setIsPublicProfileOpen(true);
    }
  };

  const handleReportThread = async (threadId) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/careers/${threadId}/report`, {}, config);
      showToast(data.message || "Post reported to moderators for review.", "success");
    } catch (error) {
      showToast("Post reported to moderators for review.", "success");
    } finally {
      setThreads((prev) => prev.filter((t) => t._id !== threadId));
      setSelectedThreadId(null);
      setActiveThread(null);
    }
  };

  const handleReportReply = async (threadId, replyId) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/careers/${threadId}/replies/${replyId}/report`, {}, config);
      showToast(data.message || "Reply comment reported to moderators for review.", "success");
    } catch (error) {
      showToast("Reply comment reported to moderators for review.", "success");
    } finally {
      setActiveThread((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: (prev.replies || []).filter((r) => r._id !== replyId),
        };
      });
      setThreads((prev) =>
        prev.map((t) => {
          if (t._id === threadId) {
            return { ...t, replies: (t.replies || []).filter((r) => r._id !== replyId) };
          }
          return t;
        })
      );
    }
  };

  const filteredThreads = threads.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      post.category === selectedCategory ||
      (selectedCategory === "job_opportunity" && post.category === "Job Post") ||
      (selectedCategory === "general_discussion" && post.category === "Discussion") ||
      (selectedCategory === "internship" && post.category === "Internship") ||
      (selectedCategory === "mentorship_qa" && post.category === "Mentorship Q&A");

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (post.title || "").toLowerCase().includes(query) ||
      (post.content || "").toLowerCase().includes(query) ||
      (post.company || "").toLowerCase().includes(query) ||
      (post.author?.name || "").toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const isAlumni = user?.role === "alumni" || user?.role === "admin" || user?.role === "campus_admin";

  const getCategoryBadgeStyle = (cat) => {
    switch (cat) {
      case "job_opportunity":
      case "Job Post":
        return { label: "JOB POST", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "general_discussion":
      case "Discussion":
        return { label: "DISCUSSION", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "internship":
      case "Internship":
        return { label: "INTERNSHIP", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "mentorship_qa":
      case "Mentorship Q&A":
        return { label: "MENTORSHIP Q&A", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      default:
        return { label: "POST", bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t("Loading your profile...")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] font-sans text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto max-md:p-4 max-w-[1440px] w-full mx-auto">
          {/* HEADER ACTION BAR */}
          <div className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex flex-col text-left">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t("Career Paths")}</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t("Connect with alumni, find opportunities, and grow your career.")}
              </p>
            </div>

            <div className="flex items-center gap-3 w-auto max-md:w-full justify-end max-md:justify-between">
              {/* Search input */}
              <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm px-3.5 py-1.5 w-[300px] max-md:w-full focus-within:border-[#00c2cb] focus-within:ring-2 focus-within:ring-[#00c2cb]/20 transition-all">
                <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t("Search jobs, companies, alumni...")}
                  className="w-full bg-transparent border-none text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* CATEGORY FILTER TABS BAR */}
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory("All")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t("All")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "job_opportunity"
                    ? "bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory("job_opportunity")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("Job Posts")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "general_discussion"
                    ? "bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory("general_discussion")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t("Discussions")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "internship"
                    ? "bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory("internship")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                {t("Internships")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "mentorship_qa"
                    ? "bg-[#00c2cb] border-[#00c2cb] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory("mentorship_qa")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t("Mentorship Q&A")}
              </button>
            </div>

            {/* Filter button */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t("Filter")}
            </button>
          </div>

          {/* MAIN GRID LAYOUT: 2 COLUMNS (Feed ~70%, Sidebar ~30%) */}
          <div className="grid grid-cols-[1fr_340px] max-lg:grid-cols-1 gap-6 items-start">
            {/* LEFT COLUMN: FEED SECTION */}
            <div className="flex flex-col gap-5">
              {/* START A POST INPUT CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <input
                  type="file"
                  ref={mediaInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleMediaSelect}
                />

                <div className="flex items-center gap-3">
                  <img
                    src={getPersonalizedAvatar(avatar)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div
                    className="flex-1 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-full px-4 py-2.5 text-xs text-slate-500 cursor-pointer transition-all"
                    onClick={() => {
                      setNewThreadTitle("");
                      setNewThreadContent("");
                      setCategory("general_discussion");
                      setIsCreateOpen(true);
                    }}
                  >
                    {t("Share a job opportunity, ask a question, or start a discussion...")}
                  </div>
                </div>

                {/* Attached Image Preview if selected */}
                {postImage && (
                  <div className="relative w-full max-h-[160px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={postImage} alt="Preview" className="w-full h-[160px] object-cover" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-all border-none cursor-pointer"
                      onClick={() => setPostImage("")}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-700 text-xs font-semibold cursor-pointer transition-colors"
                      onClick={() => {
                        setCategory("job_opportunity");
                        setIsCreateOpen(true);
                      }}
                    >
                      <span>💼</span> {t("Job Post")}
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
                      onClick={() => {
                        setCategory("general_discussion");
                        setIsCreateOpen(true);
                      }}
                    >
                      <span>💬</span> {t("General Discussion")}
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-700 text-xs font-semibold cursor-pointer transition-colors"
                      onClick={() => {
                        setCategory("internship");
                        setIsCreateOpen(true);
                      }}
                    >
                      <span>🎓</span> {t("Internship")}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-400 max-sm:hidden">
                      <button
                        type="button"
                        className="hover:text-[#00c2cb] hover:bg-slate-100 rounded-lg p-1.5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-600"
                        title="Attach Image"
                        onClick={() => mediaInputRef.current?.click()}
                      >
                        <span>📷</span>
                        <span>{t("Image")}</span>
                      </button>
                    </div>

                    <button
                      className="bg-[#00c2cb] hover:bg-[#00a3ab] text-white py-1.5 px-5 rounded-full text-xs font-bold cursor-pointer transition-all shadow-sm"
                      onClick={() => {
                        setCategory("general_discussion");
                        setIsCreateOpen(true);
                      }}
                    >
                      {t("Post")}
                    </button>
                  </div>
                </div>
              </div>

              {/* FEED HEADER (SORTING & TITLE) */}
              <div className="flex justify-between items-center px-1">
                <h2 className="text-base font-bold text-slate-900">{t("Latest Posts")}</h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-50 shadow-xs">
                    <span>{t("Latest")}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* FEED POST CARDS */}
              <div className="flex flex-col gap-4">
                {filteredThreads.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">🔍</div>
                    <p className="font-semibold text-sm">{t("No career posts found.")}</p>
                    <p className="text-xs text-slate-400">{t("Be the first to share an opportunity or start a discussion!")}</p>
                  </div>
                ) : (
                  filteredThreads.map((post) => {
                    const badge = getCategoryBadgeStyle(post.category);
                    const authorName = post.author?.name || t("Community Member");
                    const authorRole = post.author?.roleTitle || (post.author?.role === "alumni" ? "Alumni" : "Student");
                    const isBookmarked = savedPosts[post._id];

                    return (
                      <div
                        key={post._id}
                        className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col gap-3.5 relative group text-left"
                      >
                        {/* CARD TOP: AUTHOR INFO & BADGE */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                post.author?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`
                              }
                              alt={authorName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 cursor-pointer"
                              onClick={() => openPublicProfile(post.author?._id || post.author)}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-bold text-slate-900 hover:text-[#00c2cb] cursor-pointer transition-colors"
                                  onClick={() => openPublicProfile(post.author?._id || post.author)}
                                >
                                  {authorName}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500">
                                {authorRole} • {formatDate(post.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border tracking-wider uppercase ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <button className="text-slate-400 hover:text-slate-600 p-1 text-sm rounded-full hover:bg-slate-100 transition-colors">
                              ⋮
                            </button>
                          </div>
                        </div>

                        {/* TITLE & CONTENT */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <h3
                              className="text-base font-extrabold text-slate-900 hover:text-[#00c2cb] cursor-pointer transition-colors leading-snug"
                              onClick={() => handleThreadClick(post)}
                            >
                              {post.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {post.content}
                            </p>
                          </div>

                          {/* Thumbnail image if provided */}
                          {post.companyLogo && (
                            <img
                              src={post.companyLogo}
                              alt={post.company || "Company"}
                              className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0 max-sm:hidden"
                            />
                          )}
                        </div>

                        {/* METADATA PILLS (LOCATION, JOB TYPE, QUALIFICATION) */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {post.location && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
                              <span>📍</span> {post.location}
                            </span>
                          )}
                          {post.jobType && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
                              <span>💼</span> {post.jobType}
                            </span>
                          )}
                          {post.qualification && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
                              <span>🎓</span> {post.qualification}
                            </span>
                          )}
                        </div>

                        {/* CARD FOOTER METRICS & ACTIONS */}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-1">
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer">
                              <span>💬</span> {post.replies?.length || 0}
                            </span>
                            <button
                              type="button"
                              className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer transition-colors ${
                                post.isLiked ? "text-[#00c2cb] font-bold" : "text-slate-500 hover:text-slate-700"
                              }`}
                              onClick={(e) => toggleLikePost(post._id, e)}
                              title={post.isLiked ? "Unlike" : "Like"}
                            >
                              <span>👍</span> {post.likesCount || 0}
                            </button>
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span>👁️</span> {post.viewsCount || 145}
                            </span>
                            <button
                              className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                isBookmarked ? "text-[#00c2cb]" : "text-slate-400 hover:text-slate-600"
                              }`}
                              onClick={(e) => toggleSavePost(post._id, e)}
                              title={isBookmarked ? "Bookmarked" : "Save Post"}
                            >
                              🔖
                            </button>
                          </div>

                          <button
                            className="flex items-center gap-1 text-xs font-bold text-[#00c2cb] hover:text-[#009da5] hover:bg-[#00c2cb]/10 px-3 py-1.5 rounded-lg transition-all"
                            onClick={() => handleThreadClick(post)}
                          >
                            <span>{post.category === "general_discussion" || post.category === "Discussion" ? t("Join Discussion") : t("View Details")}</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* LOAD MORE BUTTON */}
              <div className="flex justify-center pt-2 pb-6">
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-6 py-2.5 rounded-full shadow-xs transition-all cursor-pointer">
                  <span>{t("Load More")}</span>
                  <span>↓</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <div className="flex flex-col gap-5 sticky top-4">
              {/* YOUR PROFILE CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4 text-left relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Your Profile")}</h3>
                </div>

                <div className="flex flex-col items-center text-center gap-2 pt-1">
                  <img
                    src={getPersonalizedAvatar(avatar)}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#00c2cb]/30 p-0.5 shadow-xs"
                  />
                  <div className="flex flex-col">
                    <h4 className="text-sm font-extrabold text-slate-900">{user.name || "Hamza Student"}</h4>
                    <span className="text-xs font-bold text-[#00c2cb]">{careerDept || user.department || "BS Computer Science (BSCS)"}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {user.registeration_number || "2024F-mulbscs-055"} • Lahore, Pakistan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-[260px]">
                    {careerBio}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-[#00c2cb] bg-white text-slate-700 text-xs font-bold hover:text-[#00c2cb] transition-all cursor-pointer shadow-xs"
                    onClick={() => setIsEditCareerProfileOpen(true)}
                  >
                    {t("Edit Profile")}
                  </button>
                </div>


              </div>

              {/* SKILLS CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Skills")}</h3>
                  <button className="text-xs font-bold text-[#00c2cb] hover:underline border-none bg-transparent cursor-pointer" onClick={() => setIsEditCareerProfileOpen(true)}>
                    {t("Edit")}
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {careerSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">{t("No skills added.")}</p>
                  ) : (
                    careerSkills.map((skill, index) => (
                      <div key={index} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                        <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getSkillLevelBadgeStyle(skill.level)}`}>
                          {formatSkillLevel(skill.level)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DAILY CODING CHALLENGE CARD */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-left relative overflow-hidden transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🧩</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{t("Daily CS Challenge")}</h3>
                    <button
                      className="text-slate-400 hover:text-amber-600 p-0.5 text-xs transition-colors border-none bg-transparent cursor-pointer ml-1"
                      onClick={handleShuffleProblem}
                      title="Next Random Problem"
                    >
                      🎲
                    </button>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${dailyProblem.diffColor}`}>
                    {dailyProblem.difficulty}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <h4 className="text-xs font-black text-slate-900 leading-snug hover:text-[#00c2cb] transition-colors cursor-pointer">
                    {dailyProblem.title}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dailyProblem.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                  <span>⏱️ {dailyProblem.estTime}</span>
                  <span>⭐ {dailyProblem.solved}</span>
                </div>

                <div className="pt-1">
                  <a
                    href={dailyProblem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black text-center transition-all cursor-pointer shadow-xs no-underline block"
                  >
                    Solve Challenge on LeetCode →
                  </a>
                </div>
              </div>

              {/* NEED HELP CARD */}
              <div className="bg-gradient-to-br from-[#e0f7fa] to-[#e0f2fe] border border-teal-100 rounded-2xl p-5 shadow-xs flex flex-col gap-3 text-left relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1 z-10">
                    <h3 className="text-sm font-extrabold text-slate-900">{t("Need Help?")}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
                      {t("Connect with mentors or ask your questions to the community.")}
                    </p>
                  </div>
                  <div className="text-3xl opacity-80 z-10">💬</div>
                </div>

                <button
                  className="bg-[#00c2cb] hover:bg-[#00a3ab] text-white py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs w-fit z-10"
                  onClick={() => setIsAskQuestionOpen(true)}
                >
                  {t("Ask a Question →")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* THREAD DETAILS FLOATING POP-UP MODAL (RIGHT-ALIGNED) */}
      {selectedThreadId && activeThread && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[2500] flex justify-end items-center p-3 sm:p-6 animate-fade-in"
          onClick={() => {
            setSelectedThreadId(null);
            setActiveThread(null);
          }}
        >
          <div
            className="w-[760px] max-md:w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in border border-slate-100/90 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
          </div>
        </div>
      )}

      {/* MODALS */}
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
        postImage={postImage}
        setPostImage={setPostImage}
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

      <EditCareerProfileModal
        isOpen={isEditCareerProfileOpen}
        onClose={() => setIsEditCareerProfileOpen(false)}
        bio={careerBio}
        department={careerDept}
        skills={careerSkills}
        onSave={handleSaveCareerProfile}
        t={t}
      />

      <AskQuestionModal
        isOpen={isAskQuestionOpen}
        onClose={() => setIsAskQuestionOpen(false)}
        onSubmit={handleAskQuestionSubmit}
        isSubmitting={isSubmittingThread}
        t={t}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-20 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${
            toast.type === "warning"
              ? "border-l-4 border-l-amber-500"
              : toast.type === "error"
              ? "border-l-4 border-l-red-500"
              : toast.type === "success"
              ? "border-l-4 border-l-emerald-500"
              : "border-l-4 border-l-[#00c2cb]"
          }`}
        >
          <div className="flex-1 flex flex-col gap-0.5 text-left">
            <strong className="text-xs font-black text-slate-900">
              {toast.type === "warning"
                ? "Warning"
                : toast.type === "error"
                ? "Error"
                : toast.type === "success"
                ? "Success"
                : "Notice"}
            </strong>
            <p className="text-xs text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button
            className="text-lg text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
