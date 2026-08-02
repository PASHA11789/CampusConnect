import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { formatDate, SOCKET_URL } from "../../utils/helpers";
import { io } from "socket.io-client";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

export default function LostFound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Lost & Found items states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState("recent"); // "recent", "lost", "found", "returned", "mine"
  const [filterType, setFilterType] = useState("ALL"); // "ALL", "LOST", "FOUND"
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "Open", "At Office"
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortBy, setSortBy] = useState("latest"); // "latest", "oldest"
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Saved / Bookmarked item IDs
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("saved_lost_found_items");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Create report form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState("LOST"); // "LOST" or "FOUND"
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [surrenderedAt, setSurrenderedAt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single item details modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Claim report form states
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState(null);
  const [foundLocationInput, setFoundLocationInput] = useState("");
  const [submittedToInput, setSubmittedToInput] = useState("");
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);

  // UI toast notification state
  const [toast, setToast] = useState(null);
  const [resolvingIds, setResolvingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  // Show toast notifications helper
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5500);
  }, []);

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  const toggleSaveItem = (e, itemId) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      try {
        localStorage.setItem("saved_lost_found_items", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Authenticate user and keep clock running
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

  // Fetch items list and bind WebSocket updates
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/lost-found", config);
        setItems(data.items || []);
      } catch (error) {
        console.error("Error fetching items:", error);
        showToast("Failed to fetch lost and found items.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchItems();

      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        console.log("⚡ Connected to Lost & Found socket updates");
        socket.emit("join_room", "Campus");
        socket.emit("join_user_room", user._id);
      });

      socket.on("new_lost_found_item", (newItem) => {
        if (newItem) {
          setItems((prev) => {
            const exists = prev.some((item) => item._id === newItem._id);
            if (exists) return prev;
            return [newItem, ...prev];
          });
          setHighlightedItemId(newItem._id);
          showToast(`New ${newItem.type.toLowerCase()} item reported: "${newItem.itemName}"`, "success");
          setTimeout(() => setHighlightedItemId(null), 6000);
        }
      });

      socket.on("item_resolved", (data) => {
        if (data && data.itemId) {
          setItems((prev) =>
            prev.map((item) => {
              if (item._id !== data.itemId) return item;
              return { ...item, status: "Returned" };
            }).filter((item) => item._id !== data.itemId)
          );
          showToast("A misplaced item has been successfully returned/claimed!", "info");
        }
      });

      socket.on("item_deleted", (data) => {
        if (data && data.itemId) {
          setItems((prev) => prev.filter((item) => item._id !== data.itemId));
        }
      });

      socket.on("new_notification", (notif) => {
        if (notif && notif.message) {
          showToast(notif.message, "info");
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, showToast]);

  // Handle URL redirect query param for detail modal on mount
  useEffect(() => {
    if (!loading && items.length > 0) {
      const queryId = searchParams.get("id");
      const targetId = queryId || location.state?.itemId;
      if (targetId) {
        const match = items.find((i) => i._id === targetId);
        if (match) {
          setSelectedItem(match);
          setIsDetailOpen(true);
          if (location.state?.itemId) {
            navigate(`/lost-found?id=${targetId}`, { replace: true, state: {} });
          }
        }
      }
    }
  }, [searchParams, location, loading, items, navigate]);

  // Reset to page 1 whenever filters, tab, or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTab, filterType, filterStatus, sortBy]);

  // Prevent background scroll when modal detail is active
  useEffect(() => {
    if (isDetailOpen || isModalOpen || isClaimModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailOpen, isModalOpen, isClaimModalOpen]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    navigate(`/lost-found?id=${item._id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
    navigate(`/lost-found`, { replace: true });
  };

  // Avatar profile image upload handling
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
        } catch (err) {}
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Mark item as resolved/returned action
  const handleResolveItem = async (itemId) => {
    if (resolvingIds.has(itemId)) return;

    setResolvingIds((prev) => new Set([...prev, itemId]));
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/lost-found/${itemId}/resolve`, {}, config);

      showToast(data.message || "Item status updated to Resolved!", "success");
      setItems((prev) => prev.filter((item) => item._id !== itemId));

      if (isDetailOpen && selectedItem?._id === itemId) {
        handleCloseDetail();
      }
    } catch (error) {
      console.error("Error resolving item:", error);
      showToast(error.response?.data?.message || "Failed to resolve item status.", "error");
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Delete item action (Admin / Student Mod)
  const handleDeleteItem = async (itemId) => {
    if (deletingIds.has(itemId)) return;
    if (!window.confirm("Are you sure you want to permanently delete this report?")) return;

    setDeletingIds((prev) => new Set([...prev, itemId]));
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/lost-found/${itemId}`, config);

      showToast("Item report permanently deleted.", "info");
      setItems((prev) => prev.filter((item) => item._id !== itemId));

      if (isDetailOpen && selectedItem?._id === itemId) {
        handleCloseDetail();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast(error.response?.data?.message || "Failed to delete item.", "error");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Image upload preview handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Report post submit handler
  const handleCreateReport = async (e, forcedType) => {
    if (e) e.preventDefault();
    const typeToSubmit = forcedType || newItemType;
    if (!itemName.trim() || !description.trim() || !locationName.trim()) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const formData = new FormData();
      formData.append("type", typeToSubmit);
      formData.append("itemName", itemName);
      formData.append("category", itemCategory);
      formData.append("description", description);
      formData.append("location", locationName);
      if (typeToSubmit === "FOUND" && surrenderedAt.trim()) {
        formData.append("surrenderedAt", surrenderedAt);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post("/api/lost-found", formData, config);

      if (data.underReview) {
        showToast("Your post was flagged by AI moderation and sent for safety review.", "warning");
      } else {
        showToast("Report submitted successfully!", "success");
        if (data.item) {
          setItems((prev) => [data.item, ...prev]);
        }
      }

      // Reset form variables
      setItemName("");
      setItemCategory("Electronics");
      setDescription("");
      setLocationName("");
      setSurrenderedAt("");
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating lost & found item:", error);
      showToast(error.response?.data?.message || "Failed to report item.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!foundLocationInput.trim() || !submittedToInput.trim()) {
      showToast("Please fill in where you found it and to whom you submitted it.", "warning");
      return;
    }

    setIsClaimSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        `/api/lost-found/${claimTargetItem._id}/claim-found`,
        {
          foundLocation: foundLocationInput,
          submittedTo: submittedToInput,
        },
        config
      );

      showToast(data.message || "Claim submitted successfully!", "success");
      
      // Update item in local state
      setItems((prev) =>
        prev.map((item) => (item._id === claimTargetItem._id ? data.item : item))
      );

      // Close modal and reset inputs
      setIsClaimModalOpen(false);
      setClaimTargetItem(null);
      setFoundLocationInput("");
      setSubmittedToInput("");

      if (isDetailOpen && selectedItem?._id === claimTargetItem?._id) {
        setSelectedItem(data.item);
      }
    } catch (error) {
      console.error("Error submitting claim for found item:", error);
      showToast(error.response?.data?.message || "Failed to submit found report.", "error");
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  // Filter listings based on selections
  const filteredItems = items.filter((item) => {
    if (item.isHidden) return false;

    // Search query matching
    const matchesSearch =
      (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.surrenderedAt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.submittedTo || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = filterType === "ALL" || item.type === filterType;

    // Status filter
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;

    // Tab filter: recent (all active), lost, found, returned, mine
    let matchesTab = true;
    if (selectedTab === "lost") {
      matchesTab = item.type === "LOST" && (item.status === "Open" || item.status === "At Office");
    } else if (selectedTab === "found") {
      matchesTab = item.type === "FOUND" && (item.status === "Open" || item.status === "At Office");
    } else if (selectedTab === "returned") {
      matchesTab = item.status === "Returned" || item.status === "Claimed";
    } else if (selectedTab === "mine") {
      matchesTab = item.reporter?._id === user?._id;
    } else {
      // "recent"
      matchesTab = item.status === "Open" || item.status === "At Office" || item.status === "Claimed";
    }

    // Categories filter
    let matchesCategory = true;
    if (selectedCategory !== "All") {
      if (item.category) {
        matchesCategory = item.category === selectedCategory;
      } else {
        const nameLower = (item.itemName || "").toLowerCase();
        const descLower = (item.description || "").toLowerCase();
        if (selectedCategory === "Electronics") {
          matchesCategory = ["phone", "laptop", "charger", "earbuds", "headphone", "calculator", "device", "mobile", "watch", "airpods", "ipad", "usb", "drive"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
        } else if (selectedCategory === "Books & Notes") {
          matchesCategory = ["book", "notebook", "copy", "register", "syllabus", "page", "assignment", "diary"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
        } else if (selectedCategory === "Accessories") {
          matchesCategory = ["glass", "glasses", "ring", "watch", "umbrella", "bottle", "key", "chain"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
        } else if (selectedCategory === "Clothing") {
          matchesCategory = ["coat", "jacket", "shirt", "muffler", "cap", "hoodie", "apparel"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
        } else if (selectedCategory === "Keys & Cards") {
          matchesCategory = ["key", "card", "cnic", "id", "license", "file", "document", "slip", "atm", "wallet", "purse"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
        } else if (selectedCategory === "Others") {
          const matchesKnown = ["phone", "laptop", "charger", "earbuds", "headphone", "calculator", "device", "mobile", "card", "cnic", "id", "license", "file", "document", "booklet", "slip", "key", "book", "notebook", "copy", "register", "coat", "jacket", "shirt", "muffler", "glass", "cap", "ring", "watch", "apparel", "bag", "backpack", "wallet", "diary"].some(
            (kw) => nameLower.includes(kw) || descLower.includes(kw)
          );
          matchesCategory = !matchesKnown;
        }
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesTab && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#f8fafc] text-slate-800 font-sans">
        <div className="w-9 h-9 border-3 border-slate-200 border-t-[#2563eb] rounded-full animate-spin"></div>
        <p className="font-semibold text-slate-600 text-sm">{t("Loading Lost & Found Portal...")}</p>
      </div>
    );
  }

  const isAdminOrMod = user?.role === "admin" || user?.role === "campus_admin" || user?.role === "student_mod";

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F0] font-sans text-[#211A24] animate-fade-in relative selection:bg-[#00c2cb]/20 selection:text-[#071A35]">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Floating Toast Notification Popup */}
        {toast && (
          <div className="fixed top-16 right-3 left-3 sm:left-auto sm:right-6 sm:max-w-sm z-[9999] bg-[#0a2342] text-white px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs border border-slate-700 animate-slide-down flex items-center gap-3">
            <span className="text-base">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : toast.type === "warning" ? "⚠️" : "ℹ️"}
            </span>
            <span className="leading-snug">{toast.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            MAIN CONTENT AREA MATCHING EXACT DESIGN REFERENCE IMAGE
           ════════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 p-3 sm:p-5 lg:p-7 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full pb-24">
          
          {/* ── HERO BANNER (Matching Forum & Petitions Theme) ── */}
          <div className="bg-[#071A35] rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-6 lg:p-7 text-white border border-white/10 shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 sm:w-40 h-32 sm:h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col text-left z-10">
              <div className="bg-white/10 text-[#00c2cb] text-[9.5px] sm:text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-2 border border-white/10">
                <span>✨</span>
                <span>CAMPUS BELONGINGS PORTAL</span>
              </div>
              <h1 className="text-xl sm:text-[26px] font-black text-white leading-tight tracking-tight mb-1">
                Lost &amp; Found
              </h1>
              <p className="text-[11px] sm:text-[12px] font-semibold text-white/70 max-w-[550px] leading-relaxed m-0">
                Find your lost items or help others by reporting found items across campus.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap z-10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setNewItemType("LOST");
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11.5px] sm:text-[12px] border border-white/20 transition-all cursor-pointer text-center"
              >
                <span>➕ Report Lost</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewItemType("FOUND");
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-none bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11.5px] sm:text-[12.5px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 border-none"
              >
                <span>+</span>
                <span>Report Found</span>
              </button>
            </div>
          </div>

          {/* ── SEARCH & FILTERS SECTION (Forum Theme) ── */}
          <div className="relative z-10 bg-white rounded-[1.25rem] sm:rounded-[1.5rem] border border-[#E8E1D5] p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_8px_25px_rgba(7,26,53,0.04)]">
            
            {/* Search Input Bar */}
            <div className="relative flex-1 min-w-[260px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search items (e.g. wallet, phone, keys...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-8 py-2.5 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] text-xs font-semibold text-[#211A24] placeholder-[#211A24]/50 focus:outline-none focus:ring-2 focus:ring-[#071A35]/20 shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Row — horizontally scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 md:pb-0 md:justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shrink-0 px-3 py-2 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] sm:text-xs font-extrabold text-[#071A35] focus:outline-none focus:ring-2 focus:ring-[#071A35]/20 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books & Notes">Books & Notes</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Keys & Cards">Keys & Cards</option>
                <option value="Others">Others</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="shrink-0 px-3 py-2 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] sm:text-xs font-extrabold text-[#071A35] focus:outline-none focus:ring-2 focus:ring-[#071A35]/20 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Open">Open</option>
                <option value="At Office">At Office</option>
                <option value="Claimed">Claimed</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setFilterType("ALL");
                  setFilterStatus("ALL");
                }}
                className="shrink-0 px-3 py-2 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] text-[11px] sm:text-xs font-extrabold text-[#211A24]/70 hover:bg-[#F3EEE4] hover:text-[#071A35] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>⚙️</span>
                <span>Reset</span>
              </button>
            </div>

          </div>

          {/* ── TAB NAVIGATION & SORT ROW ── */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E8E1D5] pb-2">
            {/* Tabs — horizontally scrollable on mobile */}
            <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none py-1 flex-1">
              {[
                { id: "recent", label: "Recent" },
                { id: "lost", label: "Lost" },
                { id: "found", label: "Found" },
                { id: "returned", label: "Returned" },
                { id: "mine", label: "Mine" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`shrink-0 pb-2 text-[11.5px] sm:text-sm font-extrabold transition-all relative cursor-pointer whitespace-nowrap ${
                    selectedTab === tab.id
                      ? "text-[#071A35]"
                      : "text-[#211A24]/60 hover:text-[#071A35]"
                  }`}
                >
                  {tab.label}
                  {selectedTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#071A35] rounded-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Sort & View toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-[11px] font-extrabold text-[#071A35] focus:outline-none cursor-pointer hidden sm:block"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>

              <div className="flex items-center gap-0.5 bg-[#FAF7F0] border border-[#E8E1D5] p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs transition-all ${
                    viewMode === "grid" ? "bg-[#071A35] text-white shadow-sm" : "text-slate-500"
                  }`}
                  title="Grid View"
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md text-xs transition-all ${
                    viewMode === "list" ? "bg-[#071A35] text-white shadow-sm" : "text-slate-500"
                  }`}
                  title="List View"
                >
                  ☰
                </button>
              </div>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              MAIN ITEM CARDS FEED
             ───────────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            
            {loading ? (
              <div className="py-24 text-center text-slate-400 font-bold text-xs animate-pulse flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-[#2563eb] rounded-full animate-spin"></div>
                <span>Fetching lost & found items...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 px-6 rounded-2xl bg-white border border-slate-200/80 text-center shadow-sm max-w-md mx-auto flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-3">
                  📦
                </div>
                <h3 className="text-base font-bold text-slate-900">No Items Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  {searchTerm
                    ? `No results for "${searchTerm}". Try resetting your search query.`
                    : selectedTab === "mine"
                    ? "You haven't reported any lost or found items yet."
                    : "No active lost or found reports available in this category."}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setFilterType("ALL");
                    setFilterStatus("ALL");
                    setSelectedTab("recent");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {paginatedItems.map((item) => {
                  const isSaved = savedIds.includes(item._id);
                  const isHighlight = highlightedItemId === item._id;

                  // Category icon & gradient theme mapping
                  const getCategoryGraphic = (cat) => {
                    if (cat === "Electronics") return { icon: "💻", gradient: "from-sky-100 via-blue-50 to-[#FAF7F0]" };
                    if (cat === "Books & Notes") return { icon: "📚", gradient: "from-emerald-100 via-teal-50 to-[#FAF7F0]" };
                    if (cat === "Accessories") return { icon: "👛", gradient: "from-purple-100 via-pink-50 to-[#FAF7F0]" };
                    if (cat === "Clothing") return { icon: "👕", gradient: "from-rose-100 via-orange-50 to-[#FAF7F0]" };
                    if (cat === "Keys & Cards") return { icon: "🔑", gradient: "from-amber-100 via-yellow-50 to-[#FAF7F0]" };
                    return { icon: item.type === "LOST" ? "🔎" : "🎁", gradient: "from-slate-100 via-sky-50 to-[#FAF7F0]" };
                  };

                  const graphic = getCategoryGraphic(item.category);

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleCardClick(item)}
                      className={`group bg-white rounded-[1.5rem] border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-[0_8px_25px_rgba(7,26,53,0.04)] hover:shadow-[0_14px_35px_rgba(7,26,53,0.1)] hover:-translate-y-1 relative ${
                        isHighlight
                          ? "border-[#00c2cb] ring-2 ring-[#00c2cb]/20"
                          : "border-[#E8E1D5] hover:border-[#071A35]/30"
                      }`}
                    >
                      {/* Photo / Stylish Header Graphic */}
                      <div className="relative w-full h-32 sm:h-44 overflow-hidden">
                        {item.image ? (
                          <div className="w-full h-full relative">
                            <img
                              src={item.image}
                              alt={item.itemName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${graphic.gradient} flex flex-col items-center justify-center relative`}>
                            <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-white/60 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                              {graphic.icon}
                            </div>
                          </div>
                        )}

                        {/* Top-Left Type Tag */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className={`px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md border ${
                              item.type === "LOST"
                                ? "bg-rose-500/90 text-white border-rose-400/30"
                                : "bg-emerald-500/90 text-white border-emerald-400/30"
                            }`}
                          >
                            <span>{item.type === "LOST" ? "🔴" : "🟢"}</span>
                            <span>{item.type === "LOST" ? "Lost" : "Found"}</span>
                          </span>
                        </div>

                        {/* Save / Bookmark Button */}
                        <button
                          onClick={(e) => toggleSaveItem(e, item._id)}
                          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-xs shadow-md transition-all ${
                            isSaved ? "text-blue-600 font-bold scale-110" : "text-slate-400 hover:text-slate-700"
                          }`}
                          title={isSaved ? "Saved" : "Save item"}
                        >
                          {isSaved ? "🔖" : "🏷️"}
                        </button>
                      </div>

                      {/* Card Info Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          {/* Title */}
                          <h4 className="text-sm font-extrabold text-[#071A35] line-clamp-1 group-hover:text-[#00c2cb] transition-colors leading-tight">
                            {item.itemName}
                          </h4>

                          {/* Description Snippet */}
                          <p className="text-[11.5px] font-medium text-[#211A24]/70 line-clamp-2 mt-1 leading-snug">
                            {item.description || "No description details provided."}
                          </p>

                          {/* Category Badge & Location */}
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {item.category && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAF7F0] text-[#071A35] border border-[#E8E1D5]">
                                {item.category}
                              </span>
                            )}
                            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 truncate max-w-[170px]">
                              <span>📍</span>
                              <span className="truncate">{item.location || "Campus Grounds"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info Bar */}
                        <div className="text-[10.5px] font-semibold text-slate-400 pt-2.5 border-t border-[#E8E1D5] flex items-center justify-between">
                          <span>⏱️ {formatDate(item.createdAt)}</span>
                          <span
                            className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                              item.status === "Returned" || item.status === "Claimed"
                                ? "bg-purple-50 text-purple-700"
                                : item.status === "At Office"
                                ? "bg-cyan-50 text-[#00c2cb]"
                                : "bg-slate-100 text-[#071A35]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View Layout */
              <div className="space-y-2.5">
                {paginatedItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleCardClick(item)}
                    className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E1D5] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FAF7F0] border border-[#E8E1D5] overflow-hidden flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="text-xl items-center justify-center"
                        style={{ display: item.image ? "none" : "flex" }}
                      >
                        {item.type === "LOST" ? "🔴" : "🟢"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: badge + title */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase ${
                            item.type === "LOST" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#071A35] truncate">{item.itemName}</h4>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 truncate leading-snug">{item.description}</p>

                      {/* Location + Time — inline on sm, stacked on xs if needed */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5 truncate max-w-[120px] sm:max-w-none">
                          📍 <span className="truncate">{item.location}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          ⏱️ {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border ${
                          item.status === "Open"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : item.status === "At Office"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all ${
                    currentPage === 1
                      ? "bg-[#FAF7F0] border-[#E8E1D5] text-[#211A24]/30 cursor-not-allowed"
                      : "bg-white border-[#E8E1D5] text-[#071A35] hover:bg-[#F3EEE4] cursor-pointer shadow-sm"
                  }`}
                >
                  ← Prev
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-[#071A35] text-white border-[#071A35] shadow-md"
                              : "bg-white border-[#E8E1D5] text-[#071A35] hover:bg-[#F3EEE4]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-[#071A35]/40 font-bold text-xs px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all ${
                    currentPage === totalPages
                      ? "bg-[#FAF7F0] border-[#E8E1D5] text-[#211A24]/30 cursor-not-allowed"
                      : "bg-white border-[#E8E1D5] text-[#071A35] hover:bg-[#F3EEE4] cursor-pointer shadow-sm"
                  }`}
                >
                  Next →
                </button>

                {/* Page Info */}
                <span className="text-[11px] font-bold text-[#071A35]/50 ml-1">
                  {currentPage} / {totalPages}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* ══════════════ 8. CREATE REPORT MODAL ══════════════ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0a2342]/75 backdrop-blur-md animate-fade-in">
            <div className="bg-white text-[#0a2342] rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200/80 relative flex flex-col animate-scale-up" style={{maxHeight: '92dvh'}}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
                <div>
                  <h2 className="text-base font-black text-[#0a2342]">Report Belonging</h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Post a new lost or found report</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-[#0a2342] hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Form Container */}
              <form onSubmit={handleCreateReport} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                
                {/* Scrollable Inputs Area */}
                <div className="overflow-y-auto flex-1 pr-0.5 space-y-3">
                  
                  {/* Segmented Type Picker */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setNewItemType("LOST")}
                      className={`py-2 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                        newItemType === "LOST"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-[#0a2342]"
                      }`}
                    >
                      🔴 I Lost Something
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemType("FOUND")}
                      className={`py-2 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                        newItemType === "FOUND"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-[#0a2342]"
                      }`}
                    >
                      🟢 I Found Something
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Item Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Black Leather Wallet, AirPods Pro..."
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#2563eb] cursor-pointer"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Books & Notes">Books &amp; Notes</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Keys & Cards">Keys &amp; Cards</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe color, brand, stickers, contents..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      {newItemType === "LOST" ? "Last Seen Location *" : "Where Found *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Library 2nd Floor, Main Cafeteria..."
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  {newItemType === "FOUND" && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#2563eb] tracking-wider mb-1">
                        Submitted / Surrendered Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Security Office Gate 1, Info Desk..."
                        value={surrenderedAt}
                        onChange={(e) => setSurrenderedAt(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                      Photo Attachment (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="mt-2 relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                </div>

                {/* Fixed Footer Buttons */}
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-[11px] shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "📢 Broadcast Report"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ══════════════ 9. ITEM DETAILS MODAL ══════════════ */}
        {isDetailOpen && selectedItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0a2342]/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="bg-white text-[#0a2342] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-scale-up my-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      selectedItem.type === "LOST" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {selectedItem.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Status: <span className="text-[#0a2342] font-black">{selectedItem.status}</span>
                  </span>
                </div>

                <button
                  onClick={handleCloseDetail}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-[#0a2342] hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 pr-1.5 custom-scrollbar flex-1">
                
                {/* Hero Photo Banner */}
                {selectedItem.image ? (
                  <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={selectedItem.image} alt={selectedItem.itemName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-36 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-1">{selectedItem.type === "LOST" ? "🔴" : "🟢"}</span>
                    <span className="text-xs font-bold">No photo attached</span>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-black text-[#0a2342]">{selectedItem.itemName}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Location Specs Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">📍 Location:</span>
                    <span className="text-[#0a2342] font-black">{selectedItem.location || "Campus Point"}</span>
                  </div>

                  {selectedItem.surrenderedAt && (
                    <div className="flex items-center gap-2 text-[#2563eb]">
                      <span className="font-bold">🏢 Surrendered Office:</span>
                      <span className="font-black">{selectedItem.surrenderedAt}</span>
                    </div>
                  )}

                  {selectedItem.foundLocation && (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="font-bold">🤝 Found Location:</span>
                      <span className="font-black">{selectedItem.foundLocation}</span>
                    </div>
                  )}

                  {selectedItem.submittedTo && (
                    <div className="flex items-center gap-2 text-[#2563eb]">
                      <span className="font-bold">🛡️ Submitted To:</span>
                      <span className="font-black">{selectedItem.submittedTo}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                    <span>⏱️ Date Reported:</span>
                    <span>{formatDate(selectedItem.createdAt)}</span>
                  </div>
                </div>

                {/* Reporter Profile Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getPersonalizedAvatar(selectedItem.reporter?.avatar)}
                      alt={selectedItem.reporter?.name || "Student"}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-black text-[#0a2342]">{selectedItem.reporter?.name || "Campus Student"}</div>
                      <div className="text-[10px] font-bold text-slate-400">Reporter / Submitter</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Detail Modal Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0 flex-wrap">
                
                {/* Delete button (Admin / Mod) */}
                {isAdminOrMod && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem._id)}
                    disabled={deletingIds.has(selectedItem._id)}
                    className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                  >
                    {deletingIds.has(selectedItem._id) ? "Deleting..." : "🗑️ Delete"}
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                  {/* If Lost & Open, show 'I Found This Item' */}
                  {selectedItem.type === "LOST" && selectedItem.status === "Open" && (
                    <button
                      onClick={() => {
                        setClaimTargetItem(selectedItem);
                        setIsClaimModalOpen(true);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] sm:text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      🤝 I Found This!
                    </button>
                  )}

                  {/* If user is reporter or admin, show 'Mark Reunited' */}
                  {(selectedItem.reporter?._id === user?._id || isAdminOrMod) && selectedItem.status !== "Returned" && (
                    <button
                      onClick={() => handleResolveItem(selectedItem._id)}
                      disabled={resolvingIds.has(selectedItem._id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-[11px] sm:text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {resolvingIds.has(selectedItem._id) ? "Updating..." : "✅ Mark Reunited"}
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ══════════════ 10. CLAIM FOUND ITEM MODAL ══════════════ */}
        {isClaimModalOpen && claimTargetItem && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-[#0a2342]/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="bg-white text-[#0a2342] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 relative max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-up my-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div>
                  <h2 className="text-base font-black text-[#0a2342]">Report Item Found</h2>
                  <p className="text-xs text-slate-500 font-medium">Help return "{claimTargetItem.itemName}"</p>
                </div>
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-[#0a2342] flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                      Where did you find this item? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Computer Lab 3 Bench, Library Stairs..."
                      value={foundLocationInput}
                      onChange={(e) => setFoundLocationInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                      To whom / where did you hand it over? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Security Gate 1 Officer, Student Info Desk..."
                      value={submittedToInput}
                      onChange={(e) => setSubmittedToInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0a2342] placeholder-slate-400 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClaimSubmitting}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isClaimSubmitting ? "Notifying Owner..." : "Submit Found Report"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
