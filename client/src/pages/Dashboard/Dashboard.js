import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
// Layout Components

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Dashboard Widgets
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import CanteenWidget from "../../components/dashboard/CanteenWidget";
import ForumsWidget from "../../components/dashboard/ForumsWidget";
import PetitionsWidget from "../../components/dashboard/PetitionsWidget";
import LostFoundWidget from "../../components/dashboard/LostFoundWidget";
import BusRoutesWidget from "../../components/dashboard/BusRoutesWidget";

const t = (s) => s;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    notifications: { forums: 0, petitions: 0, updates: 0 },
    forums: [],
    petitions: [],
    lostAndFound: [],
    busRoutes: []
  });

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    // Auth guard
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Load initial user details from cache for premium instant rendering
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

    // Fetch latest user profile dynamically from server to sync state & avoid stale cache
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
        console.error("Failed to fetch latest user profile from server:", error);
      }
    };
    fetchUserProfile();

    // Remove legacy global avatar cache to avoid leaking profile pictures between different users
    sessionStorage.removeItem("userAvatar");

    // Clock
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/dashboard/summary", config);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    if (user) {
      fetchDashboardData();

      // Establish Socket.io connection for real-time updates
      const socket = io("http://localhost:5000");

      socket.on("connect", () => {
        console.log("⚡ Connected to live updates socket");
      });

      socket.on("new_forum_thread", (data) => {
        console.log("⚡ New forum thread received via socket:", data);
        if (data && data.thread) {
          setDashboardData((prevData) => {
            // Check if thread already exists to avoid duplicates
            const threadExists = prevData.forums.some(
              (f) => f._id === data.thread._id
            );
            if (threadExists) return prevData;

            // Prepend new thread and limit to 5 threads maximum
            return {
              ...prevData,
              forums: [data.thread, ...prevData.forums].slice(0, 5)
            };
          });
        }
      });

      socket.on("new_reply", (data) => {
        console.log("⚡ New reply received via socket:", data);
        if (data && data.threadId) {
          setActiveThread((prevActive) => {
            if (prevActive && prevActive._id === data.threadId) {
              const replyExists = prevActive.replies.some(
                (r) => r._id === data.reply._id
              );
              if (replyExists) return prevActive;
              return {
                ...prevActive,
                repliesCount: data.repliesCount,
                replies: [...prevActive.replies, data.reply]
              };
            }
            return prevActive;
          });

          setDashboardData((prevData) => ({
            ...prevData,
            forums: prevData.forums.map((f) =>
              f._id === data.threadId ? { ...f, repliesCount: data.repliesCount } : f
            )
          }));
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from live updates socket");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const handleThreadClick = (id) => {
    navigate("/forum", { state: { threadId: id } });
  };



  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeThread) return;
    setIsSubmittingReply(true);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/forums/${activeThread._id}/replies`, {
        content: replyContent
      }, config);

      if (data.underReview) {
        alert("Your reply contains flagged keywords and has been sent for moderator review.");
      } else {
        setActiveThread(prev => {
          if (!prev) return null;
          return {
            ...prev,
            repliesCount: prev.repliesCount + 1,
            replies: [...prev.replies, data.reply]
          };
        });

        setDashboardData(prev => ({
          ...prev,
          forums: prev.forums.map(f => f._id === activeThread._id ? { ...f, repliesCount: f.repliesCount + 1 } : f)
        }));
      }

      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to submit comment.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Premium micro-animation / optimistic update: preview image immediately
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

        // Sync with user details in state & local storage
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
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");

      // Revert to original database-saved avatar on error
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

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  if (!user) return null;

  return (
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

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4 [&>*]:animate-fade-in">
          <WelcomeBanner user={user} avatar={getPersonalizedAvatar(avatar)} />
          <CanteenWidget />

          <div className="grid grid-cols-[0.9fr_1.1fr] gap-6 max-[1200px]:grid-cols-1">
            <div className="flex flex-col gap-6 min-w-0">
              <ForumsWidget
                forums={dashboardData.forums}
                onThreadClick={handleThreadClick}
              />
            </div>

            <div className="flex flex-col gap-6 min-w-0">
              <PetitionsWidget petitions={dashboardData.petitions} />
              <div className="bg-white border border-slate-200 rounded-2xl p-[22px] grid grid-cols-2 gap-5 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                <LostFoundWidget items={dashboardData.lostAndFound} />
                <BusRoutesWidget busRoutes={dashboardData.busRoutes} />
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
  );
}
