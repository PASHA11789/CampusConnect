import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Dashboard Widgets
import StudentCard from "../../components/dashboard/StudentCard";
import CareerPathExplorer from "../../components/dashboard/CareerPathExplorer";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    notifications: { forums: 0, petitions: 0, updates: 0 },
    forums: [],
    petitions: [],
    lostAndFound: [],
    careers: [],
    busRoutes: []
  });

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

    // Fetch live dashboard data
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/dashboard/summary", config);
        const serverPetitions = data.petitions || [];
        const localPetitions = JSON.parse(localStorage.getItem("my_created_petitions") || "[]");
        const filteredLocal = localPetitions.filter(lp => !serverPetitions.some(sp => sp._id === lp._id));
        const mergedPetitions = [...filteredLocal, ...serverPetitions].slice(0, 5);
        setDashboardData({
          ...data,
          petitions: mergedPetitions
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    if (user) {
      fetchDashboardData();

      // Establish Socket.io connection for real-time updates
      const socket = io(SOCKET_URL);

      socket.on("connect", () => {
        console.log("⚡ Connected to live updates socket");

        // Join scope rooms for live updates
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
        console.log("⚡ New petition received via socket:", newPetition);
        if (newPetition) {
          setDashboardData((prevData) => {
            const exists = prevData.petitions.some((p) => p._id === newPetition._id);
            if (exists) return prevData;

            // Prepend new petition and limit to 5 active petitions maximum
            return {
              ...prevData,
              petitions: [newPetition, ...prevData.petitions].slice(0, 5)
            };
          });
        }
      });

      socket.on("petition_signed", (data) => {
        console.log("⚡ Petition signature update received via socket:", data);
        if (data && data.petitionId) {
          setDashboardData((prevData) => {
            // Remove if no longer active (e.g. Under Review)
            if (data.status && data.status !== "Active") {
              return {
                ...prevData,
                petitions: prevData.petitions.filter((p) => p._id !== data.petitionId)
              };
            }

            return {
              ...prevData,
              petitions: prevData.petitions.map((p) => {
                if (p._id === data.petitionId) {
                  const updatedSignatures = new Array(data.currentSignatures).fill(null);
                  return {
                    ...p,
                    signatures: updatedSignatures,
                    status: data.status || p.status
                  };
                }
                return p;
              })
            };
          });
        }
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

    return () => clearInterval(tick);
  }, [navigate, user?._id]);

  const handleThreadClick = (threadId) => {
    navigate(`/forum?thread=${threadId}`);
  };

  const handleCareerThreadClick = (threadId) => {
    navigate(`/career?id=${threadId}`);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optimistic Preview UI
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#FAF7F0]">
        <div className="w-8 h-8 border-3 border-[#E8E1D5] border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-[#071A35] text-[14.5px] font-semibold">Loading dashboard...</p>
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

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6 max-w-full [&>*]:animate-fade-in">

          {/* Welcome Hero Banner */}
          <div className="bg-white rounded-[1.5rem] p-5 sm:p-7 border border-[#E8E1D5] shadow-[0_10px_35px_rgba(7,26,53,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-col text-left">
              <div className="text-[10.5px] sm:text-[11px] font-black text-[#F5B82E] tracking-widest uppercase flex items-center gap-1 mb-1">
                <span>STUDENT DASHBOARD</span>
                <span>✨</span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] xl:text-[28px] font-black text-[#071A35] leading-[1.25] tracking-tight mb-2">
                Your campus world, curated for {user?.name || 'Hamza Malik'}.
              </h1>
              <p className="text-[11px] sm:text-[12px] font-medium text-[#211A24]/70 max-w-[600px] leading-relaxed m-0">
                Move through services, food spots, community spaces, petitions, routes, and opportunities from one expressive dashboard designed to feel alive.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 max-md:hidden">
              <span className="text-[11px] font-extrabold text-[#071A35] bg-[#FAF7F0] px-4 py-2 rounded-full border border-[#E8E1D5] shadow-sm">
                🌙 Campus Ecosystem Active
              </span>
            </div>
          </div>

          {/* Student Card & Lost & Found Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5 sm:gap-6 items-stretch">
            <StudentCard user={user} avatar={getPersonalizedAvatar(avatar)} />
            <LostFoundWidget items={dashboardData.lostAndFound} />
          </div>

          {/* Canteen & Eateries Section */}
          <CanteenWidget />

          {/* Dedicated Wide Row for Student Forums & Active Petitions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            <ForumsWidget
              forums={dashboardData.forums}
              onThreadClick={handleThreadClick}
            />

            <PetitionsWidget petitions={dashboardData.petitions} />
          </div>

          {/* Career & Alumni Hub + Bus Routes Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch mb-2">
            <CareerPathExplorer
              careers={dashboardData.careers}
              onThreadClick={handleCareerThreadClick}
            />
            <BusRoutesWidget busRoutes={dashboardData.busRoutes} />
          </div>

          {/* Footer */}
          <footer className="mt-2 py-4 border-t border-[#E8E1D5] text-center">
            <p className="text-[11px] sm:text-[12px] text-[#211A24]/60 font-semibold tracking-wide m-0">
              {t('© 2026 CampusConnect. An idea by')} <span className="text-[#071A35] font-black">{t('Mr. Sagheer Ahmad')}</span> &amp;{" "}
              <span className="text-[#071A35] font-black">{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
