import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

export default function Petitions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Petitions state
  const [petitions, setPetitions] = useState([]);
  const [petitionsLoaded, setPetitionsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [expandedPetitionId, setExpandedPetitionId] = useState(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("Class");
  const [newDescription, setNewDescription] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI status states
  const [toast, setToast] = useState(null);
  const [signingIds, setSigningIds] = useState(new Set());
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Handle query parameter or state redirection for expansion/modal on mount/change
  useEffect(() => {
    if (petitionsLoaded && petitions.length > 0) {
      const queryId = searchParams.get("id");
      const targetId = queryId || location.state?.petitionId;
      if (targetId) {
        const match = petitions.find((p) => p._id === targetId);
        if (match) {
          setSelectedPetition(match);
          setIsDetailOpen(true);
          // If navigated via state, update URL to query parameter and clear state
          if (location.state?.petitionId) {
            navigate(`/petitions?id=${targetId}`, { replace: true, state: {} });
          }
          // Scroll to the card if it exists
          setTimeout(() => {
            const element = document.getElementById(`petition-card-${targetId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    }
  }, [searchParams, location, petitionsLoaded, petitions, navigate]);

  // Click handler to open details in modal
  const handleCardClick = (petition) => {
    setSelectedPetition(petition);
    setIsDetailOpen(true);
    navigate(`/petitions?id=${petition._id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPetition(null);
    navigate(`/petitions`, { replace: true });
  };

  // ── TOAST NOTIFICATION HELPER ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  // Format date helper
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

  // Helper for letter-based avatar
  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

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

  // Fetch petitions & set up websocket connections
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/petitions", config);
        setPetitions(data.petitions || []);
      } catch (error) {
        console.error("Error fetching petitions:", error);
        showToast("Failed to fetch petitions list.", "error");
      } finally {
        setPetitionsLoaded(true);
      }
    };

    if (user) {
      fetchPetitions();

      const socket = io("http://localhost:5000");

      socket.on("connect", () => {
        console.log("⚡ Connected to petitions updates socket");

        // Join scope rooms
        socket.emit("join_room", "Campus");
        if (user.department) {
          socket.emit("join_room", user.department);
        }
        if (user.program && user.department && user.semester && user.section) {
          const classString = `${user.program}-${user.department}-${user.semester}-${user.section}`;
          socket.emit("join_room", classString);
        }
        socket.emit("join_user_room", user._id);
      });

      socket.on("new_petition_published", (newPetition) => {
        if (newPetition) {
          setPetitions((prev) => {
            const exists = prev.some((p) => p._id === newPetition._id);
            if (exists) return prev;
            return [newPetition, ...prev];
          });
          showToast(`New petition published: "${newPetition.title}"`, "info");
        }
      });

      socket.on("petition_signed", (data) => {
        if (data && data.petitionId) {
          setPetitions((prev) =>
            prev.map((p) => {
              if (p._id !== data.petitionId) return p;
              const isSignedByMe = p.signatures && p.signatures.includes(user._id);
              let newSignatures = p.signatures || [];
              if (isSignedByMe) {
                newSignatures = [user._id, ...new Array(Math.max(0, data.currentSignatures - 1)).fill(null)];
              } else {
                newSignatures = new Array(data.currentSignatures).fill(null);
              }
              return {
                ...p,
                signatures: newSignatures,
                currentSignaturesCount: data.currentSignatures,
                status: data.status,
              };
            })
          );
        }
      });

      socket.on("new_notification", (notif) => {
        if (notif && notif.message) {
          showToast(notif.message, notif.type === "PETITION" ? "success" : "warning");
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, showToast]);

  // Auto-open petition detail modal from redirect state
  useEffect(() => {
    if (petitionsLoaded && location.state?.petitionId && petitions.length > 0) {
      const match = petitions.find((p) => p._id === location.state.petitionId);
      if (match) {
        setSelectedPetition(match);
        setIsDetailOpen(true);
        // Clear navigation state so the modal doesn't open again on page refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [petitionsLoaded, petitions, location, navigate]);

  // Handle avatar changes (upload profile pic)
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
      showToast("Failed to upload avatar. Please try again.", "error");

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

  // Sign Petition Action Handler
  const handleSignPetition = async (petitionId) => {
    if (signingIds.has(petitionId)) return;

    setSigningIds((prev) => new Set([...prev, petitionId]));
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/petitions/${petitionId}/sign`, {}, config);

      showToast(data.message || "Petition signed successfully!", "success");

      setPetitions((prev) =>
        prev.map((p) =>
          p._id === petitionId
            ? {
              ...p,
              signatures: [...(p.signatures || []), user._id],
              status: data.status,
            }
            : p
        )
      );
    } catch (error) {
      console.error("Error signing petition:", error);
      showToast(error.response?.data?.message || "Failed to sign petition.", "error");
    } finally {
      setSigningIds((prev) => {
        const next = new Set(prev);
        next.delete(petitionId);
        return next;
      });
    }
  };

  // Create Petition Form Submission
  const handleCreatePetition = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newLevel) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const targetGroup = newLevel === "Class"
        ? `${user.program}-${user.department}-${user.semester}-${user.section}`
        : (newLevel === "Department" ? user.department : "Campus");

      const { data } = await axios.post(
        "/api/petitions",
        {
          title: newTitle,
          description: newDescription,
          level: newLevel,
          targetGroup,
          milestone: newMilestone === "" || newMilestone === null ? null : Number(newMilestone),
        },
        config
      );

      if (data.underReview) {
        showToast("Your petition was flagged by AI moderation and sent for review.", "warning");
      } else if (data.petition?.status === "Pending Mod Approval") {
        showToast("Petition submitted and awaiting student moderator approval.", "info");
      } else {
        showToast("Class petition published instantly!", "success");
        if (data.petition) {
          setPetitions((prev) => [data.petition, ...prev]);
        }
      }

      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewLevel("Class");
      setNewMilestone("");
    } catch (error) {
      console.error("Error creating petition:", error);
      showToast(error.response?.data?.message || "Failed to create petition.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter logic
  const filteredPetitions = petitions.filter((p) => {
    if (p.isHidden) return false;

    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = selectedLevel === "All" || p.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const levelTabs = ["All", "Class", "Department", "Campus"];

  // Helper to select icon based on petition title/scope
  const getPetitionIcon = (title = "", level = "") => {
    const lower = title.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet") || lower.includes("speed")) {
      return (
        <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (lower.includes("time") || lower.includes("hour") || lower.includes("break") || lower.includes("extend")) {
      return (
        <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    }
    if (lower.includes("cycle") || lower.includes("bike") || lower.includes("parking") || lower.includes("bus")) {
      return (
        <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="5.5" cy="17.5" r="2.5" />
          <circle cx="18.5" cy="17.5" r="2.5" />
          <path d="M15 12.5V17h2v-3.5" />
          <path d="M12 9.5 8.5 14H6.5" />
          <path d="M12 9.5 15 12.5H18" />
          <path d="M12 9.5V5H8.5" />
        </svg>
      );
    }
    // Default Scope based icons
    if (level === "Class") {
      return (
        <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    }
    if (level === "Department") {
      return (
        <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
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
    <>
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

          {/* ── SPLIT MAIN LAYOUT (Mockup design: main left grid & right panel) ── */}
          <div className="grid grid-cols-[1fr_360px] gap-8 max-xl:grid-cols-1">

            {/* ── LEFT COLUMN (Main Content Area) ── */}
            <div className="flex flex-col gap-6">

              {/* ── HEADER BANNER ── */}
              <div className="relative flex justify-between items-center bg-gradient-to-r from-[#0a2342] via-[#0f3458] to-[#00c2cb]/90 border border-slate-200/30 rounded-3xl p-8 overflow-hidden shadow-lg">
                {/* Background decorative glowing circles */}
                <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-[#00c2cb]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -top-12 w-36 h-36 bg-[#00d4ff]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col z-10">
                  <h1 className="text-[30px] font-black text-white tracking-tight leading-none drop-shadow-sm">{t("Petitions")}</h1>
                  <p className="text-[14px] text-[#e0f2f1]/90 mt-2.5 font-medium max-w-[500px] leading-relaxed">
                    {t("Discover petitions, add your voice, and help create a better campus.")}
                  </p>
                </div>
                {/* Visual Accent MegaPhone Graphic */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[#00c2cb] opacity-25 pointer-events-none max-sm:hidden z-10 transition-transform duration-300 hover:scale-105">
                  <svg className="w-28 h-28 drop-shadow-[0_4px_12px_rgba(0,194,203,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 12V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9" />
                    <path d="M18 6h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3" />
                    <path d="m11.62 17.65-3.24-3.24H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.38l3.24-3.24A1 1 0 0 1 13.3 3.5v13a1 1 0 0 1-1.68.75z" />
                    <line x1="2" y1="22" x2="22" y2="22" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* ── SEARCH & FILTER CONTROLS ── */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                {/* Search field */}
                <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm flex-1 min-w-[240px]">
                  <svg className="w-4 h-4 text-slate-400 ml-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("Search petitions...")}
                    className="bg-transparent border-none text-[13px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none py-2.5 pr-4 flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="p-2 mr-2 text-slate-400 hover:text-[#00c2cb]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </button>
                </div>

                {/* Level selection tabs */}
                <div className="flex gap-1 bg-slate-200/50 p-1.5 rounded-full border border-slate-200 shadow-sm">
                  {levelTabs.map((lvl) => (
                    <button
                      key={lvl}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 cursor-pointer ${selectedLevel === lvl
                        ? "bg-[#0a2342] text-white shadow-sm"
                        : "text-slate-600 hover:text-[#0a2342]"
                        }`}
                      onClick={() => setSelectedLevel(lvl)}
                    >
                      {t(lvl)}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── PETITIONS GRID LISTING ── */}
              {petitionsLoaded ? (
                filteredPetitions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                    {filteredPetitions.map((petition) => {
                      const sigsCount = petition.signatures ? petition.signatures.length : (petition.currentSignaturesCount || 0);
                      const targetMilestone = petition.milestone;
                      const hasMilestone = targetMilestone !== null && targetMilestone !== undefined && targetMilestone > 0;
                      const percentage = hasMilestone ? Math.min(Math.round((sigsCount / targetMilestone) * 100), 100) : 0;
                      const isSignedByMe = petition.signatures && petition.signatures.includes(user._id);

                      // Determine status colors
                      let badgeBg = "bg-emerald-100 text-emerald-700";
                      if (petition.status === "Pending Mod Approval") badgeBg = "bg-indigo-100 text-indigo-700";
                      else if (petition.status === "Under Review") badgeBg = "bg-amber-100 text-amber-700";
                      else if (petition.status === "Resolved") badgeBg = "bg-[#00c2cb]/12 text-[#00c2cb]";
                      else if (petition.status === "Closed") badgeBg = "bg-rose-100 text-rose-700";

                      return (
                        <div
                          key={petition._id}
                          onClick={() => handleCardClick(petition)}
                          className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden cursor-pointer hover:-translate-y-0.5"
                        >
                          {/* Card Top: Category Icon & Status Badge */}
                          <div className="flex justify-between items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              {getPetitionIcon(petition.title, petition.level)}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10.5px] font-bold ${badgeBg}`}>
                              {t(petition.status)}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div className="flex flex-col gap-2">
                            <h3 className="text-[16px] font-extrabold text-[#0a2342] line-clamp-1 leading-tight">
                              {petition.title}
                            </h3>
                            <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                              {petition.description}
                            </p>
                          </div>

                          {/* Creator Details */}
                          <div className="flex items-center gap-3 py-1 border-t border-slate-100 mt-2">
                            <img
                              src={getPersonalizedAvatar(petition.creator?.avatar)}
                              alt={petition.creator?.registeration_number || "Creator"}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div className="flex flex-col">
                              <span className="text-[11.5px] font-bold text-slate-800">
                                {t("Started by")} {petition.creator?.registeration_number || t("Anonymous")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {formatDate(petition.createdAt)} • {t(petition.level)} ({petition.targetGroup})
                              </span>
                            </div>
                          </div>

                          {/* Progress Meter / No Limit Badge */}
                          {!hasMilestone ? (
                            <div className="flex items-center mt-2" onClick={(e) => e.stopPropagation()}>
                              <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#0a2342]/5 text-[#0a2342] border border-[#0a2342]/10">
                                {sigsCount} {sigsCount === 1 ? t("Signature") : t("Signatures")} ({t("No Limit")})
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                                <span>
                                  <strong className="text-[#0a2342]">{sigsCount}</strong> / {targetMilestone} {t("signatures")}
                                </span>
                                <span className="text-[#00c2cb]">{percentage}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00c2cb] to-[#00d4ff] rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="flex gap-2 items-center mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                            {petition.status === "Active" ? (
                              isSignedByMe ? (
                                <button
                                  disabled
                                  className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-2.5 px-4 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  {t("✓ Signed")}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSignPetition(petition._id);
                                  }}
                                  disabled={signingIds.has(petition._id)}
                                  className="flex-1 bg-gradient-to-r from-[#00c2cb] to-[#00a8b0] text-white hover:from-[#00b2bb] hover:to-[#009299] py-2.5 px-4 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50"
                                >
                                  {signingIds.has(petition._id) ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    t("Sign Petition")
                                  )}
                                </button>
                              )
                            ) : petition.status === "Resolved" ? (
                              <button
                                disabled
                                className="flex-1 bg-slate-50 text-slate-500 border border-slate-200 py-2.5 px-4 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                {t("Resolved")}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="flex-1 bg-slate-50 text-slate-400 border border-slate-200 py-2.5 px-4 rounded-xl text-[12.5px] font-bold"
                              >
                                {t("Under Review")}
                              </button>
                            )}

                            {/* Bookmark / Share Placeholder icon */}
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-[#0a2342] transition-colors"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-sm">
                    {t("No active petitions matching your search criteria.")}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center py-20 flex-col gap-3">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-[#00c2cb] rounded-full animate-spin" />
                  <p className="text-[12.5px] text-slate-400 font-semibold">{t("Loading petitions listing...")}</p>
                </div>
              )}

            </div>

            {/* ── RIGHT COLUMN (Creation Panel & Form) ── */}
            <div className="flex flex-col gap-6">

              {/* ── START NEW PETITION PANEL ── */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#00c2cb]/12 flex items-center justify-center text-[#00c2cb] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[16px] font-black text-[#0a2342] leading-tight">{t("Start a New Petition")}</h2>
                    <p className="text-[11.5px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      {t("Have an idea to improve campus life? Start a petition and make it happen.")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreatePetition} className="flex flex-col gap-4 border-t border-slate-100 pt-4">

                  {/* Title field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-slate-500">
                      {t("Title")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      required
                      placeholder={t("Enter a clear and descriptive title")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-colors"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <div className="text-[10px] text-slate-400 text-right font-semibold">
                      {newTitle.length} / 100
                    </div>
                  </div>

                  {/* Scope / Level selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-slate-500">
                      {t("Scope")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#0a2342] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                      >
                        <option value="Class">{t("Class")}</option>
                        <option value="Department">{t("Department")}</option>
                        <option value="Campus">{t("Campus")}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Target Milestone field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-slate-500">
                      {t("Required Signatures Target (Optional)")}
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={10000}
                      placeholder={t("e.g. 100 (leave blank for no limit)")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#0a2342] focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-colors"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value === "" ? "" : (parseInt(e.target.value) || ""))}
                    />
                  </div>

                  {/* Description field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-slate-500">
                      {t("Description")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      maxLength={1000}
                      required
                      rows={5}
                      placeholder={t("Describe your petition. What change are you seeking and why is it important?")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-colors resize-none scrollbar-none"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <div className="text-[10px] text-slate-400 text-right font-semibold">
                      {newDescription.length} / 1000
                    </div>
                  </div>

                  {/* Tips Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                    <h4 className="text-[11.5px] font-black text-[#0a2342]">{t("Tips for a strong petition")}</h4>
                    <ul className="flex flex-col gap-1.5 text-[10.5px] text-slate-400 font-semibold pl-4 list-disc">
                      <li>{t("Be specific and clear about the change you want.")}</li>
                      <li>{t("Explain why it matters to students.")}</li>
                      <li>{t("Keep it respectful and solution-oriented.")}</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00c2cb] text-[#060e1c] hover:bg-[#00b2bb] py-3 rounded-xl text-[13px] font-black cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#060e1c]/30 border-t-[#060e1c] rounded-full animate-spin" />
                        <span>{t("Analyzing & Submitting...")}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-4 h-4 rotate-45 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        {t("Create Petition")}
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-slate-400 text-center font-semibold mt-1">
                    {t("All petitions are reviewed to ensure community guidelines are followed.")}
                  </div>

                </form>
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
    </div>

      {/* ── PETITION DETAIL MODAL ── */}
      {isDetailOpen && selectedPetition && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-fade-in" onClick={handleCloseDetail}>
          <div
            className="bg-white border border-slate-200 rounded-3xl p-8 max-w-[600px] w-full shadow-2xl relative animate-modal-slide-in flex flex-col gap-5 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-[#0a2342] transition-colors"
              onClick={handleCloseDetail}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header info */}
            <div className="flex justify-between items-center pr-8">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {t(selectedPetition.level)} {t("Level")}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10.5px] font-bold ${selectedPetition.status === "Pending Mod Approval" ? "bg-indigo-100 text-indigo-700" :
                  selectedPetition.status === "Under Review" ? "bg-amber-100 text-amber-700" :
                    selectedPetition.status === "Resolved" ? "bg-[#00c2cb]/12 text-[#00c2cb]" :
                      selectedPetition.status === "Closed" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                {t(selectedPetition.status)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[22px] font-black text-[#0a2342] leading-tight mt-1">
              {selectedPetition.title}
            </h2>

            {/* Creator details */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
              <img
                src={getPersonalizedAvatar(selectedPetition.creator?.avatar)}
                alt={selectedPetition.creator?.registeration_number || "Creator"}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="text-[12.5px] font-bold text-slate-800">
                  {t("Started by")} {selectedPetition.creator?.registeration_number || t("Anonymous")}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {t("Created on")} {new Date(selectedPetition.createdAt).toLocaleDateString()} • {t("Scope:")} {selectedPetition.targetGroup}
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[13px] font-black text-[#0a2342]">{t("Description")}</h4>
              <p className="text-[13.5px] text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {selectedPetition.description}
              </p>
            </div>

            {/* Progress status */}
            {(() => {
              const sigsCount = selectedPetition.signatures ? selectedPetition.signatures.length : (selectedPetition.currentSignaturesCount || 0);
              const targetMilestone = selectedPetition.milestone || 100;
              const percentage = Math.min(Math.round((sigsCount / targetMilestone) * 100), 100);
              return (
                <div className="flex flex-col gap-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-2">
                  <div className="flex justify-between text-[12px] font-bold text-slate-500">
                    <span>
                      {t("Milestone Progress:")} <strong className="text-[#0a2342]">{sigsCount}</strong> {t("of")} {targetMilestone} {t("signatures")}
                    </span>
                    <span className="text-[#00c2cb]">{percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00c2cb] to-[#00d4ff] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Actions inside modal */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleCloseDetail}
                className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-3 rounded-xl text-[13px] font-bold transition-all"
              >
                {t("Close")}
              </button>

              {selectedPetition.status === "Active" && (
                (() => {
                  const isSignedByMe = selectedPetition.signatures && selectedPetition.signatures.includes(user._id);
                  return isSignedByMe ? (
                    <button
                      disabled
                      className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t("Signed")}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleSignPetition(selectedPetition._id);
                        setSelectedPetition(prev => ({
                          ...prev,
                          signatures: [...(prev.signatures || []), user._id]
                        }));
                      }}
                      disabled={signingIds.has(selectedPetition._id)}
                      className="flex-1 bg-[#00c2cb] text-[#060e1c] hover:bg-[#00b2bb] py-3 rounded-xl text-[13px] font-black transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {signingIds.has(selectedPetition._id) ? (
                        <div className="w-5 h-5 border-2 border-[#060e1c]/30 border-t-[#060e1c] rounded-full animate-spin mx-auto" />
                      ) : (
                        t("Sign Petition")
                      )}
                    </button>
                  );
                })()
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
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
    </>
  );
}
