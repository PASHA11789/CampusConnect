import React, { useState, useEffect } from 'react';

const Topbar = ({ time, user, avatar, handleAvatarChange, isUploading }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state if a new avatar is uploaded or passed
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Helper to extract clean initials from the user's name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-[100] animate-slide-down max-md:px-4 max-md:py-3">
      <div className="flex items-center">

      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-extrabold text-[#0a2342]">{user?.name || 'Sagheer Ahmad'}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{user?.registration_no || '2022F-mulbscs-104'}</span>
          </div>
          <label className="relative w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0079c2] p-[2px] cursor-pointer shadow-[0_4px_10px_rgba(0,194,203,0.2)] transition-transform duration-200 hover:scale-105" title="Change avatar">
            {showFallback ? (
              <span className="w-full h-full rounded-full bg-[#0a2342] flex items-center justify-center text-base font-black text-[#00c2cb]">{getInitials(user?.name)}</span>
            ) : (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover block bg-white" 
                onError={() => setImageError(true)} 
              />
            )}
            {isUploading && (
              <div className="absolute inset-[2px] rounded-full bg-[#0a2342]/75 flex items-center justify-center text-[#00c2cb] backdrop-blur-[1.5px] z-5">
                <div className="w-4 h-4 border-[2.5px] border-[#00c2cb]/25 border-t-[#00c2cb] rounded-full animate-spin" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#34d399] rounded-full border-2 border-white" />
          </label>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

