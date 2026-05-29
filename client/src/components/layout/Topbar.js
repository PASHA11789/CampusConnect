import React, { useState, useEffect } from 'react';
import './Topbar.css';

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
    <header className="db-topbar">
      <div className="db-topbar-left">

      </div>

      <div className="db-topbar-right">
        <div className="db-user-details">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Sagheer Ahmad'}</span>
            <span className="user-reg">{user?.registration_no || '2022F-mulbscs-104'}</span>
          </div>
          <label className="db-avatar-wrap" title="Change avatar">
            {showFallback ? (
              <span className="db-avatar-letter">{getInitials(user?.name)}</span>
            ) : (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="db-avatar-img" 
                onError={() => setImageError(true)} 
              />
            )}
            {isUploading && (
              <div className="db-avatar-loading-overlay">
                <div className="db-avatar-spinner" />
              </div>
            )}
            <input type="file" accept="image/*" className="db-avatar-input" onChange={handleAvatarChange} disabled={isUploading} />
            <span className="db-online-dot" />
          </label>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
