import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MUL-Logo.png';

/* ─────────────────────────────────────────────
   Inline SVG icons (no external icon lib needed)
 ───────────────────────────────────────────── */
const IconForum = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
const IconClipboard = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
const IconMenu = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18M3 9h18M3 15h18M3 21h18" /></svg>;
const IconArrow = ({ className = "w-4 h-4" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconUsers = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
const IconFacebook = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>;
const IconInstagram = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconTwitter = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>;
const IconLinkedin = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const IconSparkles = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" /></svg>;
const IconShieldCheck = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>;
const IconZap = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconRocket = ({ className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-3.05 10a22.35 22.35 0 01-3.95 2z" /><path d="M9 18l-4.5 4.5" /><path d="M14.5 9.5L18 6" /></svg>;

const STATS = [
  { value: '5,000+', label: 'Active Campus Students' },
  { value: '50+', label: 'Study Forums & Groups' },
  { value: '98%', label: 'Petitions Addressed' },
  { value: '10k+', label: 'Canteen Orders Served' },
];

const FEATURES = [
  {
    icon: <IconZap className="w-7 h-7 text-[#06B6D4]" />,
    title: 'Real-Time Peer Discussions',
    desc: 'Collaborate with classmates, share subject notes, and ask questions in instant study channels.'
  },
  {
    icon: <IconShieldCheck className="w-7 h-7 text-[#4F46E5]" />,
    title: 'Official Student Petitions',
    desc: 'Raise genuine student concerns directly to university management with full transparency.'
  },
  {
    icon: <IconSparkles className="w-7 h-7 text-[#06B6D4]" />,
    title: 'Smart Canteen Pre-Ordering',
    desc: 'View live canteen menus, place orders online, and skip long queue lines during break hours.'
  },
  {
    icon: <IconRocket className="w-7 h-7 text-[#4F46E5]" />,
    title: 'Alumni Network & Career Paths',
    desc: 'Get mentored by university alumni, discover job postings, and accelerate your career path.'
  }
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register Account', desc: 'Sign up using your university credentials to verify your identity.' },
  { step: '02', title: 'Explore Modules', desc: 'Navigate through Study Forums, Petitions, Canteen, or Alumni networks.' },
  { step: '03', title: 'Engage & Order', desc: 'Participate in discussions, submit petitions, or pre-order your lunch.' },
  { step: '04', title: 'Succeed Together', desc: 'Stay updated, save time, and enjoy a seamless modern university life.' }
];

const MODULES = [
  { icon: <IconForum />, title: 'Study Discussions', desc: 'Connect through study discussions and share knowledge with your peers.' },
  { icon: <IconClipboard />, title: 'Petitions', desc: 'Resolve your problems and voice your concerns through our petitions module.' },
  { icon: <IconMenu />, title: 'Canteen', desc: 'Hungry? Grab a bite with our canteen module. Browse the menu and order instantly.' },
  { icon: <IconUsers />, title: 'Career Paths', desc: 'Worried about your career? Hop on to career paths to get advice from your peers and alumni.' },
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
      <div ref={dotRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-3 h-3 -ml-[6px] -mt-[6px] bg-[#4F46E5]' : 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-[#06B6D4]'}`} />
      <div ref={outlineRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-[60px] h-[60px] -ml-[30px] -mt-[30px] border-[#4F46E5]/80 bg-[#4F46E5]/10' : 'w-10 h-10 -ml-[20px] -mt-[20px] border-[#06B6D4]/50 bg-[#06B6D4]/5'}`} />
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
    <div className="font-sans text-[#0F172A] bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto overflow-x-hidden cc-page-cursor-none cc-page">
      <CustomCursor />
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isScrolled ? 'bg-white/85 backdrop-blur-[24px] border-slate-200/50 shadow-[0_10px_40px_rgba(0,0,0,0.04)]' : 'bg-transparent border-transparent'}`}>
        <div className="mx-auto px-4 pl-6 h-20 flex items-center gap-8 max-w-[1200px] w-full justify-between">
          <div className="flex flex-row items-center gap-3 no-underline cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-[24px] font-black bg-gradient-to-b from-[#06B6D4] to-[#4F46E5] bg-clip-text text-transparent leading-none">X</div>
            <div className="flex flex-col items-start">
              <h1 className={`text-[16px] font-black leading-none tracking-tight transition-colors duration-400 ${isScrolled ? 'text-[#0F172A]' : 'text-white'}`}>CAMPUS<span className="text-[#06B6D4]">CONNECT</span></h1>
              <span className="text-[8px] font-bold tracking-[0.35em] text-[#06B6D4] mt-0.5 uppercase">UNIVERSITY PORTAL</span>
            </div>
          </div>

          <ul className={`list-none flex gap-1 ml-auto max-[768px]:fixed max-[768px]:top-0 max-[768px]:w-[80%] max-[768px]:h-screen max-[768px]:bg-white max-[768px]:flex-col max-[768px]:p-24 max-[768px]:px-10 max-[768px]:transition-all max-[768px]:duration-[400ms] max-[768px]:shadow-[-10px_0_40px_rgba(0,0,0,0.1)] ${menuOpen ? 'max-[768px]:right-0' : 'max-[768px]:-right-full'}`}>
            {['Home', 'About', 'Modules', 'Contact'].map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`} className={`text-[15px] font-semibold no-underline py-2 px-5 rounded-[50px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] max-[768px]:text-[#0F172A] max-[768px]:text-[20px] max-[768px]:block max-[768px]:py-3 max-[768px]:px-0 max-[768px]:bg-transparent ${l === 'Home' ? (isScrolled ? 'text-[#4F46E5] bg-[#4F46E5]/8' : 'text-white bg-white/10') : (isScrolled ? 'text-slate-600 hover:text-[#4F46E5] hover:bg-[#4F46E5]/8' : 'text-slate-300 hover:text-white hover:bg-white/10')}`} onClick={() => setMenuOpen(false)}>{l}</a></li>
            ))}
          </ul>

          {isLoggedIn ? (
            <button className="max-[768px]:hidden flex items-center gap-2 bg-[#4F46E5] text-white border-none rounded-xl py-2.5 px-6 text-[14px] font-bold cursor-pointer transition-all duration-[250ms] hover:bg-[#4338CA] hover:-translate-y-[2px] shadow-[0_6px_20px_rgba(79,70,229,0.3)] whitespace-nowrap cc-page-cursor-none" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <button className="max-[768px]:hidden flex items-center gap-2 bg-[#4F46E5] text-white border-none rounded-xl py-2.5 px-6 text-[14px] font-bold cursor-pointer transition-all duration-[250ms] hover:bg-[#4338CA] hover:-translate-y-[2px] shadow-[0_6px_20px_rgba(79,70,229,0.3)] whitespace-nowrap cc-page-cursor-none" onClick={() => navigate('/mul-login')}>
              Sign In
            </button>
          )}

          <button className="hidden max-[768px]:flex flex-col gap-1.5 bg-none border-none cursor-pointer p-1 ml-4 cc-page-cursor-none" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0F172A]' : 'bg-white'}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0F172A]' : 'bg-white'}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${isScrolled ? 'bg-[#0F172A]' : 'bg-white'}`} />
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] min-h-[90vh] flex items-center pt-[100px]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute rounded-full filter blur-[100px] opacity-30 w-[600px] h-[600px] bg-[#4F46E5] -top-[150px] -left-[150px] animate-float" />
          <div className="absolute rounded-full filter blur-[100px] opacity-20 w-[450px] h-[450px] bg-[#06B6D4] bottom-[-100px] right-[5%] animate-[float_10s_ease-in-out_infinite_reverse]" />
        </div>

        <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center w-full cc-reveal">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white backdrop-blur-md py-2.5 px-5 rounded-full text-[14px] font-bold mb-8">
            <span className="text-[#06B6D4]">✧</span> We customize to your needs
          </div>
          <h1 className="text-[clamp(44px,6vw,84px)] font-black text-white leading-[1.1] mb-6 tracking-tight">
            What is <span className="bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] bg-clip-text text-transparent">CampusConnect?</span>
          </h1>
          <p className="text-[18px] md:text-[22px] text-white/80 leading-[1.6] mb-10 max-w-[680px] mx-auto font-medium">
            A variety of services catered specifically to your needs. Bring your entire university experience into one beautiful, unified platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <button className="inline-flex items-center gap-2.5 bg-[#4F46E5] text-white border-none rounded-xl py-4 px-8 text-[16px] font-bold cursor-pointer transition-all duration-[250ms] shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] hover:-translate-y-[2px] hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)] cc-page-cursor-none" onClick={() => navigate('/dashboard')}>
                Go to Dashboard <span><IconArrow /></span>
              </button>
            ) : (
              <button className="inline-flex items-center gap-2.5 bg-[#4F46E5] text-white border-none rounded-xl py-4 px-8 text-[16px] font-bold cursor-pointer transition-all duration-[250ms] shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] hover:-translate-y-[2px] hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)] cc-page-cursor-none" onClick={() => navigate('/mul-login')}>
                Get Started Now <span><IconArrow /></span>
              </button>
            )}
            <button className="inline-flex items-center gap-2.5 bg-white/10 text-white border-[1.5px] border-white/20 rounded-xl py-4 px-8 text-[16px] font-bold cursor-pointer transition-all duration-[250ms] backdrop-blur-[8px] hover:bg-white/20 hover:-translate-y-[2px] cc-page-cursor-none" onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}>
              Explore Modules <span>✦</span>
            </button>
          </div>
        </div>
      </section>


      {/* ══════════════ PORTAL ACCESS FOR ADMINS, MODS & ALUMNI ══════════════ */}
      <section className="py-20 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-white relative border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12 cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-block text-[12px] font-extrabold tracking-[0.18em] uppercase mb-3 text-[#06B6D4]">PORTAL ACCESS</div>
            <h2 className="text-[clamp(30px,3.8vw,44px)] font-black text-white mb-3">Administrators, Moderators &amp; Alumni</h2>
            <p className="text-[16px] md:text-[18px] text-white/80 max-w-[620px] mx-auto font-medium">Are you a Campus Administrator, Student Moderator, or Alumni? Access your dedicated portal below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[850px] mx-auto cc-reveal opacity-0 translate-y-8 transition-all duration-700 delay-100">
            {/* Card 1: Admin & Moderator Login */}
            <div className="bg-white/5 border border-white/15 backdrop-blur-xl rounded-[28px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_45px_rgba(79,70,229,0.3)] hover:border-[#4F46E5]/60 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                🛡️
              </div>
              <h3 className="text-[20px] font-black text-white mb-2">Admin &amp; Moderator Portal</h3>
              <p className="text-[14px] text-white/70 mb-6 font-medium leading-relaxed">
                Log in to manage campus users, review flagged content, resolve petitions, and handle moderation queues.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer border-none text-[14px]"
              >
                Login as Admin / Moderator <IconArrow />
              </button>
            </div>

            {/* Card 2: Alumni Portal */}
            <div className="bg-white/5 border border-white/15 backdrop-blur-xl rounded-[28px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_45px_rgba(6,182,212,0.3)] hover:border-[#06B6D4]/60 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                🎓
              </div>
              <h3 className="text-[20px] font-black text-white mb-2">Alumni Network Portal</h3>
              <p className="text-[14px] text-white/70 mb-6 font-medium leading-relaxed">
                Connect with career paths, post job opportunities, mentor students, and participate in forum discussions.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#06B6D4] hover:bg-[#0891b2] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer border-none text-[14px]"
              >
                Login as Alumni <IconArrow />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY CAMPUSCONNECT ══════════════ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#F8FAFC] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-block text-[12px] font-extrabold tracking-[0.18em] uppercase mb-3 text-[#4F46E5]">WHY CAMPUSCONNECT</div>
            <h2 className="text-[clamp(32px,4vw,48px)] font-black text-[#0F172A] mb-4">Empowering Campus Life</h2>
            <p className="text-[17px] text-slate-500 max-w-[640px] mx-auto font-medium">
              Everything you need for a modern, connected, and hassle-free university experience in one sleek portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 cc-reveal opacity-0 translate-y-8 transition-all duration-700 delay-100">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-[28px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/40 transition-all duration-300 flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#4F46E5]/10 transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">{f.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CONNECT WITH STUDENTS (GALLERY) ══════════════ */}
      <section id="about" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-block text-[12px] font-extrabold tracking-[0.15em] uppercase mb-4 text-[#4F46E5]">COMMUNITY</div>
            <h2 className="text-[clamp(32px,4vw,48px)] font-black text-[#0F172A] mb-4">Connect With Your Fellows</h2>
            <p className="text-[17px] text-slate-500 max-w-[600px] mx-auto">Engage, collaborate, and build lasting relationships with students across all departments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cc-reveal opacity-0 translate-y-8 transition-all duration-700 delay-100">
            <div className="group rounded-[24px] overflow-hidden relative h-[320px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] cc-page-cursor-none">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" alt="Students studying" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white font-bold text-[18px]">Group Discussions</span>
              </div>
            </div>
            <div className="group rounded-[24px] overflow-hidden relative h-[320px] md:-translate-y-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] cc-page-cursor-none">
              <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80" alt="Students laughing" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white font-bold text-[18px]">Campus Life</span>
              </div>
            </div>
            <div className="group rounded-[24px] overflow-hidden relative h-[320px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] cc-page-cursor-none">
              <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80" alt="Students collaborating" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-white font-bold text-[18px]">Peer Networking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ MODULES ══════════════ */}
      <section id="modules" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-block text-[12px] font-extrabold tracking-[0.15em] uppercase mb-4 text-[#06B6D4]">OUR PLATFORM</div>
            <h2 className="text-[clamp(32px,4vw,48px)] font-black text-[#0F172A] mb-4">A Module For Every Need</h2>
            <p className="text-[17px] text-slate-500 max-w-[600px] mx-auto">Everything you need to thrive at university is right at your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULES.map((m, i) => (
              <div key={i} className="group/module bg-white border border-slate-200 rounded-[24px] p-8 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer relative overflow-hidden hover:-translate-y-[8px] hover:shadow-[0_24px_48px_rgba(79,70,229,0.1)] hover:border-[#4F46E5]/30 cc-page-cursor-none cc-reveal opacity-0 translate-y-8" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover/module:opacity-100 pointer-events-none" />
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-[#4F46E5] mb-6 transition-all duration-300 group-hover/module:scale-110 group-hover/module:rotate-6 group-hover/module:bg-[#4F46E5] group-hover/module:text-white relative z-10 shadow-sm">{m.icon}</div>
                <h3 className="text-[20px] font-black text-[#0F172A] mb-3 relative z-10">{m.title}</h3>
                <p className="text-[15px] text-slate-500 leading-[1.6] relative z-10 font-medium">{m.desc}</p>
                <div className="absolute bottom-8 right-7 w-6 text-[#4F46E5] opacity-0 -translate-x-[10px] transition-all duration-300 group-hover/module:opacity-100 group-hover/module:translate-x-0 z-10"><IconArrow /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute w-[500px] h-[500px] bg-[#4F46E5] rounded-full blur-[120px] -top-40 -right-40" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-block text-[12px] font-extrabold tracking-[0.18em] uppercase mb-3 text-[#06B6D4]">EASY SETUP</div>
            <h2 className="text-[clamp(32px,4vw,48px)] font-black text-white mb-4">How CampusConnect Works</h2>
            <p className="text-[17px] text-slate-300 max-w-[600px] mx-auto font-medium">Get started in just four simple steps and transform how you interact with your campus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cc-reveal opacity-0 translate-y-8 transition-all duration-700 delay-100">
            {HOW_IT_WORKS.map((hw, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[24px] p-7 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                <div>
                  <span className="text-[36px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] block mb-4 group-hover:scale-105 transition-transform duration-300">{hw.step}</span>
                  <h3 className="text-[18px] font-extrabold text-white mb-2">{hw.title}</h3>
                  <p className="text-[14px] text-slate-400 font-medium leading-relaxed">{hw.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="py-16 bg-white relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-[32px] p-10 md:p-14 text-center relative overflow-hidden shadow-[0_25px_60px_rgba(15,23,42,0.25)] cc-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#4F46E5]/30 rounded-full filter blur-[80px] pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#06B6D4]/30 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="relative z-10 max-w-[700px] mx-auto">
              <h2 className="text-[clamp(30px,3.8vw,44px)] font-black text-white mb-4 leading-tight">
                Ready to Upgrade Your <span className="bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] bg-clip-text text-transparent">Campus Experience?</span>
              </h2>
              <p className="text-[16px] md:text-[18px] text-white/80 mb-8 font-medium">
                Join thousands of students and faculty members already enjoying a connected, efficient campus life.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/mul-login')}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-[0_10px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 border-none text-[15px] cursor-pointer"
                >
                  Join CampusConnect Now
                </button>
                <button
                  onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 border border-white/20 hover:-translate-y-0.5 text-[15px] cursor-pointer backdrop-blur-sm"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-[#0F172A] pt-12 pb-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-8 mb-8">
          <div className="text-left">
            <div className="flex flex-row items-center gap-3 no-underline cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-[15px] font-black leading-none tracking-tight text-white">CAMPUS<span className="text-[#06B6D4]">CONNECT</span></h1>
                <span className="text-[8px] font-bold tracking-[0.35em] text-[#06B6D4] mt-0.5 uppercase">UNIVERSITY PORTAL</span>
              </div>
            </div>
            <p className="text-[14px] text-slate-400 leading-relaxed my-3 max-w-[280px]">Empowering students with connection, convenience, and a smarter campus life.</p>
            <div className="flex gap-2.5">
              <a href="#!" aria-label="Facebook" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#4F46E5] hover:-translate-y-[2px] cc-page-cursor-none"><IconFacebook /></a>
              <a href="#!" aria-label="Instagram" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#4F46E5] hover:-translate-y-[2px] cc-page-cursor-none"><IconInstagram /></a>
              <a href="#!" aria-label="Twitter" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#4F46E5] hover:-translate-y-[2px] cc-page-cursor-none"><IconTwitter /></a>
              <a href="#!" aria-label="LinkedIn" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#4F46E5] hover:-translate-y-[2px] cc-page-cursor-none"><IconLinkedin /></a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="text-left">
              <h4 className="text-[15px] font-extrabold text-white mb-3">{group}</h4>
              <ul className="list-none m-0 p-0">{links.map(l => <li key={l} className="mb-2"><a href="#!" className="text-[13.5px] text-slate-400 no-underline transition-all duration-200 hover:text-[#06B6D4] hover:pl-1 cc-page-cursor-none">{l}</a></li>)}</ul>
            </div>
          ))}

          <div className="text-left">
            <h4 className="text-[15px] font-extrabold text-white mb-3">Contact Us</h4>
            <ul className="list-none m-0 p-0 text-[13.5px] text-slate-400">
              <li className="mb-2">✉ info@mul.edu.pk</li>
              <li className="mb-2">📞 +92 42 35145621</li>
              <li className="mb-2 leading-snug">📍 Minhaj University Lahore, <br /> Near Hamdard Chowk, Lahore</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-4 px-6 border-t border-white/5 text-center text-[13px] text-slate-500">
          <span>© {new Date().getFullYear()} CampusConnect. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
