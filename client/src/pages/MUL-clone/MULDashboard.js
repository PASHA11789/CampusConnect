import React, { useState } from 'react';
import mulFullLogo from './assets/image.png';

// ─── Exact Sidebar Items Matching User Screenshot ──────────────────────────
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    active: true,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="6" width="26" height="18" rx="2" fill="#e8eaf6" stroke="#4d5ec1" strokeWidth="2" />
        <path d="M14 24v5M22 24v5M10 29h16" stroke="#4d5ec1" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="9" width="8" height="6" fill="#66bb6a" rx="1" />
        <circle cx="23" cy="12" r="3.5" fill="#ef5350" />
        <rect x="8" y="17" width="14" height="4" fill="#42a5f5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Lecture Schedule',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="8" width="26" height="22" rx="3" fill="#ffffff" stroke="#e57373" strokeWidth="2" />
        <path d="M5 8h26v6H5z" fill="#ff5252" />
        <rect x="9" y="5" width="3" height="5" rx="1" fill="#d32f2f" />
        <rect x="24" y="5" width="3" height="5" rx="1" fill="#d32f2f" />
        <circle cx="24" cy="24" r="6" fill="#29b6f6" />
        <path d="M24 21v3h2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Fee Challans',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6h20v24H8z" fill="#ffca28" />
        <path d="M8 6l3 2 3-2 3 2 3-2 3 2 3-2v24l-3-2-3 2-3-2-3 2-3-2-3 2V6z" fill="#ffc107" />
        <text x="10" y="21" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">FEE</text>
      </svg>
    ),
  },
  {
    label: 'Grade Book',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="20" height="24" rx="2" fill="#ffffff" stroke="#90a4ae" strokeWidth="2" />
        <path d="M10 11h7M10 15h12M10 19h12M10 23h8" stroke="#78909c" strokeWidth="2" strokeLinecap="round" />
        <text x="10" y="13" fill="#29b6f6" fontSize="7" fontWeight="bold">A+</text>
        <path d="M26 14l4 10-2 2-4-10z" fill="#29b6f6" />
      </svg>
    ),
  },
  {
    label: 'Roll Number Slip',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="6" width="22" height="24" rx="2" fill="#ffffff" stroke="#42a5f5" strokeWidth="2" />
        <path d="M7 26h22v4H7z" fill="#ffca28" />
        <path d="M11 11h14M11 15h14M11 19h10" stroke="#b0bec5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Datesheet',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="7" width="24" height="23" rx="3" fill="#e1f5fe" stroke="#29b6f6" strokeWidth="2" />
        <path d="M6 7h24v6H6z" fill="#ef5350" />
        <text x="11" y="24" fill="#37474f" fontSize="11" fontWeight="bold" fontFamily="sans-serif">31</text>
      </svg>
    ),
  },
  {
    label: 'Academic Calender',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="7" width="22" height="23" rx="3" fill="#81d4fa" />
        <circle cx="18" cy="17" r="5" fill="#e1f5fe" />
        <text x="10" y="11" fill="#ffffff" fontSize="4" fontWeight="bold">DIARY</text>
        <path d="M15 26l3 2 3-2v4h-6z" fill="#ffb74d" />
      </svg>
    ),
  },
  {
    label: 'Student Services',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="20" height="20" rx="4" fill="#ffffff" stroke="#ab47bc" strokeWidth="2" />
        <circle cx="16" cy="18" r="4" stroke="#ab47bc" strokeWidth="2" fill="none" />
        <path d="M22 20a6 6 0 00-6-6" stroke="#ab47bc" strokeWidth="2" />
        <circle cx="24" cy="12" r="4" fill="#42a5f5" />
      </svg>
    ),
  },
  {
    label: 'Scheme of Study',
    active: false,
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="24" height="6" rx="2" fill="#ef5350" transform="rotate(-10 5 10)" />
        <rect x="7" y="16" width="24" height="6" rx="2" fill="#66bb6a" transform="rotate(-3 7 16)" />
        <rect x="8" y="23" width="24" height="6" rx="2" fill="#42a5f5" />
      </svg>
    ),
  },
];

// ─── Course Cards Data ────────────────────────────────────────────────────────
const COURSES = [
  {
    code: 'COMP416',
    name: 'Information Security',
    bg: '#5479be',
    illustration: (
      <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <polygon points="60,35 75,25 75,100 60,110" fill="#d96c43" />
        <polygon points="75,25 90,32 90,107 75,100" fill="#ee8959" />
        <polygon points="60,35 75,25 90,32 75,42" fill="#f4a275" />
        <polygon points="85,20 105,8 105,95 85,107" fill="#2d4282" />
        <polygon points="105,8 125,18 125,105 105,95" fill="#3f59ab" />
        <polygon points="85,20 105,8 125,18 105,30" fill="#5876d6" />
        <polygon points="120,45 135,32 135,115 120,128" fill="#d69b36" />
        <polygon points="135,32 152,42 152,125 135,115" fill="#f5be56" />
        <polygon points="120,45 135,32 152,42 137,55" fill="#fcd17d" />
        <ellipse cx="106" cy="125" rx="65" ry="14" fill="#000000" opacity="0.12" />
      </svg>
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
      <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="140" rx="70" ry="8" fill="#000000" opacity="0.15" />
        <rect x="50" y="125" width="100" height="12" rx="3" fill="#fcd17d" />
        <rect x="58" y="113" width="84" height="12" rx="3" fill="#ffffff" />
        <rect x="55" y="101" width="90" height="12" rx="3" fill="#81c784" />
        <rect x="62" y="89" width="76" height="12" rx="3" fill="#e57373" />
        <circle cx="100" cy="45" r="7" fill="#ffe0b2" />
        <path d="M94 54 h12 v25 h-12 z" fill="#303f9f" />
        <line x1="96" y1="79" x2="94" y2="90" stroke="#1a237e" strokeWidth="4" />
        <line x1="104" y1="79" x2="106" y2="90" stroke="#1a237e" strokeWidth="4" />
        <line x1="94" y1="58" x2="88" y2="38" stroke="#ffe0b2" strokeWidth="3" />
        <line x1="106" y1="58" x2="112" y2="38" stroke="#ffe0b2" strokeWidth="3" />
        <polygon points="100,22 103,30 111,30 104,35 107,43 100,38 93,43 96,35 89,30 97,30" fill="#fbc02d" />
        <circle cx="65" cy="50" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="135" cy="40" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="145" cy="70" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="55" cy="80" r="2" fill="#ffffff" opacity="0.8" />
      </svg>
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
        className={`fixed lg:static top-0 left-0 h-full w-60 min-w-[240px] bg-white border-r border-gray-200/80 flex flex-col overflow-y-auto shadow-md lg:shadow-xs z-50 transition-transform duration-300 ease-in-out flex-shrink-0
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm sm:text-[15px] font-medium text-[#5a6b82]">Dashboard</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">

            {/* Bell Icon with Red Badge (59) */}
            <div className="relative cursor-default flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#2c3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-2 bg-[#ff5252] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] sm:min-w-[18px] px-1 flex items-center justify-center border border-white shadow-xs">
                59
              </span>
            </div>

            {/* Red Button: MUL Jobs Portal (Hidden text on very small mobile) */}
            <button className="flex items-center gap-1.5 sm:gap-2 bg-[#ff0000] hover:bg-[#e60000] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md cursor-default shadow-xs tracking-wide">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <span className="hidden sm:inline">MUL Jobs Employment Portal</span>
              <span className="sm:hidden">Jobs</span>
            </button>

            {/* Icons Group */}
            <div className="flex items-center gap-2 sm:gap-4 text-[#2c3e50]">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 hidden md:block cursor-default stroke-current" fill="none" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 hidden md:block cursor-default stroke-current" fill="none" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 hidden sm:block cursor-default stroke-current" fill="none" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 hidden sm:block cursor-default stroke-current" fill="none" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white shadow-xs cursor-default flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ROW (RESPONSIVE FLEX LAYOUT WITH SCROLL) ── */}
        <div className="flex-1 overflow-y-auto">
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
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
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
            <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
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
