import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MUL-Logo.png';

/* ─────────────────────────────────────────────
   Inline SVG icons (no external icon lib needed)
 ───────────────────────────────────────────── */
const IconForum = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
const IconSearch = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconClipboard = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
const IconVote = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
const IconMenu = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18M3 9h18M3 15h18M3 21h18" /></svg>;
const IconBell = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
const IconCheck = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconArrow = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconCalendar = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconPin = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconUsers = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
const IconStar = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IconZap = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconFacebook = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>;
const IconInstagram = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconTwitter = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>;
const IconLinkedin = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;

const FEATURES = [
  { icon: <IconForum />, title: 'Student Forums', desc: 'Discuss any questions and share knowledge with peers across departments.' },
  { icon: <IconSearch />, title: 'Lost & Found', desc: 'Quickly report or find lost belongings around campus with smart filters.' },
  { icon: <IconClipboard />, title: 'Petitions', desc: 'Voice your concerns. Launch and sign petitions that can drive real change.' },
  { icon: <IconVote />, title: 'Petitions Vote', desc: 'Voice your concerns, launch and sign petitions that can drive real change.' },
  { icon: <IconMenu />, title: 'Canteen Menu', desc: 'Browse today\'s canteen menu, check prices, and order from your campus shop.' },
  { icon: <IconBell />, title: 'Smart Notifications', desc: 'Get instantly notified on events, results, notices, and approvals.' },
];

const STATS = [
  { icon: <IconUsers />, value: '12K+', label: 'Active Students' },
  { icon: <IconForum />, value: '45K+', label: 'Forum Posts' },
  { icon: <IconStar />, value: '4.9', label: 'Average Rating' },
  { icon: <IconZap />, value: '99.9%', label: 'Uptime' },
];

const EVENTS = [
  { day: '20', month: 'MAY', title: 'Tech Talk Seminar', desc: 'An industry experts talk on the future of technology.', time: '10:00 AM', location: 'Main Auditorium' },
  { day: '25', month: 'MAY', title: 'Cultural Day', desc: 'A day of celebrations, performances and cultural showcases.', time: '02:00 PM', location: 'Sports Complex' },
  { day: '01', month: 'JUN', title: 'Sports Gala', desc: 'Inter department sports competition and fun activities.', time: '09:00 AM', location: 'University Ground' },
];

const FOOTER_LINKS = {
  'Quick Links': ['Home', 'About Us', 'Features', 'Contact'],
  'Resources': ['Help Center', 'Guidelines', 'Terms of Service', 'Privacy Policy'],
  'Support': ['FAQs', 'Report Issue', 'Feedback'],
};

/* ─── Scroll animation hook ─── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('!opacity-100', '!translate-y-0');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.cc-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Smooth Cursor Tracker ─── */
function CustomCursor() {
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let animationFrameId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const render = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseOver = (e) => {
      if (
        e.target.closest('a, button, .cc-feature-card, .cc-event-card') ||
        window.getComputedStyle(e.target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-3 h-3 -ml-[6px] -mt-[6px] bg-[#0079c2]' : 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-[#00c2cb]'}`} />
      <div ref={outlineRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-[60px] h-[60px] -ml-[30px] -mt-[30px] border-[#0079c2]/80 bg-[#0079c2]/10' : 'w-10 h-10 -ml-[20px] -mt-[20px] border-[#00c2cb]/50 bg-[#00c2cb]/5'}`} />
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem("token"));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useScrollReveal();

  return (
    <div className="font-sans text-[#1a2a4a] bg-white overflow-x-hidden cc-page-cursor-none cc-page">
      <CustomCursor />
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isScrolled ? 'bg-white/85 backdrop-blur-[24px] border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.08)]' : 'bg-transparent border-transparent'}`}>
        <div className="mx-auto px-4 pl-6 h-20 flex items-center gap-8 max-w-[1200px] w-full justify-between">
          <div className="flex flex-row items-center gap-3 no-underline cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-[24px] font-black bg-gradient-to-b from-[#00c2cb] to-[#0079c2] bg-clip-text text-transparent leading-none">X</div>
            <div className="flex flex-col items-start">
              <h1 className={`text-[16px] font-black leading-none tracking-tight transition-colors duration-400 ${isScrolled ? 'text-[#0a2342]' : 'text-white'}`}>CAMPUS<span className="text-[#00c2cb]">CONNECT</span></h1>
              <span className="text-[8px] font-bold tracking-[0.35em] text-[#00c2cb] mt-0.5 uppercase">UNIVERSITY PORTAL</span>
            </div>
          </div>

          <ul className={`list-none flex gap-1 ml-auto max-[768px]:fixed max-[768px]:top-0 max-[768px]:w-[80%] max-[768px]:h-screen max-[768px]:bg-white max-[768px]:flex-col max-[768px]:p-24 max-[768px]:px-10 max-[768px]:transition-all max-[768px]:duration-[400ms] max-[768px]:shadow-[-10px_0_40px_rgba(0,0,0,0.1)] ${menuOpen ? 'max-[768px]:right-0' : 'max-[768px]:-right-full'}`}>
            {['Home', 'About', 'Features', 'Contact'].map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`} className={`text-[15px] font-semibold no-underline py-2 px-5 rounded-[50px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] max-[768px]:text-[#0a2342] max-[768px]:text-[20px] max-[768px]:block max-[768px]:py-3 max-[768px]:px-0 max-[768px]:bg-transparent ${l === 'Home' ? (isScrolled ? 'text-[#0079c2] bg-[#0079c2]/8' : 'text-white bg-white/10') : (isScrolled ? 'text-slate-600 hover:text-[#0079c2] hover:bg-[#0079c2]/8' : 'text-slate-300 hover:text-white hover:bg-white/10')}`} onClick={() => setMenuOpen(false)}>{l}</a></li>
            ))}
          </ul>

          {isLoggedIn && (
            <button className="max-[768px]:hidden flex items-center gap-2 bg-[#0a2342] text-white border-none rounded-lg py-2.5 px-[18px] text-[14px] font-bold cursor-pointer transition-all duration-[250ms] hover:bg-[#0079c2] hover:-translate-y-[2px] whitespace-nowrap cc-page-cursor-none" onClick={() => navigate('/dashboard')}>
              <span className="text-[16px]">⊞</span> Dashboard
            </button>
          )}

          <button className="hidden max-[768px]:flex flex-col gap-1.5 bg-none border-none cursor-pointer p-1 ml-4 cc-page-cursor-none" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0a2342]' : 'bg-white'}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0a2342]' : 'bg-white'}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0a2342]' : 'bg-white'}`} />
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-[#0a2342] via-[#0d3060] to-[#0a2342] min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute rounded-full filter blur-[80px] opacity-20 w-[500px] h-[500px] bg-[#00c2cb] -top-[100px] -left-[100px] animate-float" />
          <div className="absolute rounded-full filter blur-[80px] opacity-20 w-[350px] h-[350px] bg-[#0079c2] bottom-[-80px] right-[10%] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute rounded-full filter blur-[80px] opacity-20 w-[250px] h-[250px] bg-[#00c2cb] top-[40%] right-[5%] animate-float" />
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto pt-[140px] px-6 pb-20 flex items-center gap-[60px] w-full max-[1024px]:flex-col max-[1024px]:text-center max-[1024px]:pt-[120px]">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#00c2cb]/15 border border-[#00c2cb]/30 text-[#00c2cb] py-2 px-4 rounded-full text-[13px] font-semibold mb-7">🎓 Welcome to the Future of Campus Life</div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-black text-white leading-[1.1] mb-5">
              All Your Campus,<br />
              <span className="text-[#00c2cb]">One Platform.</span>
            </h1>
            <p className="text-[17px] text-white/75 leading-[1.7] mb-9 max-w-[480px] max-[1024px]:mx-auto">
              Connect with peers, find lost items, sign petitions, order from the canteen — everything you need as a student, beautifully unified.
            </p>
            <div className="flex gap-4 flex-wrap max-[1024px]:justify-center">
              {isLoggedIn ? (
                <button className="inline-flex items-center gap-2.5 bg-[#0079c2] text-white border-none rounded-xl py-3.5 px-7 text-[15px] font-bold cursor-pointer transition-all duration-[250ms] shadow-[0_6px_24px_rgba(0,121,194,0.4)] hover:bg-[#005fa3] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,121,194,0.5)] cc-page-cursor-none" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <span><IconArrow /></span>
                </button>
              ) : (
                <button className="inline-flex items-center gap-2.5 bg-[#0079c2] text-white border-none rounded-xl py-3.5 px-7 text-[15px] font-bold cursor-pointer transition-all duration-[250ms] shadow-[0_6px_24px_rgba(0,121,194,0.4)] hover:bg-[#005fa3] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,121,194,0.5)] cc-page-cursor-none" onClick={() => navigate('/login')}>
                  Sign In to Portal <span><IconArrow /></span>
                </button>
              )}
              <button className="inline-flex items-center gap-2.5 bg-white/8 text-white border-[1.5px] border-white/25 rounded-xl py-3.5 px-7 text-[15px] font-bold cursor-pointer transition-all duration-[250ms] backdrop-blur-[4px] hover:bg-white/15 hover:-translate-y-[2px] cc-page-cursor-none" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Explore Features <span>✦</span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative max-w-[520px] w-full">
            <div className="bg-white/7 border border-white/12 rounded-[20px] overflow-hidden backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] animate-float">
              <div className="bg-white/8 py-3 px-4 flex items-center gap-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex gap-2.5 text-[11px] text-white/50 font-semibold flex-1">
                  <span className="text-[#00c2cb]">Lost &amp; Found</span>
                  <span>Petitions</span>
                  <span>Events</span>
                </div>
                <div className="text-[16px] text-white/70">🔔<sup className="bg-[#e53e3e] text-white text-[8px] rounded-full px-1 py-0.5">2</sup></div>
              </div>
              <div className="flex min-h-[200px]">
                <div className="py-3 px-2 flex flex-col gap-1.5 border-r border-white/8">
                  {['🏠', '💬', '🔍', '📋', '🍽️', '🔔'].map((ic, i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] cursor-pointer transition-all duration-200 text-white/50 ${i === 0 ? 'bg-[#00c2cb]/20 text-[#00c2cb]' : ''}`}>{ic}</div>
                  ))}
                </div>
                <div className="flex-1 py-3.5 px-4 text-left">
                  <div className="text-[10px] font-bold text-white/50 tracking-[0.08em] uppercase mb-2">Recent Activity</div>
                  {['📢 New petition posted', '🔍 Lost keys reported', '🍽️ Menu updated'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/75 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00c2cb] shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                  <div className="text-[10px] font-bold text-white/50 tracking-[0.08em] uppercase mb-2" style={{ marginTop: '12px' }}>Upcoming Events</div>
                  {['Tech Talk Seminar', 'Cultural Day', 'Sports Gala'].map((e, i) => (
                    <div key={i} className="bg-[#00c2cb]/15 border border-[#00c2cb]/25 text-[#00c2cb] text-[10px] font-semibold py-1 px-2.5 rounded-full inline-block mt-0.5 mr-1">{e}</div>
                  ))}
                </div>
              </div>
            </div>
            {/* floating badges */}
            <div className="absolute flex items-center gap-2 bg-white rounded-xl py-2.5 px-4 text-[12px] font-bold text-[#0a2342] shadow-[0_8px_32px_rgba(0,0,0,0.2)] bottom-[-20px] left-[-24px] animate-float">📬 <span className="text-[#0079c2]">12 New Messages</span></div>
            <div className="absolute flex items-center gap-2 bg-white rounded-xl py-2.5 px-4 text-[12px] font-bold text-[#0a2342] shadow-[0_8px_32px_rgba(0,0,0,0.2)] top-[-16px] right-[-20px] animate-[float_7s_ease-in-out_infinite_reverse]">🔔 <span className="text-[#0079c2]">Event Reminder</span></div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="bg-[#0a2342] border-b border-[#254e81]/75 flex justify-center flex-wrap py-[30px] px-6 m-0">
        {STATS.map((s, i) => (
          <div key={i} className="group/stat flex-1 min-w-[250px] flex flex-col items-center text-center gap-2 p-2.5 border-r border-white/5 transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 last:border-r-0 cc-reveal">
            <div className="w-[52px] h-[52px] bg-[#00c2cb]/15 rounded-full flex items-center justify-center shrink-0 text-[#0079c2] mb-1.5 transition-transform duration-400 group-hover/stat:scale-110 group-hover/stat:bg-[#00c2cb] group-hover/stat:text-white">{s.icon}</div>
            <div>
              <div className="text-[40px] font-black bg-gradient-to-br from-white to-[#cdecf0] bg-clip-text text-transparent leading-none tracking-tight">{s.value}</div>
              <div className="text-[13px] text-[#00c2cb] font-extrabold mt-0.5 uppercase tracking-[0.1em]">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="py-24 max-[768px]:py-15 bg-[#f8faff]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="inline-block text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4 text-[#0079c2] cc-reveal">FEATURES</div>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-black text-[#0a2342] mb-4 text-center cc-reveal">Everything you need, in one place</h2>
          <p className="text-[16px] text-slate-500 leading-[1.7] text-center max-w-[560px] mx-auto mb-14 cc-reveal">Powerful tools and features designed to make your campus life easier, smarter, and more connected.</p>
          <div className="grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
            {FEATURES.map((f, i) => (
              <div key={i} className="group/feature bg-white border border-[#e8edf5] rounded-[20px] p-8 pb-[30px] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer relative overflow-hidden hover:-translate-y-[10px] hover:border-[#00c2cb] hover:shadow-[0_20px_40px_rgba(0,194,203,0.1)] cc-page-cursor-none cc-reveal" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#0079c2]/4 to-transparent opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/feature:opacity-100 pointer-events-none" />
                <div className="w-14 h-14 bg-[#00c2cb]/10 rounded-2xl flex items-center justify-center text-[#00c2cb] mb-6 transition-all duration-300 group-hover/feature:scale-110 group-hover/feature:rotate-8 group-hover/feature:bg-[#00c2cb] group-hover/feature:text-white relative z-10">{f.icon}</div>
                <h3 className="text-[20px] font-extrabold text-[#0a2342] mb-3 relative z-10">{f.title}</h3>
                <p className="text-[15px] text-slate-500 leading-[1.6] relative z-10">{f.desc}</p>
                <div className="absolute bottom-8 right-7 w-6 text-[#00c2cb] opacity-0 -translate-x-[10px] transition-all duration-300 group-hover/feature:opacity-100 group-hover/feature:translate-x-0 z-10"><IconArrow /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BUILT FOR STUDENTS ══════════════ */}
      <section id="about" className="bg-[#0a2342] overflow-hidden py-24 max-[768px]:py-15">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-[80px] max-[1024px]:flex-col max-[1024px]:gap-[60px]">
          <div className="flex-[1.2] max-[1024px]:text-center cc-reveal">
            <div className="inline-block text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4 text-[#00c2cb] cc-reveal">BUILT FOR STUDENTS</div>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-black text-white mb-4 text-left max-[1024px]:text-center cc-reveal">A Smarter Way to<br />Experience Campus</h2>
            <p className="text-[16px] text-white/70 leading-[1.7] mb-8 text-left max-[1024px]:text-center cc-reveal">CampusConnect brings all essential student services together in one powerful platform. Stay informed, get involved, and make the most of your university life.</p>
            <ul className="list-none mt-8 flex flex-col gap-4">
              {['Easy to use and mobile friendly', 'Real-time updates and notifications', 'Trusted by thousands of students'].map((it, i) => (
                <li key={i} className="flex items-center gap-3 text-[16px] text-white/80 max-[1024px]:justify-center"><span className="w-6 h-6 bg-[#00c2cb] rounded-full flex items-center justify-center text-[#0a2342] text-[14px]"><IconCheck /></span>{it}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative min-h-[400px] w-full flex items-center justify-center cc-reveal">
            <div className="absolute w-[300px] h-[300px] bg-[#0079c2] rounded-full filter blur-[60px] opacity-20" />
            <div className="relative z-10 flex gap-4">
              {/* Stylised student group illustration placeholders */}
              <div className="w-[100px] h-[150px] bg-white/10 rounded-2xl relative border border-white/10 shadow-lg flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#00c2cb]/20 mb-2" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="w-[100px] h-[180px] bg-white/10 rounded-2xl relative border border-white/10 shadow-lg flex flex-col items-center justify-center -translate-y-4">
                <div className="w-10 h-10 rounded-full bg-[#00c2cb]/20 mb-2" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="w-[100px] h-[150px] bg-white/10 rounded-2xl relative border border-white/10 shadow-lg flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#00c2cb]/20 mb-2" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
            <div className="absolute bg-white py-3 px-5 rounded-xl font-bold text-[13px] text-[#0a2342] shadow-[0_10px_30px_rgba(0,0,0,0.2)] top-[10%] left-0 animate-float">✅ Connected</div>
            <div className="absolute bg-white py-3 px-5 rounded-xl font-bold text-[13px] text-[#0a2342] shadow-[0_10px_30px_rgba(0,0,0,0.2)] bottom-[15%] right-[-10%] animate-[float_6s_ease-in-out_infinite] [animation-delay:-2s]">🎓 Engaged</div>
            <div className="absolute bg-white py-3 px-5 rounded-xl font-bold text-[13px] text-[#0a2342] shadow-[0_10px_30px_rgba(0,0,0,0.2)] top-[40%] right-[10%] animate-[float_6s_ease-in-out_infinite] [animation-delay:-4s]">📊 Informed</div>
          </div>
        </div>
      </section>

      {/* ══════════════ EVENTS ══════════════ */}
      <section id="contact" className="py-24 max-[768px]:py-15">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="inline-block text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4 text-[#0079c2] cc-reveal">UPCOMING EVENTS</div>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-black text-[#0a2342] mb-4 text-center cc-reveal">Don't Miss What's Happening</h2>
          <p className="text-[16px] text-slate-500 leading-[1.7] text-center max-w-[560px] mx-auto mb-14 cc-reveal">Stay updated with the latest events and activities on campus.</p>
          <div className="grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
            {EVENTS.map((ev, i) => (
              <div key={i} className="group/event bg-white border border-slate-200 rounded-[20px] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-[#0079c2] cc-page-cursor-none cc-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="bg-[#0079c2] p-6 flex flex-col items-center justify-center text-white">
                  <span className="text-[32px] font-black leading-none">{ev.day}</span>
                  <span className="text-[14px] font-bold tracking-[0.15em] mt-1 uppercase">{ev.month}</span>
                </div>
                <div className="p-7 flex-1 flex flex-col text-left">
                  <h3 className="text-[19px] font-extrabold text-[#0a2342] mb-3">{ev.title}</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.6] mb-6 flex-1">{ev.desc}</p>
                  <div className="flex gap-4 border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400"><IconCalendar /> {ev.time}</span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400"><IconPin /> {ev.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="inline-flex items-center gap-2.5 bg-[#0079c2] text-white border-none rounded-xl py-3.5 px-7 text-[15px] font-bold cursor-pointer transition-all duration-[250ms] shadow-[0_6px_24px_rgba(0,121,194,0.4)] hover:bg-[#005fa3] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,121,194,0.5)] cc-page-cursor-none">View All Events <span><IconArrow /></span></button>
          </div>
        </div>
      </section>

      {/* ── UNIQUE CTA SECTION ── */}
      <section className="relative py-[120px] px-6 bg-[#060e1c] overflow-hidden flex justify-center items-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute rounded-full filter blur-[100px] opacity-40 w-[400px] h-[400px] bg-[#00c2cb] -top-[100px] -left-[100px] animate-[pulse-orb_10s_infinite_ease-in-out]" />
          <div className="absolute rounded-full filter blur-[100px] opacity-40 w-[300px] h-[300px] bg-[#0079c2] -bottom-[50px] -right-[50px] animate-[pulse-orb_10s_infinite_ease-in-out] [animation-delay:-3s]" />
          <div className="absolute rounded-full filter blur-[100px] opacity-40 w-[350px] h-[350px] bg-[#a78bfa] top-[40%] right-[20%] animate-[pulse-orb_10s_infinite_ease-in-out] [animation-delay:-6s]" />
        </div>
        <div className="relative z-10 w-full max-w-[1000px] bg-white/3 backdrop-blur-[20px] border border-white/10 rounded-[40px] p-20 px-10 flex justify-between items-center gap-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] max-[1024px]:flex-col max-[1024px]:text-center max-[1024px]:p-[60px] max-[1024px]:px-[30px] cc-reveal">
          <div className="flex-[1.5] text-left max-[1024px]:text-center">
            <div className="inline-block bg-[#00c2cb]/15 border border-[#00c2cb]/30 text-[#00c2cb] py-2 px-5 rounded-full text-[13px] font-bold tracking-[1px] uppercase mb-6">Join the Revolution</div>
            <h2 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] mb-6">Step into the <span className="bg-gradient-to-r from-[#00c2cb] to-[#a78bfa] bg-clip-text text-transparent">Future</span> of Campus Life</h2>
            <p className="text-[18px] text-white/70 leading-[1.7] mb-10 max-w-[500px] max-[1024px]:mx-auto">
              Stop juggling multiple apps. Bring your entire university experience into one beautiful, unified platform. Experience CampusConnect today.
            </p>
            <div className="flex">
              {isLoggedIn ? (
                <button className="group/glow relative inline-flex items-center gap-3 bg-gradient-to-br from-[#00c2cb] to-[#0079c2] text-white border-none rounded-2xl py-[18px] px-10 text-[16px] font-extrabold cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_10px_40px_rgba(0,194,203,0.4)] overflow-hidden hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,194,203,0.6)] cc-page-cursor-none" onClick={() => navigate('/dashboard')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-600 group-hover/glow:translate-x-full pointer-events-none" />
                  Go to Dashboard <span className="relative z-10"><IconArrow /></span>
                </button>
              ) : (
                <button className="group/glow relative inline-flex items-center gap-3 bg-gradient-to-br from-[#00c2cb] to-[#0079c2] text-white border-none rounded-2xl py-[18px] px-10 text-[16px] font-extrabold cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_10px_40px_rgba(0,194,203,0.4)] overflow-hidden hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,194,203,0.6)] cc-page-cursor-none" onClick={() => navigate('/login')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-600 group-hover/glow:translate-x-full pointer-events-none" />
                  Sign In to Portal <span className="relative z-10"><IconArrow /></span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center relative h-[300px] w-full">
            <div className="absolute text-[64px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-[float_6s_infinite_ease-in-out] top-0 left-[20%]">🚀</div>
            <div className="absolute text-[80px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-[float_6s_infinite_ease-in-out] [animation-delay:-2s] bottom-[10%] right-[10%]">💡</div>
            <div className="absolute text-[50px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-[float_6s_infinite_ease-in-out] [animation-delay:-4s] top-[40%] left-[40%]">🎓</div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-[#060e1c] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] gap-12 mb-[60px] max-[1024px]:grid-cols-2 max-[1024px]:gap-10">
          <div className="text-left">
            <div className="flex flex-row items-center gap-3 no-underline cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-[18px] font-black bg-gradient-to-b from-[#00c2cb] to-[#0079c2] bg-clip-text text-transparent leading-none">X</div>
              <div className="flex flex-col items-start">
                <h1 className="text-[14px] font-black leading-none tracking-tight text-white">CAMPUS<span className="text-[#00c2cb]">CONNECT</span></h1>
                <span className="text-[7px] font-bold tracking-[0.35em] text-[#00c2cb] mt-0.5 uppercase">UNIVERSITY PORTAL</span>
              </div>
            </div>
            <p className="text-[15px] text-slate-400 leading-[1.7] my-6 max-w-[280px]">Empowering students with connection, convenience, and smarter campus life.</p>
            <div className="flex gap-3">
              <a href="#!" aria-label="Facebook" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#00c2cb] hover:text-[#0a2342] hover:-translate-y-[2px] cc-page-cursor-none"><IconFacebook /></a>
              <a href="#!" aria-label="Instagram" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#00c2cb] hover:text-[#0a2342] hover:-translate-y-[2px] cc-page-cursor-none"><IconInstagram /></a>
              <a href="#!" aria-label="Twitter" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#00c2cb] hover:text-[#0a2342] hover:-translate-y-[2px] cc-page-cursor-none"><IconTwitter /></a>
              <a href="#!" aria-label="LinkedIn" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#00c2cb] hover:text-[#0a2342] hover:-translate-y-[2px] cc-page-cursor-none"><IconLinkedin /></a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="text-left">
              <h4 className="text-[16px] font-extrabold text-white mb-6">{group}</h4>
              <ul className="list-none m-0 p-0">{links.map(l => <li key={l} className="mb-3"><a href="#!" className="text-[14px] text-slate-400 no-underline transition-all duration-200 hover:text-[#00c2cb] hover:pl-1 cc-page-cursor-none">{l}</a></li>)}</ul>
            </div>
          ))}

          <div className="text-left">
            <h4 className="text-[16px] font-extrabold text-white mb-6">Contact Us</h4>
            <ul className="list-none m-0 p-0">
              <li className="mb-3 text-[14px] text-slate-400">✉ info@mul.edu.pk</li>
              <li className="mb-3 text-[14px] text-slate-400">📞 +92 42 35145621</li>
              <li className="mb-3 text-[14px] text-slate-400 leading-normal">📍 Minhaj University Lahore, <br/> Near Hamdard Chowk, <br/> Township, Lahore, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-8 px-6 border-t border-white/5 text-center text-[14px] text-slate-500">
          <span>© 2025 CampusConnect. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
