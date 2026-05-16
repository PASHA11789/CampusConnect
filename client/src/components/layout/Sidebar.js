import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

import logo from '../../assets/MUL-Logo.png';

const IconForum      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconSearch     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconClipboard  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>;
const IconLogout     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IconMail       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconZap        = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-logo">
        <div className="db-sidebar-logo-img-wrapper">
          <img src={logo} alt="Minhaj Logo" className="db-sidebar-logo-img" />
        </div>
        <div className="db-sidebar-logo-x">X</div>
        <div className="db-sidebar-logo-text-col">
          <div className="db-sidebar-logo-text">CAMPUS<span>CONNECT</span></div>
          <div className="db-sidebar-logo-sub">UNIVERSITY PORTAL</div>
        </div>
      </div>

      <nav className="db-nav">
        <div className="db-nav-label">MAIN</div>
        <a href="/dashboard" className={`db-nav-item ${isActive('/dashboard') ? 'active' : ''}`}><IconZap/> Dashboard</a>
        <a href="/forum"     className={`db-nav-item ${isActive('/forum') ? 'active' : ''}`}><IconForum/> Forum</a>

        <div className="db-nav-label">CAMPUS</div>
        <a href="/canteen"    className={`db-nav-item ${isActive('/canteen') ? 'active' : ''}`}><span>🍽️</span> Canteen</a>
        <a href="/petitions"  className={`db-nav-item ${isActive('/petitions') ? 'active' : ''}`}><IconClipboard/> Petitions</a>
        <a href="/lost-found" className={`db-nav-item ${isActive('/lost-found') ? 'active' : ''}`}><IconSearch/> Lost &amp; Found</a>

        <div className="db-nav-label">PERSONAL</div>
        <a href="/profile"  className={`db-nav-item ${isActive('/profile') ? 'active' : ''}`}><span>👤</span> My Profile</a>
        <a href="/messages" className={`db-nav-item ${isActive('/messages') ? 'active' : ''}`}><IconMail/> Messages <span className="db-badge">3</span></a>
      </nav>

      <button className="db-logout-btn" onClick={handleLogout}>
        <IconLogout/> Sign Out
      </button>
    </aside>
  );
};

export default Sidebar;
