import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { fetchBookmarks, removeBookmark } from "../../services/bookmarkService";

/* ============================================================================
   Unified bookmarks page.

   Shows saved Career posts and saved Forum discussions in one list. Styling
   follows the existing pages: #FAF7F0 page background, navy #071A35 hero
   banner, white cards with #E8E1D5 hairline borders, #00c2cb as the accent.
   ========================================================================= */

const TABS = [
  { id: "all", label: "All" },
  { id: "career", label: "Career Paths" },
  { id: "forum", label: "Discussions" },
];

export default function Bookmarks() {
  const navigate = useNavigate();

  // Page shell state, mirroring the other pages so Topbar/Sidebar behave the same
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, career: 0, forum: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Auth guard and profile load, matching the other pages
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const cached = sessionStorage.getItem("user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch (e) { /* fall through to the network fetch below */ }
    }

    const loadProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);
        setUser(data);
        if (data.avatar) setAvatar(data.avatar);
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Bookmarks are re-fetched per tab so filtering stays correct even if the
  // user bookmarks something in another tab and comes back.
  const loadBookmarks = useCallback(async (tab) => {
    setIsLoading(true);
    setError(null);
    try {
      const { bookmarks: items, counts: newCounts } = await fetchBookmarks(tab);
      setBookmarks(items);
      setCounts(newCounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks(activeTab);
  }, [activeTab, loadBookmarks]);

  const handleRemove = async (post, e) => {
    e.stopPropagation();
    if (removingId) return;

    setRemovingId(post._id);
    const snapshot = bookmarks;

    // Remove from the list straight away; restore it if the request fails.
    setBookmarks((prev) => prev.filter((b) => b._id !== post._id));
    setCounts((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      [post.type]: Math.max(0, prev[post.type] - 1),
    }));

    try {
      const { message } = await removeBookmark(post._id, post.type);
      showToast(message, "success");
    } catch (err) {
      setBookmarks(snapshot);
      loadBookmarks(activeTab);
      showToast(err.message, "error");
    } finally {
      setRemovingId(null);
    }
  };

  // Clicking a card opens the post on its own page.
  //
  // Both pages resolve a target from router state (Forum additionally accepts a
  // ?threadId= query param, Career does not) so state is the one contract that
  // works for both. Passing a query string here would silently no-op on Career.
  const openPost = (post) => {
    navigate(post.type === "career" ? "/career" : "/forum", {
      state: { threadId: post._id },
    });
  };

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

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
          handleAvatarChange={null}
          isUploading={isUploading}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6 max-w-full [&>*]:animate-fade-in">

          {/* ── Hero banner ── */}
          <div className="bg-[#071A35] text-white rounded-[1.5rem] p-5 sm:p-7 border border-[#071A35] shadow-[0_12px_35px_rgba(7,26,53,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            <div className="flex flex-col text-left z-10">
              <h1 className="text-[20px] sm:text-[26px] font-black text-white tracking-tight m-0 mb-1.5">
                My Bookmarks
              </h1>
              <p className="text-[11.5px] sm:text-[12px] text-white/70 font-semibold m-0 max-w-[550px] leading-relaxed">
                Every career post and discussion you have saved, in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 z-10">
              <span className="text-[11px] font-extrabold text-[#071A35] bg-[#00c2cb] px-4 py-2 rounded-full shadow-sm">
                {counts.total} {counts.total === 1 ? "Saved Item" : "Saved Items"}
              </span>
            </div>
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tab.id === "all" ? counts.total : counts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-9 px-4 rounded-full text-[12px] font-extrabold border transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-[#071A35] border-[#071A35] text-white shadow-sm"
                      : "bg-white border-[#E8E1D5] text-slate-600 hover:border-[#00c2cb] hover:text-[#071A35]"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E8E1D5] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(7,26,53,0.03)] animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200" />
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {!isLoading && error && (
            <div className="bg-white border-2 border-dashed border-rose-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <i className="fa-solid fa-circle-exclamation text-lg text-rose-500 flex items-center justify-center" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-[#071A35] mb-1">Could not load bookmarks</h3>
                <p className="text-[12px] text-slate-500 font-medium max-w-[320px]">{error}</p>
              </div>
              <button
                onClick={() => loadBookmarks(activeTab)}
                className="h-9 px-5 rounded-full bg-[#071A35] text-white text-[12px] font-extrabold border-none cursor-pointer hover:bg-[#0a2342] transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Empty ── */}
          {!isLoading && !error && bookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white border-2 border-dashed border-[#E8E1D5] rounded-2xl w-full shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center mb-3">
                <i className="fa-solid fa-bookmark text-lg text-[#00c2cb] flex items-center justify-center" />
              </div>
              <h3 className="text-[14.5px] font-black text-[#071A35] mb-1">
                {activeTab === "all" ? "No bookmarks yet" : `No saved ${activeTab === "career" ? "career posts" : "discussions"}`}
              </h3>
              <p className="text-[12px] text-slate-500 font-medium max-w-[300px] leading-relaxed mb-4">
                Tap the bookmark icon on any career post or discussion to save it here for later.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/career")}
                  className="h-9 px-4 rounded-full bg-[#071A35] text-white text-[11.5px] font-extrabold border-none cursor-pointer hover:bg-[#0a2342] transition-colors"
                >
                  Browse Career Paths
                </button>
                <button
                  onClick={() => navigate("/forum")}
                  className="h-9 px-4 rounded-full bg-white text-[#071A35] text-[11.5px] font-extrabold border border-[#E8E1D5] cursor-pointer hover:border-[#00c2cb] transition-colors"
                >
                  Browse Discussions
                </button>
              </div>
            </div>
          )}

          {/* ── List ── */}
          {!isLoading && !error && bookmarks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start pb-4">
              {bookmarks.map((post) => {
                const isCareer = post.type === "career";
                const authorName =
                  post.author?.name || post.author?.registeration_number || "Student";

                return (
                  <div
                    key={`${post.type}-${post._id}`}
                    onClick={() => openPost(post)}
                    className={`group bg-white border border-[#E8E1D5] rounded-2xl p-4 sm:p-4.5 cursor-pointer flex flex-col justify-between gap-3 transition-all duration-300 relative overflow-hidden border-l-4 border-l-transparent hover:border-l-[#00c2cb] shadow-[0_4px_16px_rgba(7,26,53,0.03)] hover:shadow-[0_10px_24px_rgba(7,26,53,0.08)] hover:-translate-y-1 hover:border-[#00c2cb]/40 ${
                      removingId === post._id ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* Header: author + type badge + remove */}
                    <div className="flex items-center justify-between gap-2 text-left">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=071A35&color=fff`}
                          alt={authorName}
                          className="w-7 h-7 rounded-full object-cover border border-[#071A35]/10 shadow-xs shrink-0"
                        />
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-[11.5px] font-bold text-[#071A35] line-clamp-1">
                            {authorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            isCareer
                              ? "bg-[#00c2cb]/10 text-[#00808a] border-[#00c2cb]/30"
                              : "bg-[#071A35]/10 text-[#071A35] border-[#071A35]/15"
                          }`}
                        >
                          {isCareer ? "Career" : "Discussion"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleRemove(post, e)}
                          disabled={removingId === post._id}
                          title="Remove from bookmarks"
                          aria-label="Remove from bookmarks"
                          className="w-7 h-7 shrink-0 rounded-full border border-[#00c2cb] bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 active:scale-95 disabled:opacity-60"
                        >
                          {removingId === post._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <i className="fa-solid fa-bookmark text-xs flex items-center justify-center" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-1 text-left flex-1">
                      <h3 className="text-[14px] font-extrabold text-[#071A35] leading-snug group-hover:text-[#00c2cb] transition-colors line-clamp-2">
                        {post.title || "Untitled"}
                      </h3>

                      {post.content && (
                        <p className="text-[11.5px] font-medium text-slate-500 line-clamp-2 leading-relaxed m-0">
                          {post.content}
                        </p>
                      )}

                      {/* Career-specific meta */}
                      {isCareer && (post.company || post.location || post.jobType) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {[post.company, post.location, post.jobType]
                            .filter(Boolean)
                            .map((meta, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                              >
                                {meta}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Forum tags */}
                      {!isCareer && post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {post.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold text-[#00c2cb] bg-[#00c2cb]/10 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image */}
                    {post.image && (
                      <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900/5">
                        <img
                          src={post.image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={(e) => { e.target.parentElement.style.display = "none"; }}
                        />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-left mt-auto">
                      <div className="flex items-center gap-1.5 bg-slate-100/80 group-hover:bg-[#00c2cb]/10 px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-slate-600 group-hover:text-[#00c2cb] transition-colors">
                        <i className="fa-solid fa-comments text-xs flex items-center justify-center" />
                        <span>
                          {post.repliesCount} {post.repliesCount === 1 ? "reply" : "replies"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#071A35] group-hover:text-[#00c2cb] transition-colors">
                        <span>Open</span>
                        <i className="fa-solid fa-chevron-right text-[10px] transition-transform duration-200 group-hover:translate-x-1 flex items-center justify-center" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div
          key={toast.id}
          className={`fixed bottom-6 right-6 z-[2000] px-4 py-3 rounded-xl shadow-lg border text-[12px] font-bold flex items-center gap-2 animate-fade-in max-w-[320px] ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-white border-[#E8E1D5] text-[#071A35]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === "error" ? "bg-rose-500" : "bg-[#00c2cb]"
            }`}
          />
          {toast.message}
        </div>
      )}
    </div>
  );
}
