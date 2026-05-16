import React from 'react';
import './Topbar.css';
import logo from '../../assets/MUL-Logo.png';

const Topbar = ({ time, user, avatar, handleAvatarChange }) => {
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
            {avatar
              ? <img src={avatar} alt="Avatar" className="db-avatar-img" />
              : <span className="db-avatar-letter">{user?.name?.charAt(0)}</span>}
            <input type="file" accept="image/*" className="db-avatar-input" onChange={handleAvatarChange} />
            <span className="db-online-dot" />
          </label>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
