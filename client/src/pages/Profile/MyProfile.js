import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Form states
  const [name, setName] = useState('');
  const [isNameHidden, setIsNameHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
        if (parsedUser.avatar) setAvatar(parsedUser.avatar);
        setName(parsedUser.name || '');
        setIsNameHidden(parsedUser.isNameHidden || false);
      } catch (e) { }
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);

        setUser(data);
        if (data.avatar) setAvatar(data.avatar);
        setName(data.name || '');
        setIsNameHidden(data.isNameHidden || false);
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

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
          } catch (err) { }
        }
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.put('/api/users/profile', {
        name,
        isNameHidden
      }, config);

      if (data.success) {
        setSuccess(true);
        setUser(data.user);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
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
      <div className="flex items-center justify-center h-screen flex-col gap-3.5 bg-[#f0f4f8]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t('Loading your profile...')}</p>
      </div>
    );
  }

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

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">
          <div className="flex justify-between items-center mb-2 max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex flex-col">
              <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">{t("My Profile")}</h1>
              <p className="text-[12px] text-slate-500 mt-1 font-semibold">{t("Manage your personal information and privacy settings")}</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.5fr] gap-6 max-[1100px]:grid-cols-1 items-start">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.02)] flex flex-col items-center">
                <label className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0079c2] p-[4px] shadow-lg mb-4 cursor-pointer group block">
                  <img 
                    src={getPersonalizedAvatar(avatar)} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover bg-white border-[4px] border-white transition-all group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {isUploading ? (
                      <div className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full animate-spin shadow-md" />
                    ) : (
                      <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0a2342] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md border-2 border-white whitespace-nowrap z-20">
                    {user?.role || 'Student'}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                </label>

                <h2 className="text-[20px] font-black text-[#0a2342] mt-2">{user?.name}</h2>
                <p className="text-[13px] text-slate-500 font-semibold mb-6">{user?.email || 'CampusConnect Member'}</p>

                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-5 pt-5 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Registration #</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">{user?.registeration_number || user?.registration_no || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Department</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">{user?.department || 'Computer Science'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Class / Program</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">{user?.class || user?.program || 'BSCS'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Session</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">{user?.session || '2024-28 Fall'}</span>
                  </div>
                </div>
              </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.02)]">
              <h2 className="text-[16px] font-black text-[#0a2342] mb-5">Profile Settings</h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-xs font-bold border border-emerald-100">
                    Profile updated successfully!
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[13px] font-semibold rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 transition-all"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <input
                    type="checkbox"
                    id="hideName"
                    checked={isNameHidden}
                    onChange={(e) => setIsNameHidden(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#00c2cb] focus:ring-[#00c2cb] border-slate-300 cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <label htmlFor="hideName" className="text-[13px] font-bold text-[#0a2342] cursor-pointer leading-none">
                      Hide my real name
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      If enabled, your Registration Number ({user?.registeration_number || user?.registration_no}) will be displayed publicly across the platform instead of your real name.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl text-[13px] font-bold text-white bg-[#0a2342] hover:bg-[#00c2cb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <footer className="mt-auto py-3 border-t border-slate-200 text-center pt-8">
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
