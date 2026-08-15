import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { validateImageFileSize } from "../../utils/fileValidation";

const MyProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [isNameHidden, setIsNameHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setIsNameHidden(user.isNameHidden || false);
      setAvatar(user.avatar || null);
      setError(null);
      setSuccess(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const val = validateImageFileSize(file);
    if (!val.valid) {
      return;
    }

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
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=071A35&color=00c2cb&bold=true`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=071A35&color=00c2cb&bold=true`;
    }
    return url;
  };

  const regNo = user?.registeration_number || user?.registration_no || "N/A";

  const handleCopyReg = () => {
    if (regNo && regNo !== "N/A") {
      navigator.clipboard.writeText(regNo);
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Main Modal Dialog */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(7,26,53,0.25)] w-full max-w-4xl overflow-hidden animate-modal-slide-in flex flex-col max-h-[94vh] sm:max-h-[90vh] border border-[#E8E1D5] z-10">

        {/* Forum/Petition Style Header Banner */}
        <div className="relative bg-[#071A35] px-4 sm:px-6 py-3.5 sm:py-5 flex justify-between items-center text-white overflow-hidden shrink-0 border-b border-[#071A35]">
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 right-16 w-36 h-36 bg-[#00c2cb]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Content */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sm sm:text-base shadow-inner text-[#00c2cb] shrink-0">
              <i className="fa-solid fa-user" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg md:text-[20px] font-black tracking-tight text-white leading-tight">
                  My Profile
                </h2>
                <span className="bg-white/10 text-[#00c2cb] text-[8.5px] sm:text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/10 shadow-sm shrink-0">
                  Official Member
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11.5px] text-white/70 font-semibold mt-0.5 truncate">
                Manage your personal details, display settings, and privacy options
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-none shrink-0 ml-2"
            title="Close"
          >
            <i className="fa-solid fa-xmark text-sm flex items-center justify-center" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 md:p-7 overflow-y-auto custom-scrollbar flex-1 bg-[#FAF7F0]/60 touch-pan-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">

            {/* Left Column: Avatar Profile & Academic Information (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">

              {/* Profile Overview Card */}
              <div className="bg-white border border-[#E8E1D5] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00c2cb] to-[#071A35]" />

                {/* Avatar with Ring & Upload Overlay */}
                <label className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#00c2cb] to-[#071A35] p-[3.5px] shadow-md mb-3 sm:mb-3.5 cursor-pointer group block transition-transform duration-300 hover:scale-105">
                  <img
                    src={getPersonalizedAvatar(avatar)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover bg-white border-[3px] border-white transition-all duration-200 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px] z-10 text-white">
                    {isUploading ? (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 border-[3px] border-white/30 border-t-white rounded-full animate-spin shadow-md" />
                    ) : (
                      <>
                        <i className="fa-solid fa-camera text-lg text-white drop-shadow-md flex items-center justify-center" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold mt-1 tracking-wider uppercase">Change</span>
                      </>
                    )}
                  </div>

                  {/* Active Status Indicator */}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full z-20 shadow-sm" title="Online & Active" />

                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                </label>

                {/* User Name & Email */}
                <h2 className="text-base sm:text-lg font-black text-[#0a2342] leading-snug line-clamp-1">
                  {name || user?.name || "Student Name"}
                </h2>
                <span className="text-[11px] sm:text-[11.5px] font-bold text-[#00c2cb] bg-[#00c2cb]/10 border border-[#00c2cb]/20 px-3 py-0.5 rounded-full mt-1">
                  {user?.role ? user.role.toUpperCase() : "STUDENT"}
                </span>
                <p className="text-[11.5px] sm:text-[12px] text-slate-500 font-semibold mt-2 break-all max-w-full">
                  {user?.email || "CampusConnect Member"}
                </p>
              </div>

              {/* Academic Metadata Grid Card (Responsive tiles) */}
              <div className="bg-white border border-[#E8E1D5] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-2.5 border-b border-slate-100">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-xs font-black shrink-0">
                    <i className="fa-solid fa-graduation-cap" />
                  </div>
                  <h4 className="text-[13px] sm:text-[14px] font-black text-[#0a2342]">Academic Information</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="bg-[#FAF7F0]/80 p-2.5 sm:p-3 rounded-xl border border-[#E8E1D5] flex flex-col min-w-0">
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Registration #</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11.5px] sm:text-[12px] font-bold text-[#0a2342] font-mono truncate">{regNo}</span>
                      {regNo !== "N/A" && (
                        <button
                          type="button"
                          onClick={handleCopyReg}
                          className="text-slate-400 hover:text-[#00c2cb] transition-colors border-none bg-transparent cursor-pointer p-0.5 shrink-0"
                          title="Copy Registration Number"
                        >
                          <i className="fa-solid fa-copy text-xs flex items-center justify-center" />
                        </button>
                      )}
                      {copiedReg && (
                        <span className="text-[7.5px] font-extrabold bg-[#00c2cb] text-[#071A35] px-1 py-0.2 rounded animate-fade-in shrink-0">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FAF7F0]/80 p-2.5 sm:p-3 rounded-xl border border-[#E8E1D5] flex flex-col min-w-0">
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Department</span>
                    <span className="text-[11.5px] sm:text-[12px] font-bold text-[#0a2342] truncate">{user?.department || "Computer Science"}</span>
                  </div>

                  <div className="bg-[#FAF7F0]/80 p-2.5 sm:p-3 rounded-xl border border-[#E8E1D5] flex flex-col min-w-0">
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Program / Class</span>
                    <span className="text-[11.5px] sm:text-[12px] font-bold text-[#0a2342] truncate">{user?.class || user?.program || "BSCS"}</span>
                  </div>

                  <div className="bg-[#FAF7F0]/80 p-2.5 sm:p-3 rounded-xl border border-[#E8E1D5] flex flex-col min-w-0">
                    <span className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Session</span>
                    <span className="text-[11.5px] sm:text-[12px] font-bold text-[#0a2342] truncate">{user?.session || "2024-28 Fall"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Profile Settings Form (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">

              {/* Profile Edit Form Card */}
              <div className="bg-white border border-[#E8E1D5] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col text-left h-full">
                <div className="flex items-center gap-2.5 mb-4 sm:mb-5 pb-2.5 sm:pb-3 border-b border-slate-100">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#071A35]/5 text-[#071A35] flex items-center justify-center text-xs sm:text-sm font-black border border-[#071A35]/10 shrink-0">
                    <i className="fa-solid fa-gear" />
                  </div>
                  <div>
                    <h3 className="text-[15px] sm:text-[16px] font-black text-[#0a2342]">Profile Settings</h3>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-semibold">Update your public display information</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 flex-1 justify-between">
                  <div className="flex flex-col gap-4 sm:gap-5">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 sm:p-3.5 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-fade-in">
                        <i className="fa-solid fa-triangle-exclamation text-sm text-red-500 shrink-0 flex items-center justify-center" />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="bg-emerald-50 text-emerald-700 p-3 sm:p-3.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fade-in">
                        <i className="fa-solid fa-circle-check text-sm text-emerald-600 shrink-0 flex items-center justify-center" />
                        <span>Profile settings updated successfully!</span>
                      </div>
                    )}

                    {/* Full Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] sm:text-[11px] font-black text-slate-600 uppercase tracking-wide flex items-center justify-between">
                        <span>Full Name</span>
                        <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-normal">Displayed on profile & activities</span>
                      </label>
                      <div className="relative flex items-center">
                        <i className="fa-solid fa-user absolute left-3.5 text-slate-400 text-xs" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-[#FAF7F0]/80 border border-[#E8E1D5] text-[#0a2342] text-[12.5px] sm:text-[13px] font-semibold rounded-xl pl-10 pr-4 py-2.5 sm:py-3 focus:bg-white focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Hide Real Name Custom Toggle Block */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F0]/80 border border-[#E8E1D5] hover:border-slate-300 transition-colors flex items-start gap-3 sm:gap-3.5">
                      <div className="relative flex items-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          id="modalHideName"
                          checked={isNameHidden}
                          onChange={(e) => setIsNameHidden(e.target.checked)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="modalHideName"
                          className="w-9 sm:w-10 h-5 sm:h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#071A35] cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <label htmlFor="modalHideName" className="text-[12.5px] sm:text-[13px] font-extrabold text-[#0a2342] cursor-pointer leading-tight">
                          Privacy Mode (Hide Real Name)
                        </label>
                        <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 font-medium leading-relaxed">
                          When enabled, your Registration Number (<span className="font-bold text-[#0a2342]">{regNo}</span>) will be displayed publicly across forums and petitions instead of your real name.
                        </p>
                        {isNameHidden && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-[10.5px] font-bold">
                            <i className="fa-solid fa-lock text-xs text-amber-700" />
                            <span>Public Identity set to Registration Number</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-2.5 sm:py-3 rounded-xl text-[12.5px] sm:text-[13px] font-extrabold text-white bg-[#071A35] hover:bg-[#00c2cb] hover:text-[#071A35] shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Changes</span>
                          <i className="fa-solid fa-check text-xs flex items-center justify-center" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
