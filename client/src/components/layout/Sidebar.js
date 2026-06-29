import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import logo from '../../assets/MUL-Logo.png';

const IconForum      = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconSearch     = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconClipboard  = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>;
const IconLogout     = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IconMail       = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconZap        = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const userStr = sessionStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user session in Sidebar", e);
  }
  const isMod = user?.role === 'admin' || user?.role === 'student_mod' || user?.role === 'campus_admin';
  const isCampusAdmin = user?.role === 'campus_admin';
  const isActive = (path) => location.pathname === path;

  const getNavItemClass = (path) => {
    const base = "flex items-center gap-[10px] px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white/50 no-underline transition-all duration-200 relative hover:bg-white/5 hover:text-white";
    const active = "bg-[#00c2cb]/12 text-[#00c2cb] before:content-[''] before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-[3px] before:bg-[#00c2cb] before:rounded-sm";
    return isActive(path) ? `${base} ${active}` : base;
  };

  return (
    <aside className="w-[240px] shrink-0 bg-[#001529] flex flex-col py-7 sticky top-0 h-screen overflow-y-auto scrollbar-none animate-slide-right max-md:hidden">
      <div className="flex items-center gap-3 px-4 pb-7 border-b border-white/10 mb-4">
        <div className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center p-1 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0">
          <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-[18px] font-black bg-gradient-to-b from-[#00c2cb] to-[#0079c2] bg-clip-text text-transparent leading-none">X</div>
        <div className="flex flex-col items-start">
          <div className="text-[13px] font-black text-white tracking-tight leading-none">CAMPUS<span className="text-[#00c2cb]">CONNECT</span></div>
          <div className="text-[7px] font-bold tracking-[0.25em] text-[#00c2cb] mt-[2px] uppercase">UNIVERSITY PORTAL</div>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-[2px]">
        <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/20 px-2 pt-[14px] pb-[6px]">MAIN</div>
        <a href="/dashboard" className={getNavItemClass('/dashboard')}><IconZap/> Dashboard</a>
        <a href="/forum"     className={getNavItemClass('/forum')}><IconForum/> Forum</a>

        <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/20 px-2 pt-[14px] pb-[6px]">CAMPUS</div>
        <a href="/canteen"    className={getNavItemClass('/canteen')}><span className="text-[15px]">🍽️</span> Canteen</a>
        <a href="/petitions"  className={getNavItemClass('/petitions')}><IconClipboard/> Petitions</a>
        <a href="/lost-found" className={getNavItemClass('/lost-found')}><IconSearch/> Lost &amp; Found</a>



        {isMod && (
          <>
            <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/20 px-2 pt-[14px] pb-[6px]">MODERATION</div>
            <a href="/moderation" className={getNavItemClass('/moderation')}><span className="text-[15px]">🛡️</span> Moderator Room</a>
          </>
        )}

        {isCampusAdmin && (
          <>
            <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/20 px-2 pt-[14px] pb-[6px]">ADMINISTRATION</div>
            <a href="/admin/users" className={getNavItemClass('/admin/users')}><span className="text-[15px]">👥</span> Manage Users</a>
            <a href="/admin/restaurants" className={getNavItemClass('/admin/restaurants')}><span className="text-[15px]">🏬</span> Manage Restaurants</a>
          </>
        )}

        <div className="text-[9px] font-extrabold tracking-[0.15em] text-white/20 px-2 pt-[14px] pb-[6px]">PERSONAL</div>
        <a href="/profile" className={getNavItemClass('/profile')}><span className="text-[15px]">👤</span> My Profile</a>
        {!isCampusAdmin && (
          <a href="/messages" className={getNavItemClass('/messages')}><IconMail/> Messages <span className="ml-auto bg-[#00c2cb] text-[#060e1c] text-[9px] font-extrabold px-1.5 py-[2px] rounded-full">3</span></a>
        )}
      </nav>

      <button className="flex items-center gap-[10px] mx-3 px-3.5 py-2.5 rounded-xl border-none bg-red-400/8 text-red-400/70 text-[13.5px] font-semibold cursor-pointer transition-all duration-200 hover:bg-red-400/15 hover:text-red-400" onClick={handleLogout}>
        <IconLogout/> Sign Out
      </button>
    </aside>
  );
};

export default Sidebar;

