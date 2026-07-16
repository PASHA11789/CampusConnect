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

  // Lost & Found items states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState("all"); // "all", "mine"
  const [filterType, setFilterType] = useState("ALL"); // "ALL", "LOST", "FOUND"
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "Open", "At Office"

  // Create report form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState("LOST"); // "LOST" or "FOUND"
  const [itemName, setItemName] = useState("");
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
            }).filter((item) => item._id !== data.itemId) // Optional: remove resolved items from direct active feed
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

  // Image upload preview handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Report post submit handler
  const handleCreateReport = async (e) => {
    e.preventDefault();
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
      formData.append("type", newItemType);
      formData.append("itemName", itemName);
      formData.append("description", description);
      formData.append("location", locationName);
      if (newItemType === "FOUND" && surrenderedAt.trim()) {
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
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = filterType === "ALL" || item.type === filterType;

    // Status filter
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;

    // Mine / All tab filter
    const matchesTab = selectedTab === "all"
      ? (item.status === "Open" || item.status === "At Office")
      : (item.reporter?._id === user?._id);

    // Categories filter (Mock category mapping based on keywords)
    let matchesCategory = true;
    if (selectedCategory !== "All") {
      const nameLower = (item.itemName || "").toLowerCase();
      const descLower = (item.description || "").toLowerCase();
      if (selectedCategory === "Electronics") {
        matchesCategory = ["phone", "laptop", "charger", "earbuds", "headphone", "calculator", "device", "mobile"].some(
          (kw) => nameLower.includes(kw) || descLower.includes(kw)
        );
      } else if (selectedCategory === "Documents") {
        matchesCategory = ["card", "cnic", "id", "license", "file", "document", "booklet", "slip"].some(
          (kw) => nameLower.includes(kw) || descLower.includes(kw)
        );
      } else if (selectedCategory === "Keys") {
        matchesCategory = nameLower.includes("key") || descLower.includes("key");
      } else if (selectedCategory === "Books") {
        matchesCategory = ["book", "notebook", "copy", "register", "syllabus", "page"].some(
          (kw) => nameLower.includes(kw) || descLower.includes(kw)
        );
      } else if (selectedCategory === "Clothing") {
        matchesCategory = ["coat", "jacket", "shirt", "muffler", "glass", "cap", "ring", "watch", "apparel"].some(
          (kw) => nameLower.includes(kw) || descLower.includes(kw)
        );
      } else if (selectedCategory === "Others") {
        // Fallback checks
        const matchesKnown = ["phone", "laptop", "charger", "earbuds", "headphone", "calculator", "device", "mobile", "card", "cnic", "id", "license", "file", "document", "booklet", "slip", "key", "book", "notebook", "copy", "register", "coat", "jacket", "shirt", "muffler", "glass", "cap", "ring", "watch", "apparel"].some(
          (kw) => nameLower.includes(kw) || descLower.includes(kw)
        );
        matchesCategory = !matchesKnown;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesTab && matchesCategory;
  });

  const tabPills = ["All", "Electronics", "Documents", "Keys", "Books", "Clothing", "Others"];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t("Loading portal state...")}</p>
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
            setUser={setUser}
            avatar={getPersonalizedAvatar(avatar)}
            handleAvatarChange={handleAvatarChange}
            isUploading={isUploading}
          />

          <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">
            
            {/* Split layout wrapper */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Header neon banner */}
              <div className="relative flex justify-between items-center bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#00c2cb]/90 border border-slate-200/30 rounded-3xl p-8 overflow-hidden shadow-lg animate-slide-down">
                <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-[#00c2cb]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -top-12 w-36 h-36 bg-[#00d4ff]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col z-10">
                  <h1 className="text-[30px] font-black text-white tracking-tight leading-none drop-shadow-sm">{t("Lost & Found")}</h1>
                  <p className="text-[14px] text-[#e0f2f1]/90 mt-2.5 font-medium max-w-[500px] leading-relaxed">
                    {t("Reclaim your misplaced accessories, or report found items to support your peers on campus.")}
                  </p>
                </div>
                
                <div className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[#00c2cb] opacity-25 pointer-events-none max-sm:hidden z-10 transition-transform duration-300 hover:scale-105">
                  <svg className="w-28 h-28 drop-shadow-[0_4px_12px_rgba(0,194,203,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <path d="M11 8v5h3" />
                  </svg>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                {/* Search Bar */}
                <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm flex-1 min-w-[240px]">
                  <svg className="w-4 h-4 text-slate-400 ml-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("Search by item name, details, or locations...")}
                    className="bg-transparent border-none text-[13px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none py-2.5 pr-4 flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Tab select and Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Scope Tabs */}
                  <div className="flex gap-1 bg-slate-200/50 p-1 rounded-full border border-slate-200">
                    <button
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                        selectedTab === "all" ? "bg-[#0a2342] text-white shadow-sm" : "text-slate-600 hover:text-[#0a2342]"
                      }`}
                      onClick={() => setSelectedTab("all")}
                    >
                      {t("All Feed")}
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                        selectedTab === "mine" ? "bg-[#0a2342] text-white shadow-sm" : "text-slate-600 hover:text-[#0a2342]"
                      }`}
                      onClick={() => setSelectedTab("mine")}
                    >
                      {t("My Reports")}
                    </button>
                  </div>

                  {/* Dropdowns */}
                  <select
                    className="bg-white border border-slate-200 rounded-full px-4 py-2 text-xs font-bold text-[#0a2342] focus:outline-none shadow-sm cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="ALL">{t("All Categories")}</option>
                    <option value="LOST">{t("Lost Only")}</option>
                    <option value="FOUND">{t("Found Only")}</option>
                  </select>

                  <select
                    className="bg-white border border-slate-200 rounded-full px-4 py-2 text-xs font-bold text-[#0a2342] focus:outline-none shadow-sm cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">{t("All Statuses")}</option>
                    <option value="Open">{t("Open")}</option>
                    <option value="At Office">{t("At Office")}</option>
                  </select>

                  {/* New Report Button */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-[#00c2cb] to-[#00a8b0] text-white px-5 py-2.5 rounded-full text-xs font-black transition-all hover:shadow-[0_4px_15px_rgba(0,194,203,0.3)] active:scale-95 shadow-md"
                  >
                    + {t("Report Belonging")}
                  </button>
                </div>
              </div>

              {/* Horizontal Category pills filter */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {tabPills.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#00c2cb]/12 text-[#00c2cb] border-[#00c2cb]/30 font-black"
                        : "bg-white text-slate-500 border-slate-200 hover:text-[#0a2342]"
                    }`}
                  >
                    {t(cat)}
                  </button>
                ))}
              </div>

              {/* Items Cards listing feed */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin" />
                  <p className="text-slate-400 text-xs font-semibold">{t("Synchronizing Live Feed...")}</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1">
                  {filteredItems.map((item) => {
                    const isLost = item.type === "LOST";
                    const isHighlighted = item._id === highlightedItemId;

                    return (
                      <div
                        key={item._id}
                        onClick={() => handleCardClick(item)}
                        className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-1 relative cursor-pointer group ${
                          isHighlighted ? "border-[#00c2cb] ring-2 ring-[#00c2cb]/20 animate-pulse" : "border-slate-200"
                        }`}
                      >
                        {/* Image area with absolute Badge type */}
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.itemName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-b border-slate-100">
                              <span className="text-2xl">📦</span>
                              <span className="text-[10px] font-black mt-1.5 uppercase tracking-wider">{t("No Photo Attached")}</span>
                            </div>
                          )}
                          <span
                            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase shadow-sm ${
                              isLost ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                            }`}
                          >
                            {t(item.type)}
                          </span>
                        </div>

                        {/* Content text */}
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-[#0a2342] text-[16px] leading-tight line-clamp-1 group-hover:text-[#00c2cb] transition-colors">
                              {item.itemName}
                            </h3>

                            <div className="flex flex-col gap-1 mt-2.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                <span>📍</span>
                                <span>{item.location}</span>
                              </div>
                              {item.surrenderedAt && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                                  <span>🏢</span>
                                  <span>{t("Deposited at")}: {item.surrenderedAt}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-slate-500 text-[12.5px] leading-relaxed font-medium mt-3.5 line-clamp-3">
                              {item.description}
                            </p>
                          </div>

                          {/* Footer with avatar and resolver triggers */}
                          <div
                            className="border-t border-slate-100 pt-4 flex justify-between items-center mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={item.reporter?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reporter?.name || "User")}`}
                                className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                                alt=""
                              />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-800 leading-none">{item.reporter?.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                                  {item.reporter?.registeration_number || t("Student")}
                                </span>
                              </div>
                            </div>

                            {item.reporter?._id === user?._id ? (
                              <button
                                onClick={() => handleResolveItem(item._id)}
                                disabled={resolvingIds.has(item._id)}
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3.5 py-2 rounded-xl text-[11px] font-black transition-all border border-emerald-100 active:scale-95 disabled:opacity-50"
                              >
                                {resolvingIds.has(item._id) ? (
                                  <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                ) : (
                                  t("Mark Claimed")
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                {item.type === "LOST" && (item.status === "Open" || item.status === "At Office") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setClaimTargetItem(item);
                                      setIsClaimModalOpen(true);
                                    }}
                                    className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all active:scale-95 cursor-pointer"
                                  >
                                    {t("Found It?")}
                                  </button>
                                )}
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                                  {t(item.status)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-bold shadow-sm animate-fade-in">
                  <span className="text-3xl block mb-2">🔎</span>
                  {t("No items match your filter criteria or search keyword.")}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail overlay Modal */}
      {isDetailOpen && selectedItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2100] p-4 animate-fade-in"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl p-7 max-w-[500px] w-full shadow-2xl relative animate-modal-slide-in flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-[#0a2342] transition-colors"
              onClick={handleCloseDetail}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Badge type header */}
            <div className="flex justify-between items-center pr-8">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                  selectedItem.type === "LOST" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {t(selectedItem.type)} Item
              </span>
              <span className="text-[11px] text-slate-400 font-bold">{formatDate(selectedItem.createdAt)}</span>
            </div>

            {/* Image display */}
            {selectedItem.image ? (
              <img
                src={selectedItem.image}
                alt={selectedItem.itemName}
                className="w-full max-h-64 object-cover rounded-2xl border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="h-40 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-100">
                <span className="text-3xl">📦</span>
                <span className="text-[11px] font-black mt-1 uppercase tracking-wider">{t("No Image Attached")}</span>
              </div>
            )}

            {/* Body texts details */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] font-black text-[#0a2342] leading-tight">{selectedItem.itemName}</h2>
              <div className="flex flex-col gap-1 mt-1 text-[12.5px] font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{t("Lost/Found Location")}: <strong className="text-[#0a2342]">{selectedItem.location}</strong></span>
                </div>
                {selectedItem.surrenderedAt && (
                  <div className="flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>{t("Deposited at Office Desk")}: <strong className="text-[#0a2342]">{selectedItem.surrenderedAt}</strong></span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{selectedItem.description}</p>
              </div>

              {selectedItem.status === "Claimed" && selectedItem.foundBy && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-3 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🎉</span>
                    <strong className="text-[13px] text-emerald-800 font-black">{t("Misplaced Item Has Been Located!")}</strong>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[12px] text-emerald-700 font-semibold pl-6">
                    <div>
                      <span>🔍 {t("Found by")}: </span>
                      <strong className="text-emerald-900">{selectedItem.foundBy.name} ({selectedItem.foundBy.registeration_number || t("Student")})</strong>
                    </div>
                    <div>
                      <span>📍 {t("Where it was found")}: </span>
                      <strong className="text-emerald-900">{selectedItem.foundLocation}</strong>
                    </div>
                    <div>
                      <span>🏢 {t("Where it was submitted")}: </span>
                      <strong className="text-emerald-900">{selectedItem.submittedTo}</strong>
                    </div>
                    {selectedItem.foundAt && (
                      <div>
                        <span>📅 {t("When")}: </span>
                        <strong className="text-emerald-900">{formatDate(selectedItem.foundAt)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with reporter identity */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedItem.reporter?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.reporter?.name || "User")}`}
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-slate-800 leading-none">{selectedItem.reporter?.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {selectedItem.reporter?.registeration_number || t("Student")}
                  </span>
                </div>
              </div>

              {selectedItem.reporter?._id === user?._id && (selectedItem.status === "Open" || selectedItem.status === "At Office") && (
                <button
                  onClick={() => handleResolveItem(selectedItem._id)}
                  disabled={resolvingIds.has(selectedItem._id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {resolvingIds.has(selectedItem._id) ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t("Mark Claimed")
                  )}
                </button>
              )}

              {selectedItem.reporter?._id !== user?._id && selectedItem.type === "LOST" && (selectedItem.status === "Open" || selectedItem.status === "At Office") && (
                <button
                  onClick={() => {
                    setClaimTargetItem(selectedItem);
                    setIsClaimModalOpen(true);
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-sky-500/20 active:scale-95 cursor-pointer"
                >
                  {t("I Found This")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal Wizard overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2100] p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-[500px] shadow-2xl relative animate-modal-slide-in overflow-hidden">
            {/* Header */}
            <div className="bg-[#0a2342] text-white p-6 flex justify-between items-center">
              <h2 className="text-[18px] font-black">{t("Report Misplaced Item")}</h2>
              <button
                className="text-white/70 hover:text-white text-[16px] font-bold"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateReport} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Type toggle selection */}
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setNewItemType("LOST")}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    newItemType === "LOST" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t("I Lost Something")}
                </button>
                <button
                  type="button"
                  onClick={() => setNewItemType("FOUND")}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    newItemType === "FOUND" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t("I Found Something")}
                </button>
              </div>

              {/* Item name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Item Name")} *</label>
                <input
                  type="text"
                  required
                  placeholder={t("e.g. Leather Wallet, Student ID Card, Keys")}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb]"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Location")} *</label>
                <input
                  type="text"
                  required
                  placeholder={t("e.g. Cafeteria Table, Library 2nd Floor, Room 102")}
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb]"
                />
              </div>

              {/* Deposited office for found items */}
              {newItemType === "FOUND" && (
                <div className="flex flex-col gap-1.5 animate-slide-down">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Surrendered Desk (Optional)")}</label>
                  <input
                    type="text"
                    placeholder={t("e.g. Admin Block Front Reception Desk, Library counter")}
                    value={surrenderedAt}
                    onChange={(e) => setSurrenderedAt(e.target.value)}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb]"
                  />
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Description & Details")} *</label>
                <textarea
                  required
                  rows="3"
                  placeholder={t("Mention color, brand logo, serial numbers, keychains, stickers, or notable characteristics...")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-slate-200 rounded-xl p-4 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] resize-none"
                />
              </div>

              {/* Photo upload dropzone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Item Photo Attachment")}</label>
                <div className="border border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer relative hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} className="max-h-36 object-contain rounded-xl shadow-sm" alt="Preview" />
                  ) : (
                    <div className="text-center py-2 flex flex-col items-center gap-1">
                      <span className="text-2xl">📷</span>
                      <span className="text-[11px] block text-[#00c2cb] font-black mt-1">{t("Select Image File")}</span>
                      <span className="text-[9px] block text-slate-400 font-bold">{t("JPG, PNG up to 5MB")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0a2342] text-white py-3 rounded-xl text-xs font-black transition-all hover:bg-[#103054] active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("Uploading & Scanning...")}</span>
                  </>
                ) : (
                  <span>{t("Publish Report")}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim Found Modal overlay */}
      {isClaimModalOpen && claimTargetItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2200] p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-[450px] shadow-2xl relative animate-modal-slide-in overflow-hidden">
            {/* Header */}
            <div className="bg-sky-900 text-white p-6 flex justify-between items-center">
              <h2 className="text-[17px] font-black">{t("Report Found Item")}</h2>
              <button
                type="button"
                className="text-white/70 hover:text-white text-[16px] font-bold cursor-pointer"
                onClick={() => {
                  setIsClaimModalOpen(false);
                  setClaimTargetItem(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleClaimSubmit} className="p-6 flex flex-col gap-4">
              <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
                {t("You are reporting that you found")} <strong className="text-[#0a2342]">"{claimTargetItem.itemName}"</strong>. {t("Please provide details so the owner can retrieve it.")}
              </p>

              {/* Where did you find it? */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("Where did you find this item?")} *</label>
                <input
                  type="text"
                  required
                  placeholder={t("e.g. Library 2nd floor, Cafeteria side table")}
                  value={foundLocationInput}
                  onChange={(e) => setFoundLocationInput(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb]"
                />
              </div>

              {/* To whom did you submit it? */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{t("To whom/where did you submit it?")} *</label>
                <input
                  type="text"
                  required
                  placeholder={t("e.g. Front desk security office, keeping it with me")}
                  value={submittedToInput}
                  onChange={(e) => setSubmittedToInput(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isClaimSubmitting}
                className="bg-sky-600 text-white py-3 rounded-xl text-xs font-black transition-all hover:bg-sky-700 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isClaimSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("Submitting...")}</span>
                  </>
                ) : (
                  <span>{t("Submit Report")}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Global Toast notifications */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${
          toast.type === "warning"
            ? "border-l-4 border-l-amber-500"
            : toast.type === "error"
            ? "border-l-4 border-l-red-500"
            : toast.type === "success"
            ? "border-l-4 border-l-emerald-500"
            : "border-l-4 border-l-[#00c2cb]"
        }`}>
          <div className="text-[18px] mt-0.5">
            {toast.type === "warning" && <span>⚠️</span>}
            {toast.type === "error" && <span>❌</span>}
            {toast.type === "success" && <span>✅</span>}
            {toast.type === "info" && <span>ℹ️</span>}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === "warning"
                ? t("AI Moderation Alert")
                : toast.type === "error"
                ? t("Error occurred")
                : toast.type === "success"
                ? t("Success")
                : t("Portal Notice")}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button
            className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
