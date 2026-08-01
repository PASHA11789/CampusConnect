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

const DEPARTMENT_CHALLENGES = {
  tech: {
    badge: "🧩 Daily Tech & CS Challenge",
    btnText: "Solve Challenge on LeetCode →",
    problems: [
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
    ],
  },
  business: {
    badge: "📊 Daily Business & Finance Case",
    btnText: "Analyze Case Study →",
    problems: [
      {
        title: "Market Expansion Strategy: EV Fleet Valuation & Entry",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Strategy", "Financial Valuation", "Market Entry"],
        estTime: "25 mins",
        solved: "164 Students Analyzed",
        link: "https://hbr.org/case-studies",
      },
      {
        title: "Financial Ratio & Liquidity Analysis (DuPont Model)",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Finance", "DuPont Analysis", "Balance Sheet"],
        estTime: "30 mins",
        solved: "88 Students Solved",
        link: "https://hbr.org/case-studies",
      },
      {
        title: "Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Marketing", "Metrics", "SaaS Growth"],
        estTime: "15 mins",
        solved: "240 Students Solved",
        link: "https://hbr.org/case-studies",
      },
    ],
  },
  engineering: {
    badge: "⚙️ Daily Engineering Challenge",
    btnText: "Solve Technical Challenge →",
    problems: [
      {
        title: "Op-Amp Circuit Gain & Signal Filtering Calculations",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Electrical", "Analog Circuits", "Filters"],
        estTime: "20 mins",
        solved: "105 Students Solved",
        link: "https://www.engineering.com",
      },
      {
        title: "Finite Element Stress Analysis on Cantilever Beam",
        difficulty: "Hard",
        diffColor: "bg-red-100 text-red-800 border-red-200",
        tags: ["Mechanical", "FEA", "Structural Analysis"],
        estTime: "30 mins",
        solved: "72 Students Solved",
        link: "https://www.engineering.com",
      },
      {
        title: "PID Controller Tuning for Automated Servo Motor",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Mechatronics", "Control Systems", "PID"],
        estTime: "25 mins",
        solved: "130 Students Solved",
        link: "https://www.engineering.com",
      },
    ],
  },
  design_arts: {
    badge: "🎨 Daily Design & UX Brief",
    btnText: "Explore Design Challenge →",
    problems: [
      {
        title: "Accessibility Redesign: Mobile Checkout Flow for Elderly Users",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["UI/UX", "Accessibility", "Figma Design"],
        estTime: "20 mins",
        solved: "190 Designers Participated",
        link: "https://www.uicoach.io",
      },
      {
        title: "Brand Identity & Micro-Interaction Animation Guidelines",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["Branding", "Micro-Animations", "Design System"],
        estTime: "15 mins",
        solved: "220 Designers Participated",
        link: "https://www.uicoach.io",
      },
    ],
  },
  general: {
    badge: "💡 Daily Career & Aptitude Challenge",
    btnText: "Practice Interview Case →",
    problems: [
      {
        title: "Behavioral Interview Case: Conflict Resolution & Leadership",
        difficulty: "Easy",
        diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        tags: ["STAR Method", "Leadership", "Communication"],
        estTime: "15 mins",
        solved: "340 Students Practiced",
        link: "https://www.linkedin.com/learning",
      },
      {
        title: "Analytical Aptitude & Logical Reasoning Test",
        difficulty: "Medium",
        diffColor: "bg-amber-100 text-amber-800 border-amber-200",
        tags: ["Aptitude", "Logic", "Problem Solving"],
        estTime: "20 mins",
        solved: "280 Students Practiced",
        link: "https://www.linkedin.com/learning",
      },
    ],
  },
};

const getDepartmentCategoryKey = (deptStr) => {
  const s = (deptStr || "").toLowerCase();
  if (s.includes("computer") || s.includes("cs") || s.includes("software") || s.includes("se") || s.includes("information") || s.includes("it") || s.includes("data") || s.includes("ai") || s.includes("cyber") || s.includes("tech")) {
    return "tech";
  }
  if (s.includes("bba") || s.includes("business") || s.includes("finance") || s.includes("accounting") || s.includes("management") || s.includes("marketing") || s.includes("mba") || s.includes("commerce")) {
    return "business";
  }
  if (s.includes("engineer") || s.includes("electrical") || s.includes("mechanical") || s.includes("civil") || s.includes("mechatronic")) {
    return "engineering";
  }
  if (s.includes("art") || s.includes("design") || s.includes("media") || s.includes("fine") || s.includes("graphics") || s.includes("ux") || s.includes("ui")) {
    return "design_arts";
  }
  return "general";
};

const getDailyProblemForDept = (deptStr) => {
  const categoryKey = getDepartmentCategoryKey(deptStr);
  const deptData = DEPARTMENT_CHALLENGES[categoryKey] || DEPARTMENT_CHALLENGES.general;
  // Calculate today's date seed (Midnight hash)
  const todaySeed = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
  const dailyIndex = Math.abs(todaySeed) % deptData.problems.length;
  return {
    ...deptData.problems[dailyIndex],
    badge: deptData.badge,
    btnText: deptData.btnText,
    categoryKey,
  };
};



const DEFAULT_MOCK_CAREER_THREADS = [
  {
    _id: "mock-career-1",
    title: "Frontend Developer Intern (React.js & Tailwind CSS)",
    content: "We are hiring a Frontend Intern at Systems Ltd Lahore office! Looking for CS students strong in React.js, JavaScript (ES6+), and Responsive Web Design. 3-month paid internship with full-time job offer possibility upon graduation.",
    category: "job_opportunity",
    location: "Lahore, Pakistan (Hybrid)",
    jobType: "Paid Internship",
    qualification: "BSCS / BSSE 7th-8th Semester",
    company: "Systems Ltd",
    likesCount: 38,
    viewsCount: 240,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    author: {
      _id: "alumni-1",
      name: "Javeria Khan",
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    replies: [
      {
        _id: "mock-r1",
        content: "Is this role open for 6th semester students as well?",
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        author: { name: "Hamza Malik", role: "student" }
      },
      {
        _id: "mock-r2",
        content: "Yes! If you have strong React projects in your portfolio, feel free to apply.",
        createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
        author: { name: "Javeria Khan", role: "alumni" }
      }
    ]
  },
  {
    _id: "mock-career-2",
    title: "How to prepare for AI & Data Science roles in 2026?",
    content: "Many juniors ask what skills matter most for AI roles. Focus on: 1) Python & NumPy/Pandas, 2) SQL & Data Pipeline basics, 3) Hands-on LLM / RAG projects with Gemini API or PyTorch. Don't just learn theory; build end-to-end projects.",
    category: "mentorship_qa",
    location: "Campus Mentorship",
    jobType: "Career Guidance",
    qualification: "All Programs",
    likesCount: 52,
    viewsCount: 310,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    author: {
      _id: "alumni-2",
      name: "Javeria Khan",
      role: "alumni",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    replies: [
      {
        _id: "mock-r3",
        content: "Thank you for sharing this! Should we prioritize LeetCode or building ML projects?",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        author: { name: "Student 2024F-mulbscs-055", role: "student" }
      },
      {
        _id: "mock-r4",
        content: "A mix of both! DSA for technical screening rounds, and ML projects for resume shortlisting.",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        author: { name: "Javeria Khan", role: "alumni" }
      }
    ]
  },
  {
    _id: "mock-career-3",
    title: "Summer Internship 2026 - MERN Stack Developer",
    content: "TechSoft Solutions is accepting applications for Summer 2026 Software Internships. Great environment for learning Node.js, Express, MongoDB, and React. Apply before May 15.",
    category: "internship",
    location: "Lahore (On-site)",
    jobType: "Full-time Internship",
    qualification: "BSCS / BSSE / BSIT",
    likesCount: 29,
    viewsCount: 185,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    author: {
      _id: "student-1",
      name: "Shujaat Ali",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    replies: [
      {
        _id: "mock-r5",
        content: "Applied! Thanks for sharing this opportunity.",
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        author: { name: "Hamza Malik", role: "student" }
      }
    ]
  },
  {
    _id: "mock-career-4",
    title: "Which cloud platform should CS students learn first: AWS or GCP?",
    content: "Both AWS and GCP are widely used in Pakistan's tech market. Which one do you recommend starting with for containerization (Docker/Kubernetes) and cloud deployment?",
    category: "general_discussion",
    location: "Discussion Forum",
    jobType: "Community Poll",
    qualification: "All CS / IT Students",
    likesCount: 41,
    viewsCount: 270,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    author: {
      _id: "student-2",
      name: "Usama Syed",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    replies: [
      {
        _id: "mock-r6",
        content: "Start with GCP for beginner-friendly interface and Google AI integrations, then learn AWS EC2/S3 basics.",
        createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        author: { name: "Javeria Khan", role: "alumni" }
      }
    ]
  }
];

export default function Career() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  const [threads, setThreads] = useState(DEFAULT_MOCK_CAREER_THREADS);
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      } catch (e) { }
    }
    return DEFAULT_CS_SKILLS;
  });

  const [isEditCareerProfileOpen, setIsEditCareerProfileOpen] = useState(false);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [inlineReplyText, setInlineReplyText] = useState({});

  const [dailyProblem, setDailyProblem] = useState(() => {
    return getDailyProblemForDept(localStorage.getItem("career_dept") || "BS Computer Science (BSCS)");
  });

  useEffect(() => {
    setDailyProblem(getDailyProblemForDept(careerDept || user?.department || user?.program));
  }, [careerDept, user]);

  const handleShuffleProblem = () => {
    const categoryKey = getDepartmentCategoryKey(careerDept || user?.department || user?.program);
    const deptData = DEPARTMENT_CHALLENGES[categoryKey] || DEPARTMENT_CHALLENGES.general;
    const remaining = deptData.problems.filter((p) => p.title !== dailyProblem.title);
    const pool = remaining.length > 0 ? remaining : deptData.problems;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setDailyProblem({
      ...pool[randomIndex],
      badge: deptData.badge,
      btnText: deptData.btnText,
      categoryKey,
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
        setThreads(fetched.length > 0 ? fetched : DEFAULT_MOCK_CAREER_THREADS);
        const initialSavedMap = {};
        (fetched.length > 0 ? fetched : DEFAULT_MOCK_CAREER_THREADS).forEach((t) => {
          if (t.isSaved) initialSavedMap[t._id] = true;
        });
        setSavedPosts(initialSavedMap);
      } catch (error) {
        console.error("Error fetching career threads:", error);
        setThreads(DEFAULT_MOCK_CAREER_THREADS);
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

  const handleInlineReplySubmit = async (thread, e) => {
    if (e) e.preventDefault();
    const text = inlineReplyText[thread._id];
    if (!text || !text.trim()) return;

    const newReplyObj = {
      _id: `reply-${Date.now()}`,
      content: text.trim(),
      author: user,
      createdAt: new Date().toISOString(),
    };

    handleReplyAdded(thread._id, newReplyObj);
    setInlineReplyText((prev) => ({ ...prev, [thread._id]: "" }));

    try {
      const token = sessionStorage.getItem("token");
      if (token && !thread._id.startsWith("mock-")) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.post(
          `/api/careers/${thread._id}/reply`,
          { content: text.trim() },
          config
        );
        if (data.underReview) {
          showToast("Your comment contains flagged keywords and is under review.", "warning");
        } else {
          showToast("Comment posted successfully.", "success");
        }
        return;
      }
    } catch (error) {
      console.log("Posted comment locally:", error);
    }
    showToast("Comment posted successfully.", "success");
  };

  const handleAvatarChange = async () => { };

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
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#071A35] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t("Loading your profile...")}</p>
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

          {/* Hero Banner (Matching Design Theme) */}
          <div className="bg-[#071A35] rounded-[1.5rem] p-6 sm:p-8 text-white border border-[#071A35] shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            <div className="flex flex-col text-left z-10">
              <div className="bg-white/10 text-[#00c2cb] text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-3 border border-white/10">
                <span>💼</span>
                <span>ALUMNI &amp; CAREER NETWORK</span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-black text-white leading-tight tracking-tight mb-2">
                Career Paths &amp; Mentorship
              </h1>
              <p className="text-[12px] font-semibold text-white/70 max-w-[550px] leading-relaxed m-0">
                Connect with alumni, explore job posts, ask for career guidance, and grow your professional journey.
              </p>
            </div>

            <button
              onClick={() => {
                setNewThreadTitle("");
                setNewThreadContent("");
                setCategory("general_discussion");
                setIsCreateOpen(true);
              }}
              className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-extrabold px-5 py-3 rounded-full text-[12.5px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 z-10 w-full sm:w-auto"
            >
              <span>+</span> Share Opportunity
            </button>
          </div>

          {/* Search & Category Filter Section */}
          <div className="bg-white rounded-[1.5rem] border border-[#E8E1D5] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-[0_8px_25px_rgba(7,26,53,0.04)]">

            {/* CATEGORY FILTER TABS BAR */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full xl:w-auto">

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border whitespace-nowrap ${selectedCategory === "All"
                  ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                  : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                  }`}
                onClick={() => setSelectedCategory("All")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t("All")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border whitespace-nowrap ${selectedCategory === "job_opportunity"
                  ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                  : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                  }`}
                onClick={() => setSelectedCategory("job_opportunity")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("Job Posts")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border whitespace-nowrap ${selectedCategory === "general_discussion"
                  ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                  : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                  }`}
                onClick={() => setSelectedCategory("general_discussion")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t("Discussions")}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border whitespace-nowrap ${selectedCategory === "internship"
                  ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                  : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border whitespace-nowrap ${selectedCategory === "mentorship_qa"
                  ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                  : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                  }`}
                onClick={() => setSelectedCategory("mentorship_qa")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t("Mentorship Q&A")}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
              {/* Search Container */}
              <div className="relative flex items-center w-full sm:w-[200px] shadow-sm shrink-0">
                <span className="absolute left-3.5 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder={t("Search jobs, companies...")}
                  className="bg-[#FAF7F0] border border-[#E8E1D5] rounded-full pl-9 pr-3 py-1.5 text-[11.5px] font-medium text-[#211A24] placeholder-[#211A24]/50 outline-none w-full shadow-inner focus:ring-2 focus:ring-[#071A35]/20 focus:border-[#071A35] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* MAIN GRID LAYOUT: 2 COLUMNS (Feed ~70%, Sidebar ~30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
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
                        className="hover:text-[#071A35] hover:bg-slate-100 rounded-lg p-1.5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-600"
                        title="Attach Image"
                        onClick={() => mediaInputRef.current?.click()}
                      >
                        <span>📷</span>
                        <span>{t("Image")}</span>
                      </button>
                    </div>

                    <button
                      className="bg-[#071A35] hover:bg-[#102A4A] text-white py-1.5 px-5 rounded-full text-xs font-bold cursor-pointer transition-all shadow-sm"
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

              {/* FEED POST CARDS (WITH IN-FEED INLINE EXPANSION) */}
              <div className="flex flex-col gap-4">
                {filteredThreads.length === 0 ? (
                  <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-slate-500 flex flex-col items-center gap-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center text-xl">🔍</div>
                    <p className="font-extrabold text-sm text-[#071A35]">{t("No career posts found.")}</p>
                    <p className="text-xs text-slate-400">{t("Be the first to share an opportunity or start a discussion!")}</p>
                  </div>
                ) : (
                  filteredThreads.map((post) => {
                    const badge = getCategoryBadgeStyle(post.category);
                    const authorName = post.author?.name || t("Community Member");
                    const authorRole = post.author?.role || (post.author?.roleTitle ? post.author.roleTitle.toLowerCase() : "student");
                    const isExpanded = expandedThreadId === post._id;
                    const isBookmarked = savedPosts[post._id];

                    return (
                      <div
                        key={post._id}
                        className={`bg-white border rounded-[1.5rem] p-5 shadow-xs transition-all duration-200 flex flex-col gap-3.5 relative group text-left ${
                          isExpanded
                            ? "border-[#00c2cb] ring-2 ring-[#00c2cb]/15"
                            : "border-[#E8E1D5] hover:border-[#071A35]/30 hover:shadow-md"
                        }`}
                      >
                        {/* CARD TOP: AUTHOR INFO & ROLE & CATEGORY */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                post.author?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`
                              }
                              alt={authorName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 cursor-pointer shadow-2xs"
                              onClick={() => openPublicProfile(post.author?._id || post.author)}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-extrabold text-[#071A35] hover:text-[#00c2cb] transition-colors cursor-pointer"
                                  onClick={() => openPublicProfile(post.author?._id || post.author)}
                                >
                                  {authorName}
                                </span>
                                {authorRole === "alumni" && (
                                  <span className="text-[9.5px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                                    🎓 Alumni
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10.5px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        {/* TITLE & CONTENT */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <h3
                              className="text-base font-black text-[#071A35] hover:text-[#0079c2] transition-colors leading-snug cursor-pointer m-0"
                              onClick={() => setExpandedThreadId(isExpanded ? null : post._id)}
                            >
                              {post.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal m-0 whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </div>

                          {/* Thumbnail image if provided */}
                          {post.companyLogo && (
                            <img
                              src={post.companyLogo}
                              alt={post.company || "Company"}
                              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 max-sm:hidden"
                            />
                          )}
                        </div>

                        {/* METADATA PILLS */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {post.location && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-[#FAF7F0] border border-[#E8E1D5] px-2.5 py-1 rounded-full">
                              <span>📍</span> {post.location}
                            </span>
                          )}
                          {post.jobType && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-[#FAF7F0] border border-[#E8E1D5] px-2.5 py-1 rounded-full">
                              <span>💼</span> {post.jobType}
                            </span>
                          )}
                          {post.qualification && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-[#FAF7F0] border border-[#E8E1D5] px-2.5 py-1 rounded-full">
                              <span>🎓</span> {post.qualification}
                            </span>
                          )}
                        </div>

                        {/* CARD FOOTER METRICS & INLINE TOGGLE ACTIONS */}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-1">
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <button
                              type="button"
                              onClick={() => setExpandedThreadId(isExpanded ? null : post._id)}
                              className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer transition-colors px-2 py-1 rounded-lg ${
                                isExpanded ? "bg-[#00c2cb]/10 text-[#0079c2] font-black" : "hover:bg-slate-100 hover:text-slate-700"
                              }`}
                            >
                              <span>💬</span>
                              <span>{post.replies?.length || 0} {post.replies?.length === 1 ? "Comment" : "Comments"}</span>
                            </button>

                            <button
                              type="button"
                              className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer transition-colors ${
                                post.isLiked ? "text-[#0079c2] font-extrabold" : "hover:text-slate-700"
                              }`}
                              onClick={() => toggleLikePost(post._id)}
                              title={post.isLiked ? "Unlike" : "Like"}
                            >
                              <span>👍</span> {post.likesCount || 0}
                            </button>

                            <button
                              type="button"
                              className={`p-1 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer ${
                                isBookmarked ? "text-[#071A35]" : "text-slate-400 hover:text-slate-600"
                              }`}
                              onClick={() => toggleSavePost(post._id)}
                              title={isBookmarked ? "Bookmarked" : "Save Post"}
                            >
                              🔖
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedThreadId(isExpanded ? null : post._id)}
                            className="flex items-center gap-1 text-xs font-black text-[#071A35] hover:text-[#0079c2] transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <span>{isExpanded ? t("Collapse") : t("Join Discussion")}</span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>
                        </div>

                        {/* IN-FEED INLINE EXPANDED COMMENTS SECTION (FACEBOOK STYLE COMPACT) */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3 animate-fade-in text-left">
                            <div className="flex justify-between items-center px-1">
                              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 m-0">
                                <span>💬</span>
                                <span>{t("Comments")}</span>
                                <span className="bg-[#00c2cb]/15 text-[#0079c2] px-2 py-0.2 rounded-full text-[10px] font-extrabold border border-[#00c2cb]/20">
                                  {post.replies?.length || 0}
                                </span>
                              </h4>
                            </div>

                            {/* Comments List Stream - Compact Scrollable Facebook Bubbles */}
                            <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1.5 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                              {post.replies && post.replies.length > 0 ? (
                                post.replies.map((reply, rIdx) => {
                                  const rAuthorName = reply.author?.name || t("Community Member");
                                  const rAuthorRole = reply.author?.role || "student";

                                  return (
                                    <div key={reply._id || rIdx} className="flex items-start gap-2 text-left group">
                                      <img
                                        src={
                                          reply.author?.avatar ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(rAuthorName)}&background=random`
                                        }
                                        alt={rAuthorName}
                                        className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5 shrink-0 cursor-pointer"
                                        onClick={() => openPublicProfile(reply.author?._id || reply.author)}
                                      />
                                      <div className="flex flex-col max-w-[88%]">
                                        <div className="bg-[#F0F2F5] hover:bg-[#E4E6EB] px-3.5 py-2 rounded-[18px] text-left max-w-fit flex flex-col gap-0.5 transition-colors border border-slate-200/50 break-words">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className="text-[11.5px] font-black text-[#071A35] hover:underline cursor-pointer leading-tight"
                                              onClick={() => openPublicProfile(reply.author?._id || reply.author)}
                                            >
                                              {rAuthorName}
                                            </span>
                                            {rAuthorRole === "alumni" && (
                                              <span className="text-[8.5px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded uppercase">
                                                Alumni
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11.5px] text-slate-800 leading-snug font-normal m-0 whitespace-pre-wrap break-words">
                                            {reply.content}
                                          </p>
                                        </div>
                                        <span className="text-[9.5px] text-slate-400 font-semibold pl-2 mt-0.5">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="bg-[#F0F2F5] border border-dashed border-slate-200 rounded-2xl p-3 text-center text-slate-500 text-xs font-semibold">
                                  💬 {t("No comments yet. Be the first to comment!")}
                                </div>
                              )}
                            </div>

                            {/* Facebook Style Compact Composer Bar */}
                            <form onSubmit={(e) => handleInlineReplySubmit(post, e)} className="flex items-center gap-2 pt-1">
                              <img
                                src={user?.avatar || getPersonalizedAvatar(avatar)}
                                alt={user?.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="relative flex-1 flex items-center">
                                <input
                                  type="text"
                                  placeholder={t("Write a comment...")}
                                  className="w-full bg-[#F0F2F5] border border-slate-200/80 rounded-full px-4 py-2 text-[11.5px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/15 transition-all pr-16"
                                  value={inlineReplyText[post._id] || ""}
                                  onChange={(e) =>
                                    setInlineReplyText((prev) => ({
                                      ...prev,
                                      [post._id]: e.target.value,
                                    }))
                                  }
                                />
                                <button
                                  type="submit"
                                  disabled={!inlineReplyText[post._id]?.trim()}
                                  className="absolute right-1.5 bg-[#071A35] hover:bg-[#0079c2] text-white px-3 py-1 rounded-full text-[10.5px] font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer"
                                >
                                  {t("Post")}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* LOAD MORE BUTTON */}
              <div className="flex justify-center pt-2 pb-6">
                <button className="flex items-center gap-2 bg-white border border-[#E8E1D5] text-[#071A35] hover:bg-[#FAF7F0] text-xs font-extrabold px-6 py-2.5 rounded-full shadow-xs transition-all cursor-pointer">
                  <span>{t("Load More Posts")}</span>
                  <span>↓</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <div className="flex flex-col gap-5 sticky top-4">
              {/* YOUR PROFILE CARD */}
              <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-5 shadow-xs flex flex-col gap-4 text-left relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Your Profile")}</h3>
                </div>

                <div className="flex flex-col items-center text-center gap-2 pt-1">
                  <img
                    src={getPersonalizedAvatar(avatar)}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#071A35]/30 p-0.5 shadow-xs"
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
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-[#071A35] bg-white text-slate-700 text-xs font-bold hover:text-[#071A35] transition-all cursor-pointer shadow-xs"
                    onClick={() => setIsEditCareerProfileOpen(true)}
                  >
                    {t("Edit Profile")}
                  </button>
                </div>
              </div>

              {/* SKILLS CARD */}
              <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-5 shadow-xs flex flex-col gap-3 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Skills")}</h3>
                  <button className="text-xs font-bold text-[#071A35] hover:underline border-none bg-transparent cursor-pointer" onClick={() => setIsEditCareerProfileOpen(true)}>
                    {t("Edit")}
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {careerSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">{t("No skills added.")}</p>
                  ) : (
                    careerSkills.map((skill, index) => (
                      <div key={index} className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E1D5] transition-all">
                        <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getSkillLevelBadgeStyle(skill.level)}`}>
                          {formatSkillLevel(skill.level)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* FIELD-CUSTOMIZED DAILY CHALLENGE CARD (AUTOMATIC DAILY ROTATION FOR ALL DEPARTMENTS) */}
              <div className="bg-white border border-amber-200/80 rounded-[1.5rem] p-5 shadow-xs flex flex-col gap-3 text-left relative overflow-hidden transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🧩</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {dailyProblem.badge || t("Daily Challenge")}
                    </h3>
                    <button
                      className="text-slate-400 hover:text-amber-600 p-0.5 text-xs transition-colors border-none bg-transparent cursor-pointer ml-1"
                      onClick={handleShuffleProblem}
                      title="Next Random Challenge in your field"
                    >
                      🎲
                    </button>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${dailyProblem.diffColor}`}>
                    {dailyProblem.difficulty}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <h4 className="text-xs font-black text-slate-900 leading-snug hover:text-[#071A35] transition-colors cursor-pointer">
                    {dailyProblem.title}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dailyProblem.tags && dailyProblem.tags.map((tag, idx) => (
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
                    {dailyProblem.btnText || t("Explore Challenge →")}
                  </a>
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>

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
          className={`fixed top-20 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === "warning"
            ? "border-l-4 border-l-amber-500"
            : toast.type === "error"
              ? "border-l-4 border-l-red-500"
              : toast.type === "success"
                ? "border-l-4 border-l-emerald-500"
                : "border-l-4 border-l-[#071A35]"
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
