import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { formatDate, SOCKET_URL } from "../../utils/helpers";
import { io } from "socket.io-client";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import PublicProfileModal from "../../components/profile/PublicProfileModal";
import MyProfileModal from "../../components/profile/MyProfileModal";

const t = (s) => s;

const processImageFile = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.src = evt.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxWidth = 1200;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => callback(evt.target.result);
  };
  reader.readAsDataURL(file);
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Create form & modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("Class");
  const [newDescription, setNewDescription] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [newImage, setNewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI status states
  const [toast, setToast] = useState(null);

  // ── TOAST NOTIFICATION HELPER ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const [signingIds, setSigningIds] = useState(new Set());
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sharePetition, setSharePetition] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState("");

  const [selectedPublicUserId, setSelectedPublicUserId] = useState(null);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

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

  // Access check helper for client-side filtering
  const checkHasAccess = useCallback((p, currentUser) => {
    if (!currentUser || !p) return false;
    if (currentUser.role === "admin" || currentUser.role === "campus_admin") return true;
    const creatorId = p.creator?._id || p.creator;
    if (creatorId && currentUser._id && creatorId.toString() === currentUser._id.toString()) return true;
    if (p.level === "Campus") return true;
    if (p.level === "Department" && p.targetGroup === currentUser.department) return true;
    const classString = `${currentUser.program}-${currentUser.department}-${currentUser.semester}-${currentUser.section}`;
    if (p.level === "Class" && p.targetGroup === classString) return true;
    return false;
  }, []);

  // Handle query parameter or state redirection for expansion/modal on mount/change
  useEffect(() => {
    const handleTargetPetition = async () => {
      const queryId = searchParams.get("id");
      const targetId = queryId || location.state?.petitionId;
      if (!targetId || !petitionsLoaded) return;

      const match = petitions.find((p) => p._id === targetId);
      if (match) {
        if (!checkHasAccess(match, user)) {
          setAccessDeniedMsg("Sorry, you are not authorized to view this petition");
          setIsAccessDeniedOpen(true);
          return;
        }
        setSelectedPetition(match);
        setIsDetailOpen(true);
        if (location.state?.petitionId) {
          navigate(`/petitions?id=${targetId}`, { replace: true, state: {} });
        }
        setTimeout(() => {
          const element = document.getElementById(`petition-card-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      } else {
        try {
          const token = sessionStorage.getItem("token");
          if (!token) return;
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get(`/api/petitions/${targetId}`, config);
          if (data.success && data.petition) {
            if (!checkHasAccess(data.petition, user)) {
              setAccessDeniedMsg("Sorry, you are not authorized to view this petition");
              setIsAccessDeniedOpen(true);
              return;
            }
            setSelectedPetition(data.petition);
            setIsDetailOpen(true);
          }
        } catch (err) {
          if (err.response?.status === 403 || err.response?.data?.forbidden) {
            setAccessDeniedMsg(err.response?.data?.message || "Sorry, you are not authorized to view this petition");
            setIsAccessDeniedOpen(true);
          } else {
            showToast(err.response?.data?.message || "Petition not found or inaccessible", "error");
          }
        }
      }
    };

    handleTargetPetition();
  }, [searchParams, location, petitionsLoaded, petitions, navigate, showToast, checkHasAccess, user]);

  // Click handler to open details in modal
  const handleCardClick = (petition) => {
    if (!checkHasAccess(petition, user)) {
      setAccessDeniedMsg("Sorry, you are not authorized to view this petition");
      setIsAccessDeniedOpen(true);
      return;
    }
    setSelectedPetition(petition);
    setIsDetailOpen(true);
    navigate(`/petitions?id=${petition._id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPetition(null);
    navigate(`/petitions`, { replace: true });
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
        const serverPetitions = data.petitions || [];
        const userStorageKey = user?._id ? `my_created_petitions_${user._id}` : "my_created_petitions";
        const localPetitions = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
        const filteredLocal = localPetitions.filter(lp => lp._id?.startsWith("temp-") && checkHasAccess(lp, user) && !serverPetitions.some(sp => sp._id === lp._id));
        const validLocalToKeep = localPetitions.filter(lp => lp._id?.startsWith("temp-") || serverPetitions.some(sp => sp._id === lp._id));
        localStorage.setItem(userStorageKey, JSON.stringify(validLocalToKeep));
        setPetitions([...filteredLocal, ...serverPetitions]);
      } catch (error) {
        console.error("Error fetching petitions:", error);
        showToast("Failed to fetch petitions list.", "error");
      } finally {
        setPetitionsLoaded(true);
      }
    };

    if (user) {
      fetchPetitions();

      const socket = io(SOCKET_URL);

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
        if (newPetition && checkHasAccess(newPetition, user)) {
          setPetitions((prev) => {
            const existsIndex = prev.findIndex((p) => p._id === newPetition._id || (p._id?.startsWith("temp-") && p.title === newPetition.title));
            if (existsIndex !== -1) {
              const updated = [...prev];
              updated[existsIndex] = newPetition;
              return updated;
            }
            return [newPetition, ...prev];
          });
          showToast(`New petition published: "${newPetition.title}"`, "info");
        }
      });

      socket.on("petition_deleted", (data) => {
        if (data && data.petitionId) {
          const targetId = data.petitionId.toString();
          setPetitions((prev) => prev.filter((p) => p._id?.toString() !== targetId));
          setSelectedPetition((prev) => (prev?._id?.toString() === targetId ? null : prev));

          const userStorageKey = user?._id ? `my_created_petitions_${user._id}` : "my_created_petitions";
          const localPetitions = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const updatedLocal = localPetitions.filter((p) => p._id?.toString() !== targetId);
          localStorage.setItem(userStorageKey, JSON.stringify(updatedLocal));
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
  }, [user, showToast, checkHasAccess]);

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

  // Scroll lock background when any modal is open
  useEffect(() => {
    if (isDetailOpen || isCreateModalOpen || sharePetition) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailOpen, isCreateModalOpen, sharePetition]);

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

  const handleReportPetition = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/petitions/${id}/report`, { reason: "Inappropriate Content" }, config);
      showToast(t("Petition reported successfully"), "success");
      setIsDetailOpen(false);
      setPetitions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || t("Failed to report petition"), "error");
    }
  };

  // Copy Link Action Handler
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast(t("Petition link copied to clipboard!"), "success");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        showToast(t("Failed to copy link."), "error");
      });
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
          image: newImage,
          level: newLevel,
          targetGroup,
          milestone: newMilestone === "" || newMilestone === null ? null : Number(newMilestone),
        },
        config
      );

      const created = data.petition || {
        _id: `temp-${Date.now()}`,
        title: newTitle,
        description: newDescription,
        image: newImage,
        level: newLevel,
        targetGroup,
        milestone: newMilestone === "" || newMilestone === null ? null : Number(newMilestone),
        status: data.underReview ? "Under Review" : "Pending Mod Approval",
        creator: { _id: user._id, name: user.name, avatar: user.avatar, registeration_number: user.registeration_number },
        signatures: [user._id],
        createdAt: new Date().toISOString()
      };

      const userStorageKey = user?._id ? `my_created_petitions_${user._id}` : "my_created_petitions";
      const localPetitions = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
      localStorage.setItem(userStorageKey, JSON.stringify([created, ...localPetitions]));

      if (data.underReview) {
        showToast("Your petition was flagged by AI moderation and sent for review.", "warning");
      } else if (created.status === "Pending Mod Approval") {
        showToast("Petition submitted and awaiting student moderator approval.", "info");
      } else {
        showToast("Class petition published instantly!", "success");
      }

      if (created.status !== "Pending Mod Approval" && created.status !== "Under Review") {
        setPetitions((prev) => {
          const exists = prev.some(p => p._id === created._id || (p.title === created.title && p.creator?._id === user?._id));
          if (exists) return prev;
          return [created, ...prev];
        });
      }

      // Reset form & close modal
      setNewTitle("");
      setNewDescription("");
      setNewImage("");
      setNewLevel("Class");
      setNewMilestone("");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating petition:", error);
      showToast(error.response?.data?.message || "Failed to create petition.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel]);

  // Filter & priority sorting logic (Class -> Department -> Campus)
  const filteredPetitions = petitions
    .filter((p) => {
      if (p.isHidden) return false;

      const matchesSearch =
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === "All" || p.level === selectedLevel;

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      const levelPriority = { Class: 1, Department: 2, Campus: 3 };
      const prioA = levelPriority[a.level] || 4;
      const prioB = levelPriority[b.level] || 4;
      if (prioA !== prioB) return prioA - prioB;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPetitions.length / itemsPerPage);
  const paginatedPetitions = filteredPetitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F0] font-sans text-[#211A24] animate-fade-in">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          <Topbar
            time={time}
            user={user}
            setUser={setUser}
            avatar={getPersonalizedAvatar(avatar)}
            handleAvatarChange={handleAvatarChange}
            isUploading={isUploading}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          <div className="flex-1 px-4 sm:px-8 py-6 sm:py-7 flex flex-col gap-6 max-md:p-4 [&>*]:animate-fade-in">

            {/* ── HERO BANNER (Matching Forum Theme) ── */}
            <div className="bg-[#071A35] rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-7 text-white border border-white/10 shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
              {/* Background Glow Accents */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col text-left z-10">
                <div className="bg-white/10 text-[#00c2cb] text-[9.5px] sm:text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-2 sm:mb-2.5 border border-white/10">
                  <span>✨</span>
                  <span>CAMPUS ADVOCACY</span>
                </div>
                <h1 className="text-xl sm:text-[26px] font-black text-white leading-tight tracking-tight mb-1.5">
                  {t("Campus Petitions")}
                </h1>
                <p className="text-[11.5px] sm:text-[12px] font-semibold text-white/70 max-w-[550px] leading-relaxed m-0">
                  {t("Discover petitions, add your voice, and help create positive change across campus.")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black px-5 py-3 rounded-full text-[12px] sm:text-[12.5px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 z-10 hover:scale-105 active:scale-95 border-none w-full sm:w-auto"
              >
                <span>+</span> {t("Start a Petition")}
              </button>
            </div>

            {/* ── MAIN CONTENT AREA (Full Width Layout) ── */}
            <div className="w-full flex flex-col gap-6">

                {/* ── SEARCH & LEVEL FILTER SECTION (Forum Theme) ── */}
                <div className="relative z-10 bg-white rounded-2xl sm:rounded-[1.5rem] border border-[#E8E1D5] p-3.5 sm:p-4 flex flex-col gap-3 shadow-[0_8px_25px_rgba(7,26,53,0.04)]">
                  {/* Search Input */}
                  <div className="relative flex items-center w-full">
                    <span className="absolute left-4 text-slate-400 text-sm">🔍</span>
                    <input
                      type="text"
                      placeholder={t("Search petitions, keywords, or level...")}
                      className="bg-[#FAF7F0] border border-[#E8E1D5] rounded-full pl-10 pr-4 py-2.5 text-[12px] font-medium text-[#211A24] placeholder-[#211A24]/50 outline-none w-full shadow-inner focus:ring-2 focus:ring-[#071A35]/20 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Level Selection Tabs */}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 flex-nowrap">
                    {levelTabs.map((lvl) => {
                      const isActive = selectedLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border ${
                            isActive
                              ? "bg-[#071A35] text-white border-[#071A35] shadow-sm"
                              : "bg-[#FAF7F0] text-[#211A24]/70 border-[#E8E1D5] hover:bg-[#F3EEE4] hover:text-[#071A35]"
                          }`}
                        >
                          {t(lvl)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── PETITIONS GRID LISTING ── */}
                {petitionsLoaded ? (
                  filteredPetitions.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                      {paginatedPetitions.map((petition) => {
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
                            id={`petition-card-${petition._id}`}
                            onClick={() => handleCardClick(petition)}
                            className="bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 shadow-[0_8px_25px_rgba(7,26,53,0.04)] hover:shadow-xl hover:-translate-y-1 hover:border-[#071A35]/30 transition-all duration-300 relative group overflow-hidden cursor-pointer"
                          >
                            {/* Card Top: Category Icon, Scope Priority Tag & Status Badge */}
                            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center shrink-0">
                                  {getPetitionIcon(petition.title, petition.level)}
                                </div>
                                {/* Scope Level Priority Tag with Hover Tooltip */}
                                <div className="relative group/tag">
                                  {petition.level === "Class" ? (
                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase bg-[#00c2cb] text-[#071A35] shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105">
                                      <span>✨</span> CLASS • HIGH PRIORITY
                                    </span>
                                  ) : petition.level === "Department" ? (
                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase bg-[#00c2cb] text-[#071A35] shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105">
                                      <span>🏢</span> DEPT • MEDIUM PRIORITY
                                    </span>
                                  ) : (
                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer transition-transform hover:scale-105">
                                      <span>🎓</span> CAMPUS
                                    </span>
                                  )}
                                  {/* Tooltip on Hover */}
                                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/tag:flex flex-col bg-[#071A35] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-white/20 whitespace-nowrap z-30 animate-fade-in pointer-events-none">
                                    <span>
                                      {petition.level === "Class"
                                        ? "✨ Class Level Petition (High Priority)"
                                        : petition.level === "Department"
                                        ? "🏢 Department Level Petition (Medium Priority)"
                                        : "🎓 Campus Level Petition"}
                                    </span>
                                    <span className="text-[8.5px] text-white/70 font-semibold">
                                      {petition.level === "Class"
                                        ? `Target: ${petition.targetGroup} (Your Class)`
                                        : petition.level === "Department"
                                        ? `Target: ${petition.targetGroup} Department`
                                        : "Target: Entire Campus"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9.5px] sm:text-[10.5px] font-bold shrink-0 ${badgeBg}`}>
                                {t(petition.status)}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <div className="flex flex-col gap-1.5 sm:gap-2">
                              <h3 className="text-sm sm:text-[16px] font-extrabold text-[#071A35] line-clamp-1 leading-tight group-hover:text-[#00c2cb] transition-colors break-words">
                                {petition.title}
                              </h3>
                              {petition.image && (
                                <div className="rounded-xl overflow-hidden max-h-[160px] sm:max-h-[180px] bg-slate-900/5 my-1 border border-[#E8E1D5] shadow-xs">
                                  <img src={petition.image} alt={petition.title} className="w-full h-full object-cover max-h-[160px] sm:max-h-[180px]" onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                              )}
                              <p className="text-xs sm:text-[12.5px] text-[#211A24]/70 font-medium leading-relaxed line-clamp-3 break-words">
                                {petition.description}
                              </p>
                            </div>

                            {/* Creator Details */}
                            <div
                              className="flex items-center gap-2.5 sm:gap-3 py-1 border-t border-[#E8E1D5]/60 mt-1 sm:mt-2 cursor-pointer hover:bg-[#FAF7F0] rounded-lg p-1 transition-colors -ml-1 -mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPublicProfile(petition.creator?._id || petition.creator);
                              }}
                            >
                              <img
                                src={getPersonalizedAvatar(petition.creator?.avatar)}
                                alt={petition.creator?.registeration_number || "Creator"}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#071A35]/10 shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] sm:text-[11.5px] font-bold text-[#071A35] group-hover:text-[#00c2cb] transition-colors truncate">
                                  {t("Started by")} {petition.creator?.registeration_number || t("Anonymous")}
                                </span>
                                <span className="text-[9.5px] sm:text-[10px] text-[#211A24]/50 font-semibold truncate">
                                  {formatDate(petition.createdAt)} • {t(petition.level)} ({petition.targetGroup})
                                </span>
                              </div>
                            </div>

                            {/* Progress Meter / No Limit Badge */}
                            {!hasMilestone ? (
                              <div className="flex items-center mt-1 sm:mt-2" onClick={(e) => e.stopPropagation()}>
                                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10.5px] sm:text-[11px] font-bold bg-[#071A35]/5 text-[#071A35] border border-[#071A35]/10">
                                  {sigsCount} {sigsCount === 1 ? t("Signature") : t("Signatures")} ({t("No Limit")})
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 sm:gap-1.5 mt-1 sm:mt-2" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between text-[10.5px] sm:text-[11px] font-bold text-[#211A24]/50">
                                  <span>
                                    <strong className="text-[#071A35]">{sigsCount}</strong> / {targetMilestone} {t("signatures")}
                                  </span>
                                  <span className="text-[#00c2cb] font-black">{percentage}%</span>
                                </div>
                                <div className="h-2 bg-[#E8E1D5]/60 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#071A35] to-[#00c2cb] rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="flex gap-2 items-center mt-2 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#E8E1D5]/60" onClick={(e) => e.stopPropagation()}>
                              {petition.status === "Active" ? (
                                isSignedByMe ? (
                                  <button
                                    disabled
                                    className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11.5px] sm:text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
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
                                    className="flex-1 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11.5px] sm:text-[12.5px] font-black flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md border-none active:scale-95 disabled:opacity-50 cursor-pointer"
                                  >
                                    {signingIds.has(petition._id) ? (
                                      <div className="w-4 h-4 border-2 border-[#071A35]/30 border-t-[#071A35] rounded-full animate-spin" />
                                    ) : (
                                      t("Sign Petition")
                                    )}
                                  </button>
                                )
                              ) : petition.status === "Resolved" ? (
                                <button
                                  disabled
                                  className="flex-1 bg-[#FAF7F0] text-[#211A24]/60 border border-[#E8E1D5] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11.5px] sm:text-[12.5px] font-bold flex items-center justify-center gap-1.5"
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
                                  className="flex-1 bg-[#FAF7F0] text-[#211A24]/50 border border-[#E8E1D5] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-[11.5px] sm:text-[12.5px] font-bold"
                                >
                                  {t("Under Review")}
                                </button>
                              )}

                              {/* Share Petition / QR Code Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSharePetition(petition);
                                }}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EEE4] border border-[#E8E1D5] flex items-center justify-center text-[#211A24]/70 hover:text-[#00c2cb] transition-colors shrink-0"
                                title={t("Share & QR Code")}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <circle cx="18" cy="5" r="3" />
                                  <circle cx="6" cy="12" r="3" />
                                  <circle cx="18" cy="19" r="3" />
                                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-[1.5rem] p-3.5 sm:p-4 shadow-[0_8px_25px_rgba(7,26,53,0.04)] mt-4 animate-fade-in">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="px-3.5 sm:px-4 py-2 rounded-xl text-[11.5px] sm:text-[12.5px] font-bold border border-[#E8E1D5] text-[#211A24]/80 hover:text-[#071A35] hover:bg-[#FAF7F0] transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            {t("Previous")}
                          </button>

                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                            {Array.from({ length: totalPages }).map((_, idx) => {
                              const pageNum = idx + 1;
                              return (
                                <button
                                  type="button"
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[11.5px] sm:text-[12px] font-black transition-all duration-200 cursor-pointer ${currentPage === pageNum
                                    ? "bg-[#071A35] text-white shadow-md scale-105"
                                    : "text-[#211A24]/70 hover:bg-[#FAF7F0] hover:text-[#071A35]"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="px-3.5 sm:px-4 py-2 rounded-xl text-[11.5px] sm:text-[12.5px] font-bold border border-[#E8E1D5] text-[#211A24]/80 hover:text-[#071A35] hover:bg-[#FAF7F0] transition-all duration-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                          >
                            {t("Next")}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-12 text-center text-[#211A24]/50 font-semibold shadow-[0_8px_25px_rgba(7,26,53,0.04)]">
                      {t("No active petitions matching your search criteria.")}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center py-20 flex-col gap-3">
                    <div className="w-6 h-6 border-2 border-[#E8E1D5] border-t-[#00c2cb] rounded-full animate-spin" />
                    <p className="text-[12.5px] text-[#211A24]/50 font-semibold">{t("Loading petitions listing...")}</p>
                  </div>
                )}

              </div>

            <footer className="mt-5 py-3 border-t border-[#E8E1D5] text-center">
              <p className="text-[12px] text-[#211A24]/50 font-medium tracking-wide">
                {t('© 2026 CampusConnect. An idea by')} <span className="text-[#071A35] font-bold">{t('Mr. Sagheer Ahmad')}</span> &{" "}
                <span className="text-[#071A35] font-bold">{t('Mr. Shujaat Ali Hashim')}</span>
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* ── CREATE PETITION MODAL POPUP ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm flex items-center justify-center z-[2000] p-3 sm:p-4 animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-3xl max-w-[620px] w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col overflow-hidden max-h-[88vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="relative bg-[#071A35] px-4 sm:px-7 py-3 sm:py-5 flex justify-between items-center text-white overflow-hidden shrink-0 border-b border-[#071A35]">
              {/* Glow accents */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 right-16 w-36 h-36 bg-[#00c2cb]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base sm:text-lg text-[#00c2cb] shrink-0">
                  📜
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base sm:text-xl font-black text-white leading-tight truncate">
                    {t("Start a New Petition")}
                  </h2>
                  <p className="text-[10px] sm:text-[11.5px] text-white/70 font-semibold m-0 leading-tight">
                    {t("Have an idea to improve campus life? Start a petition and make it happen.")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 ml-2"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-4 sm:p-7 overflow-y-auto flex-1 bg-[#FAF7F0]/60 flex flex-col gap-3.5 sm:gap-4">
              <form onSubmit={handleCreatePetition} className="flex flex-col gap-3.5 sm:gap-4">

                {/* Title field */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label className="text-[11px] sm:text-[12px] font-extrabold text-[#071A35]">
                    {t("Title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    placeholder={t("Enter a clear and descriptive title")}
                    className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[12.5px] font-semibold text-[#211A24] placeholder-[#211A24]/50 focus:outline-none focus:border-[#071A35] transition-colors"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div className="text-[9.5px] sm:text-[10px] text-[#211A24]/50 text-right font-semibold">
                    {newTitle.length} / 100
                  </div>
                </div>

                {/* Scope & Target Milestone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Scope / Level selection */}
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <label className="text-[11px] sm:text-[12px] font-extrabold text-[#071A35]">
                      {t("Scope")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[12.5px] font-semibold text-[#211A24] focus:outline-none focus:border-[#071A35] appearance-none cursor-pointer"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                      >
                        <option value="Class">{t("Class")}</option>
                        <option value="Department">{t("Department")}</option>
                        <option value="Campus">{t("Campus")}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#211A24]/50">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Target Milestone field */}
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <label className="text-[11px] sm:text-[12px] font-extrabold text-[#071A35]">
                      {t("Target Signatures (Optional)")}
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={10000}
                      placeholder={t("e.g. 100 (blank = no limit)")}
                      className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[12.5px] font-semibold text-[#211A24] placeholder-[#211A24]/50 focus:outline-none focus:border-[#071A35] transition-colors"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value === "" ? "" : (parseInt(e.target.value) || ""))}
                    />
                  </div>
                </div>

                {/* Description field */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label className="text-[11px] sm:text-[12px] font-extrabold text-[#071A35]">
                    {t("Description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    maxLength={1000}
                    required
                    rows={3}
                    placeholder={t("Describe your petition. What change are you seeking and why is it important?")}
                    className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[12.5px] font-semibold text-[#211A24] placeholder-[#211A24]/50 focus:outline-none focus:border-[#071A35] transition-colors resize-none scrollbar-none"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  <div className="text-[9.5px] sm:text-[10px] text-[#211A24]/50 text-right font-semibold">
                    {newDescription.length} / 1000
                  </div>
                </div>

                {/* Optional Image Attachment */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <label className="text-[11px] sm:text-[12px] font-extrabold text-[#071A35]">
                    {t("Header / Attachment Image (Optional)")}
                  </label>

                  {newImage ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#00c2cb] bg-slate-900/10 max-h-[160px] sm:max-h-[180px] flex items-center justify-center group shadow-sm">
                      <img
                        src={newImage}
                        alt="Petition attachment preview"
                        className="w-full h-full object-cover max-h-[160px] sm:max-h-[180px]"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewImage("")}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 text-[11px] font-bold shadow-lg border-none cursor-pointer flex items-center gap-1 transition-transform hover:scale-105"
                      >
                        <span>✕</span> {t("Remove Photo")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer?.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            processImageFile(file, setNewImage);
                          }
                        }}
                        className="border-2 border-dashed border-[#E8E1D5] hover:border-[#071A35] bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                        onClick={() => {
                          const input = document.getElementById("petition-file-input");
                          if (input) input.click();
                        }}
                      >
                        <input
                          id="petition-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              processImageFile(file, setNewImage);
                            }
                          }}
                        />
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#071A35]/10 text-[#071A35] flex items-center justify-center text-sm sm:text-base mb-1 group-hover:scale-110 transition-transform">
                          🖼️
                        </div>
                        <p className="text-xs sm:text-[12px] font-bold text-[#071A35] m-0 mb-0.5">
                          {t("Drag & Drop image here, or")} <span className="text-[#00c2cb] underline">{t("Browse Device")}</span>
                        </p>
                        <span className="text-[9px] sm:text-[9.5px] text-[#211A24]/50 font-semibold">{t("Supports JPG, PNG, WEBP, GIF")}</span>
                      </div>

                      <input
                        type="url"
                        placeholder={t("Or paste image URL (https://...)...")}
                        className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-[11.5px] font-semibold text-[#211A24] placeholder-[#211A24]/50 focus:outline-none focus:border-[#071A35]"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-2.5 sm:gap-3 mt-1 sm:mt-2 pt-2.5 sm:pt-3 border-t border-[#E8E1D5]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 bg-white hover:bg-[#F3EEE4] text-[#071A35] border border-[#E8E1D5] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {t("Cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[1.3] sm:flex-1 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-[13px] font-black cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 border-none shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#071A35]/30 border-t-[#071A35] rounded-full animate-spin" />
                        <span>{t("Submitting...")}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-45 -mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        <span>{t("Create Petition")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── PETITION DETAIL MODAL ── */}
      {isDetailOpen && selectedPetition && (
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm flex items-center justify-center z-[2000] p-3 sm:p-4 animate-fade-in" onClick={handleCloseDetail}>
          <div
            className="bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-3xl max-w-[600px] w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col overflow-hidden max-h-[88vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── Dark Navy Header Banner (Profile Style) ── */}
            <div className="relative bg-[#071A35] px-4 sm:px-6 py-3.5 sm:py-5 flex justify-between items-start text-white overflow-hidden shrink-0 border-b border-[#071A35]">
              {/* Subtle Ambient Orbs */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 right-16 w-36 h-36 bg-[#00c2cb]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2 min-w-0 flex-1 pr-4 sm:pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base sm:text-lg shadow-inner text-[#00c2cb] shrink-0">
                    📜
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-black bg-white/10 text-[#00c2cb] uppercase tracking-widest border border-white/10 shrink-0">
                      {t(selectedPetition.level)} {t("Level")}
                    </span>
                    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-black uppercase tracking-widest border shrink-0 ${selectedPetition.status === "Pending Mod Approval" ? "bg-indigo-500/20 text-indigo-200 border-indigo-400/30" :
                      selectedPetition.status === "Under Review" ? "bg-amber-500/20 text-amber-200 border-amber-400/30" :
                        selectedPetition.status === "Resolved" ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" :
                          selectedPetition.status === "Closed" ? "bg-rose-500/20 text-rose-200 border-rose-400/30" : "bg-[#00c2cb]/20 text-[#00c2cb] border-[#00c2cb]/30"
                    }`}>
                      {t(selectedPetition.status)}
                    </span>
                  </div>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white leading-tight tracking-tight line-clamp-2">
                  {selectedPetition.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 mt-0.5"
                onClick={handleCloseDetail}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Modal Body (Warm Ivory Background) ── */}
            <div className="p-4 sm:p-7 overflow-y-auto flex-1 bg-[#FAF7F0]/60 flex flex-col gap-4 sm:gap-5">

              {/* Creator details */}
              <div className="flex items-center gap-3 sm:gap-3.5 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8E1D5] shadow-sm">
                <img
                  src={getPersonalizedAvatar(selectedPetition.creator?.avatar)}
                  alt={selectedPetition.creator?.registeration_number || "Creator"}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#071A35]/10 shadow-sm shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-[12.5px] font-extrabold text-[#071A35] truncate">
                    {t("Started by")} {selectedPetition.creator?.registeration_number || t("Anonymous")}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#211A24]/50 font-semibold truncate">
                    {t("Created on")} {new Date(selectedPetition.createdAt).toLocaleDateString()} • {t("Scope:")} {selectedPetition.targetGroup}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              {selectedPetition.image && (
                <div className="rounded-xl sm:rounded-2xl overflow-hidden max-h-[220px] sm:max-h-[300px] border border-[#E8E1D5] shadow-sm bg-slate-900/5">
                  <img src={selectedPetition.image} alt={selectedPetition.title} className="w-full h-full object-cover max-h-[220px] sm:max-h-[300px]" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div className="flex flex-col gap-1.5 sm:gap-2 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8E1D5] shadow-sm">
                <h4 className="text-[12px] sm:text-[13px] font-black text-[#071A35] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c2cb] inline-block"></span>
                  {t("Description")}
                </h4>
                <p className="text-xs sm:text-[13px] text-[#211A24]/70 font-medium leading-relaxed whitespace-pre-line break-words">
                  {selectedPetition.description}
                </p>
              </div>

              {/* Progress status */}
              {(() => {
                const sigsCount = selectedPetition.signatures ? selectedPetition.signatures.length : (selectedPetition.currentSignaturesCount || 0);
                const targetMilestone = selectedPetition.milestone || 100;
                const percentage = Math.min(Math.round((sigsCount / targetMilestone) * 100), 100);
                return (
                  <div className="flex flex-col gap-2 sm:gap-2.5 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E8E1D5] shadow-sm">
                    <div className="flex justify-between text-[11px] sm:text-[12px] font-bold text-[#211A24]/50">
                      <span>
                        {t("Milestone Progress:")} <strong className="text-[#071A35]">{sigsCount}</strong> {t("of")} {targetMilestone} {t("signatures")}
                      </span>
                      <span className="text-[#00c2cb] font-black">{percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-[#E8E1D5]/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#071A35] to-[#00c2cb] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Actions inside modal */}
              <div className="flex gap-2.5 sm:gap-3 mt-1">
                <button
                  onClick={handleCloseDetail}
                  className="flex-1 bg-white hover:bg-[#F3EEE4] text-[#071A35] border border-[#E8E1D5] py-2.5 sm:py-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer"
                >
                  {t("Close")}
                </button>
                <button
                  onClick={() => handleReportPetition(selectedPetition._id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 sm:py-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer"
                >
                  {t("Report")}
                </button>

                {selectedPetition.status === "Active" && (
                  (() => {
                    const isSignedByMe = selectedPetition.signatures && selectedPetition.signatures.includes(user._id);
                    return isSignedByMe ? (
                      <button
                        disabled
                        className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 py-2.5 sm:py-3 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
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
                        className="flex-1 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-2.5 sm:py-3 rounded-xl text-xs sm:text-[13px] font-black transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md border-none"
                      >
                        {signingIds.has(selectedPetition._id) ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#071A35]/30 border-t-[#071A35] rounded-full animate-spin mx-auto" />
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
        </div>
      )}

      {/* ── SHARE PETITION MODAL (Forum Theme) ── */}
      {sharePetition && (
        <div
          className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-md flex items-center justify-center z-[2100] p-4 animate-fade-in"
          onClick={() => setSharePetition(null)}
        >
          <div
            className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-7 max-w-[420px] w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col items-center text-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-[#FAF7F0] hover:bg-[#F3EEE4] flex items-center justify-center text-[#211A24]/70 hover:text-[#071A35] transition-colors border border-[#E8E1D5]"
              onClick={() => setSharePetition(null)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Icon & Title */}
            <div className="w-12 h-12 rounded-full bg-[#071A35]/10 flex items-center justify-center text-[#071A35] mt-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <h2 className="text-[17px] font-black text-[#071A35] leading-tight">
                {t("Share Petition")}
              </h2>
              <p className="text-[12.5px] text-[#211A24]/70 font-bold px-4 truncate w-full" title={sharePetition.title}>
                {sharePetition.title}
              </p>
            </div>

            {/* QR Code image */}
            <div className="flex flex-col items-center gap-1.5 mt-1 bg-[#FAF7F0] p-4 rounded-2xl border border-[#E8E1D5]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/petitions?id=${sharePetition._id}`)}`}
                alt="Petition QR Code"
                className="w-36 h-36 border border-[#E8E1D5] p-2 rounded-xl bg-white shadow-sm"
              />
              <span className="text-[9px] font-black text-[#211A24]/50 uppercase tracking-widest mt-1">Scan QR to View / Sign</span>
            </div>

            {/* Copy link input and button */}
            <div className="w-full flex flex-col gap-2 mt-2">
              <div className="flex items-center bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl p-1.5 w-full">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/petitions?id=${sharePetition._id}`}
                  className="bg-transparent border-none text-[11px] font-semibold text-[#211A24]/70 focus:outline-none px-2 flex-1 select-all"
                />
                <button
                  onClick={() => handleCopyLink(`${window.location.origin}/petitions?id=${sharePetition._id}`)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border-none ${copied
                    ? "bg-emerald-500 text-white"
                    : "bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35]"
                    }`}
                >
                  {copied ? t("Copied!") : t("Copy")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSION DENIED ERROR CARD POPUP ── */}
      {isAccessDeniedOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setIsAccessDeniedOpen(false);
            navigate("/petitions", { replace: true });
          }}
        >
          <div
            className="bg-white border border-[#E8E1D5] rounded-[1.8rem] p-7 max-w-md w-full shadow-[0_25px_60px_rgba(7,26,53,0.3)] relative animate-modal-slide-in flex flex-col items-center text-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 border border-red-200 flex items-center justify-center text-3xl shadow-inner">
              🔒
            </div>

            <div className="bg-red-100 text-red-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-red-200">
              ACCESS RESTRICTED
            </div>

            <div className="flex flex-col gap-2 w-full">
              <h2 className="text-[20px] font-black text-[#071A35] leading-tight m-0">
                {accessDeniedMsg || t("You do not have permission to view this petition")}
              </h2>
              <p className="text-[13px] text-[#211A24]/70 font-semibold leading-relaxed m-0 px-2">
                This petition is restricted to members of a specific class or department. You only have access to petitions targeting your own class, department, or all campus students.
              </p>
            </div>

            <button
              onClick={() => {
                setIsAccessDeniedOpen(false);
                navigate("/petitions", { replace: true });
              }}
              className="mt-2 w-full bg-[#071A35] hover:bg-[#0c2952] text-white text-[13px] font-extrabold py-3 px-6 rounded-full transition-all border-none cursor-pointer shadow-md"
            >
              Back to Petitions
            </button>
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
            } catch (e) { }
          }
        }}
      />
    </>
  );
}
