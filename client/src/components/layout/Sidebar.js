import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from '../../assets/MUL-Logo.png';

const IconForum = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
const IconSearch = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconClipboard = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
const IconLogout = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const IconZap = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Check role before removing session data
    const isStudent = user?.role === 'student';
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Route to appropriate login page based on role
    if (isStudent) {
      navigate('/mul-login');
    } else {
      navigate('/login');
    }
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
    const isCurrent = isActive(path);
    if (isCurrent) {
      return "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[14px] font-black text-white no-underline transition-colors duration-150 bg-[#0097c2]";
    }
    return "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-semibold text-slate-300 no-underline transition-colors duration-150 hover:bg-white/10 hover:text-white";
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#071A35]/80 z-[150] md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`w-[250px] shrink-0 bg-[#071A35] flex flex-col py-6 px-3 h-full overflow-y-auto scrollbar-none border-r border-slate-800 transition-all duration-300 ${isOpen
        ? 'fixed inset-y-0 left-0 flex z-[160]'
        : 'hidden md:flex relative z-[90]'
        }`}>
        {/* Brand Header with Solid Cyan Branding */}
        <div className="flex items-center gap-3 px-2 pb-5 border-b border-slate-800 mb-3">
          <div className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center p-1 border border-slate-700 shrink-0">
            <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-[18px] font-black text-[#00c2cb] leading-none shrink-0">X</div>
          <div className="flex flex-col items-start">
            <div className="text-[13px] font-black text-white tracking-tight leading-none">
              CAMPUS<span className="text-[#00c2cb]">CONNECT</span>
            </div>
            <div className="text-[7px] font-bold tracking-[0.25em] text-[#00c2cb] mt-[2px] uppercase">
              UNIVERSITY PORTAL
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {user?.role === 'alumni' ? (
            <div className="bg-[#0B1F3D] rounded-2xl p-2 flex flex-col gap-1 border border-slate-800">
              <div className="text-[9px] font-black tracking-wider text-slate-400 px-3 pt-1 pb-1.5 uppercase">ALUMNI NAVIGATION</div>
              <Link to="/career" className={getNavItemClass('/career')}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px]">💼</span>
                  <span>Career Paths</span>
                </div>
              </Link>
              <Link to="/forum" className={getNavItemClass('/forum')}>
                <div className="flex items-center gap-2.5">
                  <IconForum />
                  <span>Forum</span>
                </div>
              </Link>
            </div>
          ) : (
            <>
              {/* Main Menu Panel */}
              <div className="bg-[#0B1F3D] rounded-2xl p-2 flex flex-col gap-1 border border-slate-800">
                <div className="text-[9px] font-black tracking-wider text-slate-400 px-3 pt-1 pb-1.5 uppercase">MAIN MENU</div>
                <Link to="/dashboard" className={getNavItemClass('/dashboard')}>
                  <div className="flex items-center gap-2.5">
                    <IconZap />
                    <span>Dashboard</span>
                  </div>
                </Link>
                <Link to="/forum" className={getNavItemClass('/forum')}>
                  <div className="flex items-center gap-2.5">
                    <IconForum />
                    <span>Forum</span>
                  </div>
                </Link>
                <Link to="/career" className={getNavItemClass('/career')}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">💼</span>
                    <span>Career Paths</span>
                  </div>
                </Link>
              </div>

              {/* Campus Services Panel */}
              <div className="bg-[#0B1F3D] rounded-2xl p-2 flex flex-col gap-1 border border-slate-800">
                <div className="text-[9px] font-black tracking-wider text-slate-400 px-3 pt-1 pb-1.5 uppercase">CAMPUS SERVICES</div>
                <Link to="/canteen" className={getNavItemClass('/canteen')}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">☕</span>
                    <span>Canteen</span>
                  </div>
                </Link>
                <Link to="/petitions" className={getNavItemClass('/petitions')}>
                  <div className="flex items-center gap-2.5">
                    <IconClipboard />
                    <span>Petitions</span>
                  </div>
                </Link>
                <Link to="/lost-found" className={getNavItemClass('/lost-found')}>
                  <div className="flex items-center gap-2.5">
                    <IconSearch />
                    <span>Lost &amp; Found</span>
                  </div>
                </Link>
                <Link to="/bus-routes" className={getNavItemClass('/bus-routes')}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">🚌</span>
                    <span>Bus Routes</span>
                  </div>
                </Link>
              </div>
            </>
          )}

          {isMod && (
            <div className="bg-[#0B1F3D] rounded-2xl p-2 flex flex-col gap-1 border border-slate-800">
              <div className="text-[9px] font-black tracking-wider text-slate-400 px-3 pt-1 pb-1.5 uppercase">MODERATION</div>
              <Link to="/moderation" className={getNavItemClass('/moderation')}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px]">🛡️</span>
                  <span>Moderator Room</span>
                </div>
              </Link>
            </div>
          )}

          {isCampusAdmin && (
            <div className="bg-[#0B1F3D] rounded-2xl p-2 flex flex-col gap-1 border border-slate-800">
              <div className="text-[9px] font-black tracking-wider text-slate-400 px-3 pt-1 pb-1.5 uppercase">ADMINISTRATION</div>
              <Link to="/admin/users" className={getNavItemClass('/admin/users')}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px]">👥</span>
                  <span>Manage Users</span>
                </div>
              </Link>
              <Link to="/admin/restaurants" className={getNavItemClass('/admin/restaurants')}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px]">🏬</span>
                  <span>Manage Restaurants</span>
                </div>
              </Link>
            </div>
          )}
        </nav>

        <div className="mt-6 pt-4 border-t border-slate-800 shrink-0">
          <button
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-600/20 text-red-300 text-[13px] font-extrabold cursor-pointer transition-colors duration-150 hover:bg-red-600 hover:text-white"
            onClick={handleLogout}
          >
            <IconLogout /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
