import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mulFullLogo from './assets/image.png';

// ─── Exact Sidebar Items Matching User Screenshot ──────────────────────────
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    active: true,
    icon: <i className="fa-solid fa-chart-line text-[#4d5ec1] text-xl" />,
  },
  {
    label: 'Lecture Schedule',
    active: false,
    icon: <i className="fa-solid fa-calendar-days text-[#e57373] text-xl" />,
  },
  {
    label: 'Fee Challans',
    active: false,
    icon: <i className="fa-solid fa-receipt text-[#ffc107] text-xl" />,
  },
  {
    label: 'Grade Book',
    active: false,
    icon: <i className="fa-solid fa-graduation-cap text-[#78909c] text-xl" />,
  },
  {
    label: 'Roll Number Slip',
    active: false,
    icon: <i className="fa-solid fa-id-card text-[#42a5f5] text-xl" />,
  },
  {
    label: 'Datesheet',
    active: false,
    icon: <i className="fa-solid fa-calendar-check text-[#ef5350] text-xl" />,
  },
  {
    label: 'Academic Calender',
    active: false,
    icon: <i className="fa-solid fa-book-bookmark text-[#81d4fa] text-xl" />,
  },
  {
    label: 'Student Services',
    active: false,
    icon: <i className="fa-solid fa-user-gear text-[#ab47bc] text-xl" />,
  },
  {
    label: 'Scheme of Study',
    active: false,
    icon: <i className="fa-solid fa-layer-group text-[#42a5f5] text-xl" />,
  },
];

// ─── Course Cards Data ────────────────────────────────────────────────────────
const COURSES = [
  {
    code: 'COMP416',
    name: 'Information Security',
    bg: '#5479be',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <i className="fa-solid fa-shield-halved text-5xl text-white/80" />
      </div>
    ),
    badges: [
      { count: 4, type: 'book', bgClass: 'bg-[#ffebee] text-[#f44336]' },
      { count: 3, type: 'bell', bgClass: 'bg-[#e0f7fa] text-[#00bcd4]' },
    ],
  },
  {
    code: 'COMP420',
    name: 'Data Science Technologies',
    bg: '#4b8e43',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <i className="fa-solid fa-database text-5xl text-white/80" />
      </div>
    ),
    badges: [
      { count: 4, type: 'book', bgClass: 'bg-[#ffebee] text-[#f44336]' },
      { count: 3, type: 'bell', bgClass: 'bg-[#e0f7fa] text-[#00bcd4]' },
    ],
  },
];

// ─── News Items Data ──────────────────────────────────────────────────────────
const NEWS = [
  {
    id: 1,
    title: 'Mehfil-e-Salaam in Honor of the Martyrs of Karbala – Minhaj University Lahore',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 2,
    title: 'Seekers Club, Minhaj University Lahore in collaboration with Al Shams Women Football Club organized a seminar titled “Women Empowerment through Sports”',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 3,
    title: 'School of Food Science and Technology, Minhaj University Lahore organized an interactive session on nutrition',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=300',
  },
];

const NOTICES = [
  { id: 1, title: 'Mid-Term Examination Schedule — Spring 2026', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=300' },
  { id: 2, title: 'Fee Submission Deadline: 15th August 2026.', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300' },
  { id: 3, title: 'Holiday Notice: Independence Day — 14th August 2026.', image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=300' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
const MULDashboard = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    if (!token || !userStr) {
      navigate('/mul-login');
      return;
    }
    try {
      const parsed = JSON.parse(userStr);
      if (parsed.role && !["student", "student_mod"].includes(parsed.role)) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/mul-login');
        return;
      }
      setCurrentUser(parsed);
    } catch {
      navigate('/mul-login');
    }
  }, [navigate]);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.mul-profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isProfileDropdownOpen]);

  const handleMULLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/mul-login');
  };

  return (
    <div className="flex h-screen w-full bg-[#f2f4f8] font-sans overflow-hidden relative">

      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ══════════════════ SIDEBAR (RESPONSIVE) ══════════════════ */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-60 min-w-[240px] bg-white border-r border-gray-200/80 flex flex-col overflow-y-auto scrollbar-none shadow-md lg:shadow-xs z-50 transition-transform duration-300 ease-in-out flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Top + Mobile Close Button */}
        <div className="flex items-center justify-between py-5 px-4 border-b border-gray-100 bg-white">
          <img
            src={mulFullLogo}
            alt="Minhaj University Lahore"
            className="w-full max-w-[170px] object-contain"
          />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <i className="fa-solid fa-xmark text-xl text-gray-500" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col py-3 px-2 gap-1">
          {NAV_ITEMS.map((item, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-left cursor-default transition-all duration-150
                ${item.active
                  ? 'bg-white text-gray-700 font-semibold'
                  : 'text-[#5f6368] hover:bg-gray-50'
                }`}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <span className="text-[13px] md:text-[14px] leading-tight font-medium text-[#555555]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ══════════════════ MAIN AREA ══════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* ── TOP HEADER (RESPONSIVE) ── */}
        <header className="h-16 bg-[#f2f4f8] flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 pt-2 border-b border-gray-200/50 lg:border-none">

          {/* Left: Mobile Hamburger Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-700 hover:text-gray-900 p-1.5 rounded-md bg-white border border-gray-200 shadow-xs"
            >
              <i className="fa-solid fa-bars text-xl text-gray-700" />
            </button>
            <span className="text-sm sm:text-[15px] font-medium text-[#5a6b82]">Dashboard</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">

            {/* Bell Icon with Red Badge (59) */}
            <div className="relative cursor-default flex items-center justify-center">
              <i className="fa-solid fa-bell text-xl text-[#2c3e50]" />
              <span className="absolute -top-1 -right-2 bg-[#ff5252] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] sm:min-w-[18px] px-1 flex items-center justify-center border border-white shadow-xs">
                59
              </span>
            </div>

            {/* Red Button: MUL Jobs Portal (Hidden text on very small mobile) */}
            <button className="flex items-center gap-1.5 sm:gap-2 bg-[#ff0000] hover:bg-[#e60000] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md shadow-xs tracking-wide transition-colors">
              <i className="fa-solid fa-briefcase text-sm text-white flex-shrink-0" />
              <span className="hidden sm:inline">MUL Jobs Employment Portal</span>
              <span className="sm:hidden">Jobs</span>
            </button>

            {/* CampusConnect Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md shadow-xs tracking-wide transition-all transform hover:scale-105"
            >
              <span className="text-[14px]">🎓</span>
              <span className="hidden sm:inline">CampusConnect</span>
              <span className="sm:hidden">CC</span>
            </button>

            {/* Icons Group & Profile Dropdown Container */}
            <div className="flex items-center gap-2 sm:gap-3 text-[#2c3e50] relative mul-profile-dropdown-container">
              <i className="fa-solid fa-comments text-lg hidden md:block cursor-default" />
              <i className="fa-solid fa-book-open text-lg hidden md:block cursor-default" />
              <i className="fa-solid fa-calendar-days text-lg hidden sm:block cursor-default" />

              {/* Avatar Trigger */}
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-sky-400 shadow-xs cursor-pointer flex-shrink-0 transition-transform active:scale-95 border-none p-0 bg-transparent"
                title={`${currentUser?.name || "Student"} (${currentUser?.registeration_number || ""})`}
              >
                <img
                  src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "Student")}&background=0ea5e9&color=fff`}
                  alt={currentUser?.name || "User Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>

              {/* Profile & Logout Dropdown Card matching exact screenshot */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-4 animate-fade-in text-left">
                  {/* Top Row: Avatar + Name + Subtitle */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#00A8E8] shrink-0 p-0.5 border border-sky-200">
                      <img
                        src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "Student")}&background=0ea5e9&color=fff`}
                        alt="Profile Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-extrabold text-[#222222] uppercase tracking-wide leading-tight truncate">
                        {currentUser?.name || "SAGHEER AHMAD"}
                      </span>
                      <span className="text-[12px] text-[#666666] font-medium mt-0.5">
                        Student
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="border-t border-gray-200 my-3"></div>

                  {/* Log Out Button */}
                  <button
                    onClick={handleMULLogout}
                    className="w-full flex items-center gap-3 text-[#444444] hover:text-red-600 text-xs font-semibold py-1 transition-colors cursor-pointer text-left group border-none bg-transparent"
                  >
                    <i className="fa-solid fa-right-from-bracket text-sm text-[#555555] group-hover:text-red-600 transition-colors flex items-center justify-center" />
                    <span className="text-[13px] font-medium text-[#444444] group-hover:text-red-600">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── CONTENT ROW (RESPONSIVE FLEX LAYOUT WITH SCROLL) ── */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <div className="flex flex-col xl:flex-row min-h-full">

            {/* ── MAIN CONTENT AREA ── */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">

            {/* Academic Session Input Box */}
            <div className="mb-6 max-w-full xl:max-w-3xl">
              <p className="text-[13px] text-[#4a5568] font-normal mb-2">Academic Session</p>
              <div className="relative w-full">
                <select
                  disabled
                  className="appearance-none bg-white border border-gray-200 text-[14px] text-[#555555] px-4 py-3 rounded-md w-full shadow-xs cursor-default"
                >
                  <option>Spring 2026</option>
                </select>
                <i className="fa-solid fa-chevron-down text-xs text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Large Heading */}
            <h1 className="text-lg sm:text-xl font-bold text-[#323d5d] mb-4 tracking-tight">
              Registered Courses (Spring 2026)
            </h1>

            {/* Course Cards Grid */}
            <div className="flex flex-col gap-4 max-w-full xl:max-w-2xl">
              {COURSES.map((course) => (
                <div
                  key={course.code}
                  className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden cursor-default transition-all"
                  style={{ minHeight: '105px' }}
                >
                  {/* Illustration Left/Top Panel */}
                  <div
                    className="w-full sm:w-48 min-w-full sm:min-w-[192px] h-24 sm:h-auto relative flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: course.bg }}
                  >
                    {/* Course Code Badge */}
                    <span className="absolute top-2 left-2 bg-white text-gray-700 text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-xs z-10">
                      {course.code}
                    </span>
                    <div className="w-full h-full p-1">
                      {course.illustration}
                    </div>
                  </div>

                  {/* Course Info & Pill Badges Right Side */}
                  <div className="flex flex-1 items-center justify-between p-3 sm:px-5 sm:py-3 bg-white gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-[#2c3e50]">{course.name}</h2>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {course.badges.map((badge, bi) => (
                        <div
                          key={bi}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${badge.bgClass} border border-current/20 shadow-xs`}
                        >
                          {badge.type === 'book' ? (
                            <i className="fa-solid fa-book text-xs" />
                          ) : (
                            <i className="fa-solid fa-bell text-xs" />
                          )}
                          <span>{badge.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* ── RIGHT PANEL (RESPONSIVE: STACKS ON BOTTOM ON TABLET/MOBILE) ── */}
          <aside className="w-full xl:w-[380px] xl:min-w-[380px] bg-white border-t xl:border-t-0 xl:border-l border-gray-200/80 flex flex-col flex-shrink-0 shadow-xs">

            {/* Right Panel Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
              <button
                onClick={() => setActiveTab('news')}
                className={`flex-1 py-3.5 sm:py-4 text-sm sm:text-[15px] font-semibold transition-all relative
                  ${activeTab === 'news'
                    ? 'text-[#2e3e67]'
                    : 'text-[#90a4ae] hover:text-gray-700'
                  }`}
              >
                News &amp; Events
                {activeTab === 'news' && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3a4768]"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('notice')}
                className={`flex-1 py-3.5 sm:py-4 text-sm sm:text-[15px] font-semibold transition-all relative
                  ${activeTab === 'notice'
                    ? 'text-[#2e3e67]'
                    : 'text-[#90a4ae] hover:text-gray-700'
                  }`}
              >
                Notice Board
                {activeTab === 'notice' && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3a4768]"></span>
                )}
              </button>
            </div>

            {/* List Items */}
            <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 overflow-y-auto scrollbar-none">
              {(activeTab === 'news' ? NEWS : NOTICES).map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 cursor-default group items-start">
                  {/* Event Thumbnail Photo */}
                  <div className="w-20 h-14 sm:w-24 sm:h-16 min-w-[80px] sm:min-w-[96px] rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-xs">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Event Title Text */}
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#78909c] group-hover:text-[#455a64] transition-colors font-normal">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          </div>
        </div>{/* end content row */}
      </div>{/* end main area */}
    </div>
  );
};

export default MULDashboard;
