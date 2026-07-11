import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import logo from "../../assets/MUL-Logo.png";


const MyProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [isNameHidden, setIsNameHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setIsNameHidden(user.isNameHidden || false);
      if (user.avatar) {
        setAvatar(user.avatar);
      } else {
        setAvatar(null);
      }
      setError(null);
      setSuccess(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

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
        if (onUpdateUser) {
          onUpdateUser({ ...user, avatar: data.avatar });
        }
      }
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      alert(err.response?.data?.message || "Failed to upload avatar. Please try again.");
      setAvatar(user?.avatar || null);
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
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.put("/api/users/profile", {
        name,
        isNameHidden,
      }, config);

      if (data.success) {
        setSuccess(true);
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
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


  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-modal-slide-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-[18px] font-black text-[#0a2342] tracking-tight">My Profile</h2>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Manage your personal information and privacy settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-[1fr_1.5fr] gap-6 max-[1100px]:grid-cols-1 items-start">
            {/* Left Column: Student Card and Avatar Info */}
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
                  {user?.role || "Student"}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
              </label>

              <h2 className="text-[20px] font-black text-[#0a2342] mt-2">{user?.name}</h2>
              <p className="text-[13px] text-slate-500 font-semibold mb-6">{user?.email || "CampusConnect Member"}</p>

              <div className="w-full grid grid-cols-2 gap-x-4 gap-y-5 pt-5 border-t border-slate-100 text-left">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Registration #</span>
                  <span className="text-[14px] font-bold text-[#0a2342]">{user?.registeration_number || user?.registration_no || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Department</span>
                  <span className="text-[14px] font-bold text-[#0a2342]">{user?.department || "Computer Science"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Class / Program</span>
                  <span className="text-[14px] font-bold text-[#0a2342]">{user?.class || user?.program || "BSCS"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Session</span>
                  <span className="text-[14px] font-bold text-[#0a2342]">{user?.session || "2024-28 Fall"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Settings Edit Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.02)] flex flex-col gap-5 text-left h-full justify-between">
              <div className="flex flex-col gap-5">
                <h2 className="text-[16px] font-black text-[#0a2342] mb-1">Profile Settings</h2>

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
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Full Name</label>
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
                      id="modalHideName"
                      checked={isNameHidden}
                      onChange={(e) => setIsNameHidden(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#00c2cb] focus:ring-[#00c2cb] border-slate-300 cursor-pointer"
                    />
                    <div className="flex flex-col gap-0.5">
                      <label htmlFor="modalHideName" className="text-[13px] font-bold text-[#0a2342] cursor-pointer leading-none">
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

              {/* Student Card Visual Rendering */}
              <div className="border-t border-slate-100 pt-4 flex flex-col items-center gap-3">
                <div className="w-full max-w-[320px] bg-gradient-to-br from-[#00838F] to-[#00acc1] rounded-2xl p-4 text-white shadow-md relative overflow-hidden text-left flex flex-col gap-2.5 font-sans">
                  {/* Card Header decoration */}
                  <div className="flex justify-between items-center pb-2 border-b border-white/20 shrink-0">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#E0F2F1]">STUDENT CARD</span>
                    <img src={logo} alt="MUL" className="w-6 h-6 object-contain filter brightness-100" />
                  </div>
                  {/* Card details */}
                  <div className="flex flex-col gap-1.5 text-[11px] leading-tight flex-1">
                    <div>
                      <span className="text-[#E0F2F1] font-semibold">Name:</span> <strong className="ml-1 text-white">{user?.name}</strong>
                    </div>
                    <div>
                      <span className="text-[#E0F2F1] font-semibold">Reg #:</span> <strong className="ml-1 text-white">{user?.registeration_number || user?.registration_no}</strong>
                    </div>
                    <div>
                      <span className="text-[#E0F2F1] font-semibold">Dept:</span> <strong className="ml-1 text-white">{user?.department || "Computer Science"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MyProfileModal;
