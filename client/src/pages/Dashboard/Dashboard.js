import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Dashboard Widgets
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import CanteenWidget from "../../components/dashboard/CanteenWidget";
import {
  ForumsWidget,
  PetitionsWidget,
  LostFoundWidget,
  BusRoutesWidget,
} from "../../components/dashboard/DashboardWidgets";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [greeting, setGreeting] = useState("");
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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (e) {}
    }
    // Remove legacy global avatar cache to avoid leaking profile pictures between different users
    localStorage.removeItem("userAvatar");

    // Greeting
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening",
    );

    // Clock
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
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
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Premium micro-animation / optimistic update: preview image immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploading(true);

    const token = localStorage.getItem("token");
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
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            const updatedUser = { ...parsedUser, avatar: data.avatar };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            console.error("Failed to update user object in local storage:", err);
          }
        }
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");
      
      // Revert to original database-saved avatar on error
      const userStr = localStorage.getItem("user");
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

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  if (!user) return null;

  return (
    <div className="db-root">
      <Sidebar />

      <main className="db-main">
        <Topbar
          time={time}
          user={user}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="db-content">
          <WelcomeBanner user={user} avatar={getPersonalizedAvatar(avatar)} />
          <CanteenWidget />

          <div className="db-main-grid">
            <div className="db-left-col">
              <ForumsWidget forums={dashboardData.forums} />
            </div>

            <div className="db-right-col">
              <PetitionsWidget petitions={dashboardData.petitions} />
              <div className="utility-container">
                <LostFoundWidget items={dashboardData.lostAndFound} />
                <BusRoutesWidget busRoutes={dashboardData.busRoutes} />
              </div>
            </div>
          </div>

          <footer className="db-footer">
            <p>
              © 2026 CampusConnect. An idea by <span>Mr. Sagheer Ahmad</span> &{" "}
              <span>Mr. Shujaat Ali Hashim</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
