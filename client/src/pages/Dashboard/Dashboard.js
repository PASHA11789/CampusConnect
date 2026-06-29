import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
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
  const [dashboardData, setDashboardData] = useState({
    notifications: { forums: 0, petitions: 0, updates: 0 },
    forums: [],
    petitions: [],
    lostAndFound: [],
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

            // Prepend new petition and limit to 3 active petitions maximum
            return {
              ...prevData,
              petitions: [newPetition, ...prevData.petitions].slice(0, 3)
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

      socket.on("petition_signed", (data) => {
        console.log("⚡ Petition signed received via socket on dashboard:", data);
        if (data && data.petitionId) {
          setDashboardData((prevData) => ({
            ...prevData,
            petitions: prevData.petitions.map((p) =>
              p._id === data.petitionId
                ? {
                  ...p,
                  signatures: new Array(data.currentSignatures).fill(null),
                  status: data.status,
                }
                : p
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
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4 [&>*]:animate-fade-in">
          {/* Render separated StudentCard and CareerPath widgets */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-6 max-[1100px]:grid-cols-1 items-start">
            <StudentCard user={user} avatar={getPersonalizedAvatar(avatar)} />
            <CareerPathExplorer user={user} />
          </div>
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
