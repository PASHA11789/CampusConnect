import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MUL-Logo.png';
import mulVideo from './A place where character rises in every direction.Admissions Open – Minhaj University Lahore – Fa.mp4';
import ibnKhaldunImg from '../../assets/ibn_e_khaldun.jpg';
import groupDiscussionImg from '../../assets/group_discussion.png';

/* ─────────────────────────────────────────────
   FontAwesome 6 Icons
 ───────────────────────────────────────────── */
const IconForum = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-comments flex items-center justify-center ${className}`} />;
const IconClipboard = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-clipboard-list flex items-center justify-center ${className}`} />;
const IconMenu = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-utensils flex items-center justify-center ${className}`} />;
const IconArrow = ({ className = "w-4 h-4" }) => <i className={`fa-solid fa-arrow-right flex items-center justify-center ${className}`} />;
const IconUsers = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-user-graduate flex items-center justify-center ${className}`} />;
const IconFacebook = ({ className = "w-5 h-5" }) => <i className={`fa-brands fa-facebook-f flex items-center justify-center ${className}`} />;
const IconInstagram = ({ className = "w-5 h-5" }) => <i className={`fa-brands fa-instagram flex items-center justify-center ${className}`} />;
const IconTwitter = ({ className = "w-5 h-5" }) => <i className={`fa-brands fa-x-twitter flex items-center justify-center ${className}`} />;
const IconLinkedin = ({ className = "w-5 h-5" }) => <i className={`fa-brands fa-linkedin-in flex items-center justify-center ${className}`} />;
const IconSparkles = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-wand-magic-sparkles flex items-center justify-center ${className}`} />;
const IconShieldCheck = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-shield-halved flex items-center justify-center ${className}`} />;
const IconZap = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-bolt flex items-center justify-center ${className}`} />;
const IconRocket = ({ className = "w-6 h-6" }) => <i className={`fa-solid fa-rocket flex items-center justify-center ${className}`} />;


const FEATURES = [
  {
    icon: <IconZap className="w-7 h-7 text-[#00c2cb]" />,
    title: 'Real-Time Peer Discussions',
    desc: 'Collaborate with classmates, share subject notes, and ask questions in instant study channels.'
  },
  {
    icon: <IconShieldCheck className="w-7 h-7 text-[#071A35]" />,
    title: 'Official Student Petitions',
    desc: 'Raise genuine student concerns directly to university management with full transparency.'
  },
  {
    icon: <IconSparkles className="w-7 h-7 text-[#00c2cb]" />,
    title: 'Smart Canteen Pre-Ordering',
    desc: 'View live canteen menus, place orders online, and skip long queue lines during break hours.'
  },
  {
    icon: <IconRocket className="w-7 h-7 text-[#071A35]" />,
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
      <div ref={dotRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-3 h-3 -ml-[6px] -mt-[6px] bg-[#00c2cb]' : 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-[#00c2cb]'}`} />
      <div ref={outlineRef} className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform ${isHovering ? 'w-[50px] h-[50px] -ml-[25px] -mt-[25px] border-[#00c2cb]/80 bg-[#00c2cb]/10' : 'w-9 h-9 -ml-[18px] -mt-[18px] border-[#071A35]/40 bg-[#071A35]/5'}`} />
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useScrollReveal();

  return (
    <div className="font-sans text-[#071A35] bg-[#FAF7F0] h-full w-full max-w-full overflow-y-auto overflow-x-hidden cc-page-cursor-none cc-page">
      <CustomCursor />

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-[#071A35]/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-[#E8E1D5] shadow-sm' : 'bg-[#071A35] border-[#071A35]'}`}>
        <div className="mx-auto px-4 sm:px-6 h-20 flex items-center gap-4 sm:gap-8 max-w-[1200px] w-full justify-between">
          <div className="flex flex-row items-center gap-2.5 sm:gap-3 no-underline cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center p-1 border border-[#E8E1D5] shadow-xs">
              <img src={logo} alt="Minhaj Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-[20px] sm:text-[22px] font-black text-[#00c2cb] leading-none">X</div>
            <div className="flex flex-col items-start">
              <h1 className={`text-[14px] sm:text-[16px] font-black leading-none tracking-tight transition-colors ${isScrolled ? 'text-[#071A35]' : 'text-white'}`}>CAMPUS<span className="text-[#00c2cb]">CONNECT</span></h1>
              <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#00c2cb] mt-0.5 uppercase">FOR MINHAJ UNIVERSITY STUDENTS</span>
            </div>
          </div>

          <ul className={`list-none flex gap-1 ml-auto max-[768px]:fixed max-[768px]:top-0 max-[768px]:w-[280px] sm:max-[768px]:w-[320px] max-[768px]:h-screen max-[768px]:bg-white max-[768px]:flex-col max-[768px]:p-8 max-[768px]:pt-20 max-[768px]:gap-3 max-[768px]:transition-all max-[768px]:duration-300 max-[768px]:shadow-xl z-50 ${menuOpen ? 'max-[768px]:right-0' : 'max-[768px]:-right-full'}`}>
            {['Home', 'About', 'Modules', 'Contact'].map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`} className={`text-[14px] font-bold no-underline py-2 px-4 rounded-xl transition-colors max-[768px]:text-[#071A35] max-[768px]:text-[17px] max-[768px]:block max-[768px]:py-2.5 max-[768px]:px-4 max-[768px]:hover:bg-[#FAF7F0] ${l === 'Home' ? (isScrolled ? 'text-[#071A35] bg-[#FAF7F0]' : 'text-white bg-white/10') : (isScrolled ? 'text-[#211A24]/70 hover:text-[#071A35] hover:bg-[#FAF7F0]' : 'text-white/80 hover:text-white hover:bg-white/10')}`} onClick={() => setMenuOpen(false)}>{l}</a></li>
            ))}
            <li className="hidden max-[768px]:block mt-4 pt-4 border-t border-[#E8E1D5]">
              <button
                onClick={() => { setMenuOpen(false); navigate('/mul-login'); }}
                className="w-full bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black py-3 px-6 rounded-xl shadow-sm text-[15px] cursor-pointer transition-colors border-none"
              >
                Sign In to Portal
              </button>
            </li>
          </ul>

          <button className="max-[768px]:hidden flex items-center gap-2 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] border-none rounded-xl py-2.5 px-5 text-[13.5px] font-black cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap cc-page-cursor-none" onClick={() => navigate('/mul-login')}>
            Sign In
          </button>

          <button className="hidden max-[768px]:flex flex-col justify-center gap-1.5 bg-none border-none cursor-pointer p-2 rounded-lg ml-auto z-50 cc-page-cursor-none" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${menuOpen ? 'bg-[#071A35] rotate-45 translate-y-2' : (isScrolled ? 'bg-[#071A35]' : 'bg-white')}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${menuOpen ? 'opacity-0' : (isScrolled ? 'bg-[#071A35]' : 'bg-white')}`} />
            <span className={`block w-[22px] h-0.5 rounded-sm transition-all duration-300 ${menuOpen ? 'bg-[#071A35] -rotate-45 -translate-y-2' : (isScrolled ? 'bg-[#071A35]' : 'bg-white')}`} />
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="home" className="relative overflow-hidden bg-[#071A35] min-h-[88vh] flex items-center pt-[100px] md:pt-[120px] pb-12 md:pb-20 border-b border-[#071A35]">
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 text-center lg:text-left cc-reveal">

            <h1 className="text-[clamp(30px,4.2vw,64px)] font-black text-white leading-[1.15] mb-5 sm:mb-6 tracking-tight">
              CampusConnect <span className="text-[#00c2cb]">For Minhaj Students</span>
            </h1>
            <p className="text-[15px] sm:text-[17px] md:text-[19px] text-white/85 leading-[1.65] mb-6 sm:mb-8 max-w-[620px] mx-auto lg:mx-0 font-medium">
              A student-built digital platform created for Minhaj University Lahore. Connect with academic study forums, voice student petitions, pre-order from campus canteens, and engage with verified alumni networks.
            </p>

            <div className="flex gap-3 sm:gap-4 items-center justify-center lg:justify-start flex-wrap mb-6 sm:mb-8">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] border-none rounded-xl py-3.5 sm:py-4 px-7 sm:px-8 text-[14.5px] sm:text-[15.5px] font-black cursor-pointer transition-all shadow-md active:scale-98 cc-page-cursor-none" onClick={() => navigate('/mul-login')}>
                Get Started Now <span><IconArrow /></span>
              </button>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-xl py-3.5 sm:py-4 px-7 sm:px-8 text-[14.5px] sm:text-[15.5px] font-bold cursor-pointer transition-all active:scale-98 cc-page-cursor-none" onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}>
                Explore Modules <span>✦</span>
              </button>
            </div>

            {/* Quick feature tags */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-4 border-t border-white/15 text-white/80 text-[12px] sm:text-[13px] font-bold flex-wrap">
              <span className="flex items-center gap-1.5"><span className="text-[#00c2cb]">✓</span> Student-Built Platform</span>
              <span className="flex items-center gap-1.5"><span className="text-[#00c2cb]">✓</span> Student Petitions & Forums</span>
              <span className="flex items-center gap-1.5"><span className="text-[#00c2cb]">✓</span> Canteen Pre-Ordering</span>
            </div>
          </div>

          {/* Right Column: Minhaj University Vertical Reel Showcase Video */}
          <div className="lg:col-span-5 relative flex justify-center cc-reveal">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] rounded-[28px] overflow-hidden border-2 border-white/20 bg-[#071A35] shadow-xl group">
              <video
                src={mulVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[440px] sm:h-[500px] object-cover block transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-slate-900/30 pointer-events-none" />

              {/* Solid Badge Top Left */}
              <div className="absolute top-4 left-4 bg-[#071A35] border border-white/20 rounded-full py-1.5 px-3.5 text-white text-[11px] sm:text-[12px] font-black flex items-center gap-2 shadow-md z-10">
                <span className="w-2 h-2 rounded-full bg-[#00c2cb]" />
                Minhaj University Lahore
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════ PORTAL ACCESS FOR ADMINS, MODS & ALUMNI ══════════════ */}
      <section className="py-14 sm:py-20 md:py-24 bg-[#071A35] border-t border-white/10 relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-500">
            <div className="inline-block text-[11px] sm:text-[12px] font-black tracking-[0.18em] uppercase mb-3 text-[#00c2cb]">PORTAL ACCESS</div>
            <h2 className="text-[clamp(26px,4vw,44px)] font-black text-white mb-3 sm:mb-4 leading-tight">
              Administrators, Moderators &amp; Alumni
            </h2>
            <p className="text-[14px] sm:text-[16.5px] text-white/80 max-w-[680px] mx-auto font-semibold leading-relaxed">
              Dedicated access portals for university administrative management, student content moderation, and alumni networking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[950px] mx-auto cc-reveal opacity-0 translate-y-8 transition-all duration-500 delay-100">
            {/* Card 1: Admin & Moderator Login */}
            <div className="bg-white/5 border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-md hover:border-[#00c2cb]/60 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 text-[#00c2cb] flex items-center justify-center text-2xl sm:text-3xl mb-5 border border-white/10">
                <i className="fa-solid fa-user-shield text-[#00c2cb] text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-[18px] sm:text-[22px] font-black text-white mb-2.5 sm:mb-3">Admin &amp; Moderator Portal</h3>
              <p className="text-[13.5px] sm:text-[14.5px] text-white/75 mb-6 sm:mb-8 font-medium leading-relaxed">
                Log in to manage campus users, review flagged content, resolve petitions, and handle moderation queues.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black py-3.5 sm:py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer border-none text-[14px] sm:text-[15px] mt-auto"
              >
                Login as Admin / Moderator <IconArrow />
              </button>
            </div>

            {/* Card 2: Alumni Portal */}
            <div className="bg-white/5 border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-md hover:border-white/40 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl sm:text-3xl mb-5 border border-white/10">
                <i className="fa-solid fa-user-graduate text-white text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-[18px] sm:text-[22px] font-black text-white mb-2.5 sm:mb-3">Alumni Network Portal</h3>
              <p className="text-[13.5px] sm:text-[14.5px] text-white/75 mb-6 sm:mb-8 font-medium leading-relaxed">
                Connect with career paths, post job opportunities, mentor students, and participate in forum discussions.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/20 cursor-pointer text-[14px] sm:text-[15px] mt-auto"
              >
                Login as Alumni <IconArrow />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY CAMPUSCONNECT ══════════════ */}
      <section className="py-14 sm:py-20 md:py-24 bg-[#FAF7F0] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-500">
            <div className="inline-block text-[11px] sm:text-[12px] font-black tracking-[0.18em] uppercase mb-3 text-[#071A35]">EMPOWERING CAMPUS LIFE</div>
            <h2 className="text-[clamp(30px,4.5vw,50px)] font-black text-[#071A35] mb-3 sm:mb-4">Why CampusConnect?</h2>
            <p className="text-[14px] sm:text-[16.5px] text-[#211A24]/75 max-w-[680px] mx-auto font-medium mb-3">
              Everything you need for a modern, connected, and hassle-free university experience in one sleek portal.
            </p>
            <p className="text-[13px] sm:text-[15px] text-[#071A35] max-w-[680px] mx-auto font-bold">
              Built by students specifically for Minhaj University Lahore to facilitate seamless study circles, peer connections, and academic collaborations across all departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 cc-reveal opacity-0 translate-y-8 transition-all duration-500 delay-100">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs hover:border-[#071A35] transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#071A35]/5 text-[#071A35] flex items-center justify-center shrink-0 border border-[#071A35]/10">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-black text-[#071A35] mb-2">{f.title}</h3>
                  <p className="text-[13.5px] sm:text-[15px] text-[#211A24]/75 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CONNECT WITH STUDENTS (GALLERY) ══════════════ */}
      <section id="about" className="py-14 sm:py-20 md:py-24 bg-white relative overflow-hidden border-t border-[#E8E1D5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-500">
            <div className="inline-block text-[11px] sm:text-[12px] font-black tracking-[0.15em] uppercase mb-3 sm:mb-4 text-[#071A35]">COMMUNITY</div>
            <h2 className="text-[clamp(26px,4vw,44px)] font-black text-[#071A35] mb-3 sm:mb-4">Connect With Your Fellows</h2>
            <p className="text-[14px] sm:text-[16.5px] text-[#211A24]/75 max-w-[600px] mx-auto font-medium">Engage, collaborate, and build lasting relationships with students across all departments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cc-reveal opacity-0 translate-y-8 transition-all duration-500 delay-100">
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden relative h-[260px] sm:h-[320px] shadow-sm border border-[#E8E1D5] cc-page-cursor-none">
              <img src={groupDiscussionImg} alt="Group Discussions" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
              <div className="absolute inset-0 bg-[#071A35]/65 flex flex-col justify-end p-6 sm:p-8">
                <span className="text-white font-black text-[16px] sm:text-[18px]">Group Discussions</span>
              </div>
            </div>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden relative h-[260px] sm:h-[320px] md:-translate-y-4 shadow-sm border border-[#E8E1D5] cc-page-cursor-none">
              <img src={ibnKhaldunImg} alt="Minhaj University Campus Life" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
              <div className="absolute inset-0 bg-[#071A35]/65 flex flex-col justify-end p-6 sm:p-8">
                <span className="text-white font-black text-[16px] sm:text-[18px]">Minhaj Campus Life</span>
              </div>
            </div>
            <div className="group rounded-2xl sm:rounded-3xl overflow-hidden relative h-[260px] sm:h-[320px] shadow-sm border border-[#E8E1D5] cc-page-cursor-none">
              <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80" alt="Peer Networking" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
              <div className="absolute inset-0 bg-[#071A35]/65 flex flex-col justify-end p-6 sm:p-8">
                <span className="text-white font-black text-[16px] sm:text-[18px]">Peer Networking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ MODULES ══════════════ */}
      <section id="modules" className="py-14 sm:py-20 md:py-24 bg-[#FAF7F0] border-t border-[#E8E1D5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-500">
            <div className="inline-block text-[11px] sm:text-[12px] font-black tracking-[0.15em] uppercase mb-3 sm:mb-4 text-[#071A35]">OUR PLATFORM</div>
            <h2 className="text-[clamp(26px,4vw,44px)] font-black text-[#071A35] mb-3 sm:mb-4">A Module For Every Need</h2>
            <p className="text-[14px] sm:text-[16.5px] text-[#211A24]/75 max-w-[600px] mx-auto font-medium">Everything you need to thrive at university is right at your fingertips.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {MODULES.map((m, i) => (
              <div key={i} className="group/module bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 cursor-pointer relative overflow-hidden hover:border-[#071A35] shadow-xs cc-page-cursor-none cc-reveal opacity-0 translate-y-8" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FAF7F0] rounded-2xl flex items-center justify-center text-[#071A35] mb-5 sm:mb-6 border border-[#E8E1D5] group-hover/module:bg-[#071A35] group-hover/module:text-[#00c2cb] transition-colors relative z-10">{m.icon}</div>
                <h3 className="text-[18px] sm:text-[20px] font-black text-[#071A35] mb-2 sm:mb-3 relative z-10">{m.title}</h3>
                <p className="text-[13.5px] sm:text-[15px] text-[#211A24]/75 leading-[1.6] relative z-10 font-medium">{m.desc}</p>
                <div className="absolute bottom-6 right-6 w-5 text-[#071A35] opacity-0 -translate-x-[10px] transition-all duration-300 group-hover/module:opacity-100 group-hover/module:translate-x-0 z-10"><IconArrow /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="py-14 sm:py-20 md:py-24 bg-[#071A35] text-white relative overflow-hidden border-t border-[#071A35]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16 cc-reveal opacity-0 translate-y-8 transition-all duration-500">
            <div className="inline-block text-[11px] sm:text-[12px] font-black tracking-[0.18em] uppercase mb-3 text-[#00c2cb]">OUR VISION</div>
            <h2 className="text-[clamp(26px,4vw,44px)] font-black text-white mb-3 sm:mb-4">Our Vision for CampusConnect</h2>
            <p className="text-[14px] sm:text-[16.5px] text-white/80 max-w-[680px] mx-auto font-medium">We aim to provide a customized, state-of-the-art digital ecosystem tailored specifically to the unique needs of Minhaj University Lahore — empowering students, graduates, and administration under one unified hub.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 cc-reveal opacity-0 translate-y-8 transition-all duration-500 delay-100">
            {HOW_IT_WORKS.map((hw, i) => (
              <div key={i} className="bg-white/5 border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:bg-white/10 hover:border-white/30 transition-colors group">
                <div>
                  <span className="text-[30px] sm:text-[36px] font-black text-[#00c2cb] block mb-3 sm:mb-4">{hw.step}</span>
                  <h3 className="text-[16px] sm:text-[18px] font-black text-white mb-2">{hw.title}</h3>
                  <p className="text-[13px] sm:text-[14px] text-white/75 font-medium leading-relaxed">{hw.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="py-12 sm:py-16 bg-[#FAF7F0] relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="bg-[#071A35] border border-[#071A35] rounded-2xl sm:rounded-3xl p-7 sm:p-10 md:p-14 text-center relative overflow-hidden shadow-lg cc-reveal opacity-0 translate-y-8 transition-all duration-500">

            <div className="relative z-10 max-w-[700px] mx-auto">
              <h2 className="text-[clamp(24px,3.8vw,42px)] font-black text-white mb-3 sm:mb-4 leading-tight">
                Ready to Upgrade Your <span className="text-[#00c2cb]">Campus Experience?</span>
              </h2>
              <p className="text-[14px] sm:text-[16px] md:text-[18px] text-white/80 mb-6 sm:mb-8 font-medium">
                Join thousands of students and faculty members already enjoying a connected, efficient campus life at Minhaj University Lahore.
              </p>
              <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/mul-login')}
                  className="w-full sm:w-auto bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black py-3.5 px-7 sm:px-8 rounded-xl transition-all shadow-md active:scale-98 border-none text-[14px] sm:text-[15px] cursor-pointer"
                >
                  Join CampusConnect Now
                </button>
                <button
                  onClick={() => document.getElementById('modules').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-7 sm:px-8 rounded-xl transition-all border border-white/20 text-[14px] sm:text-[15px] cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-[#071A35] pt-10 pb-6 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8 items-start">
          {/* Left: Brand & Social Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-row items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 border border-white/20 shadow-xs">
                <img src={logo} alt="CampusConnect Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-[15px] font-black leading-none tracking-tight text-white">CAMPUS<span className="text-[#00c2cb]">CONNECT</span></h1>
                <span className="text-[8px] font-bold tracking-[0.35em] text-[#00c2cb] mt-0.5 uppercase">MINHAJ UNIVERSITY LAHORE</span>
              </div>
            </div>
            <p className="text-[13px] text-white/70 my-3 max-w-[280px]">
              Empowering students with connection, convenience, and a smarter campus life.
            </p>
            <div className="flex gap-2.5 mt-1">
              <a href="#!" aria-label="Facebook" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-[#00c2cb] hover:text-[#071A35] cc-page-cursor-none"><IconFacebook /></a>
              <a href="#!" aria-label="Instagram" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-[#00c2cb] hover:text-[#071A35] cc-page-cursor-none"><IconInstagram /></a>
              <a href="#!" aria-label="Twitter" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-[#00c2cb] hover:text-[#071A35] cc-page-cursor-none"><IconTwitter /></a>
              <a href="#!" aria-label="LinkedIn" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white transition-colors hover:bg-[#00c2cb] hover:text-[#071A35] cc-page-cursor-none"><IconLinkedin /></a>
            </div>
          </div>

          {/* Middle: Quick Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[15px] font-black text-white mb-3">Quick Links</h4>
            <ul className="list-none m-0 p-0 space-y-2 text-[13.5px] text-white/70 font-medium">
              <li><a href="#home" className="no-underline text-white/70 hover:text-[#00c2cb] transition-colors">Home</a></li>
              <li><a href="#about" className="no-underline text-white/70 hover:text-[#00c2cb] transition-colors">About Us</a></li>
              <li><a href="#modules" className="no-underline text-white/70 hover:text-[#00c2cb] transition-colors">Features &amp; Modules</a></li>
              <li><a href="#contact" className="no-underline text-white/70 hover:text-[#00c2cb] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Right: Contact Us */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[15px] font-black text-white mb-3">Contact Us</h4>
            <ul className="list-none m-0 p-0 text-[13.5px] text-white/70 space-y-2 font-medium">
              <li className="flex items-center gap-2"><i className="fa-solid fa-envelope text-[#00c2cb]" /> sagheerahmad5767@gmail.com</li>
              <li className="flex items-center gap-2"><i className="fa-solid fa-envelope text-[#00c2cb]" /> shujaapasha11789@gmail.com</li>
              <li className="flex items-center gap-2"><i className="fa-solid fa-phone text-[#00c2cb]" /> +92 42 35145621</li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-6 pt-4 px-4 sm:px-6 border-t border-white/10 text-center text-[12.5px] text-white/60 font-medium">
          <span>© {new Date().getFullYear()} CampusConnect. All rights reserved. | <span className="text-[#00c2cb] font-extrabold">An idea by Mr. Sagheer Ahmad &amp; Mr. Shujaat Ali Hashim</span></span>
        </div>
      </footer>
    </div>
  );
}
