import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MUL-Logo.png';
import './Home.css';

/* ─────────────────────────────────────────────
   Inline SVG icons (no external icon lib needed)
 ───────────────────────────────────────────── */
const IconForum = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconClipboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
const IconVote = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
const IconMenu = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18M3 9h18M3 15h18M3 21h18" /></svg>;
const IconBell = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconPin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
const IconStar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IconZap = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconFacebook = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>;
const IconInstagram = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconTwitter = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>;
const IconLinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;

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
          e.target.classList.add('cc-revealed');
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
      <div ref={dotRef} className={`cc-cursor-dot ${isHovering ? 'hover' : ''}`} />
      <div ref={outlineRef} className={`cc-cursor-outline ${isHovering ? 'hover' : ''}`} />
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
    <div className="cc-page">
      <CustomCursor />
      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className={`cc-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="cc-nav-inner">
          <div className="cc-logo">
            <div className="cc-logo-icon-wrapper">
              <img src={logo} alt="Minhaj Logo" className="cc-logo-img" />
            </div>
            <div className="cc-logo-x">X</div>
            <div className="cc-logo-text-col">
              <h1 className="cc-logo-title">CAMPUS<span>CONNECT</span></h1>
              <span className="cc-logo-subtitle">UNIVERSITY PORTAL</span>
            </div>
          </div>

          <ul className={`cc-nav-links ${menuOpen ? 'open' : ''}`}>
            {['Home', 'About', 'Features', 'Contact'].map(l => (
              <li key={l}><a href={`#${l.toLowerCase()}`} className={l === 'Home' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{l}</a></li>
            ))}
          </ul>

          <button className="cc-btn-dashboard" onClick={() => navigate('/dashboard')}>
            <span className="icon-grid">⊞</span> Dashboard
          </button>

          <button className="cc-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="home" className="cc-hero">
        <div className="cc-hero-bg-shapes">
          <div className="shape s1" /><div className="shape s2" /><div className="shape s3" />
        </div>
        <div className="cc-hero-inner">
          <div className="cc-hero-content">
            <div className="cc-hero-badge">🎓 Welcome to the Future of Campus Life</div>
            <h1 className="cc-hero-title">
              All Your Campus,<br />
              <span>One Platform.</span>
            </h1>
            <p className="cc-hero-desc">
              Connect with peers, find lost items, sign petitions, order from the canteen — everything you need as a student, beautifully unified.
            </p>
            <div className="cc-hero-actions">
              <button className="cc-btn-primary" onClick={() => navigate('/login')}>
                Sign In to Portal <span><IconArrow /></span>
              </button>
              <button className="cc-btn-outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Explore Features <span>✦</span>
              </button>
            </div>
          </div>

          <div className="cc-hero-visual">
            <div className="cc-dashboard-preview">
              <div className="cc-preview-topbar">
                <div className="cc-dots"><span /><span /><span /></div>
                <div className="cc-preview-tabs">
                  <span className="active">Lost &amp; Found</span>
                  <span>Petitions</span>
                  <span>Events</span>
                </div>
                <div className="cc-preview-bell">🔔<sup>2</sup></div>
              </div>
              <div className="cc-preview-body">
                <div className="cc-preview-sidebar">
                  {['🏠', '💬', '🔍', '📋', '🍽️', '🔔'].map((ic, i) => (
                    <div key={i} className={`cc-sidebar-item ${i === 0 ? 'active' : ''}`}>{ic}</div>
                  ))}
                </div>
                <div className="cc-preview-main">
                  <div className="cc-preview-label">Recent Activity</div>
                  {['📢 New petition posted', '🔍 Lost keys reported', '🍽️ Menu updated'].map((t, i) => (
                    <div key={i} className="cc-activity-row">
                      <div className="cc-activity-dot" />
                      <span>{t}</span>
                    </div>
                  ))}
                  <div className="cc-preview-label" style={{ marginTop: '12px' }}>Upcoming Events</div>
                  {['Tech Talk Seminar', 'Cultural Day', 'Sports Gala'].map((e, i) => (
                    <div key={i} className="cc-event-chip">{e}</div>
                  ))}
                </div>
              </div>
            </div>
            {/* floating badges */}
            <div className="cc-float-badge f1">📬 <span>12 New Messages</span></div>
            <div className="cc-float-badge f2">🔔 <span>Event Reminder</span></div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="cc-stats">
        {STATS.map((s, i) => (
          <div key={i} className="cc-stat-item cc-reveal">
            <div className="cc-stat-icon">{s.icon}</div>
            <div>
              <div className="cc-stat-value">{s.value}</div>
              <div className="cc-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="cc-section cc-features-section">
        <div className="cc-section-inner">
          <div className="cc-section-badge cc-reveal">FEATURES</div>
          <h2 className="cc-section-title cc-reveal">Everything you need, in one place</h2>
          <p className="cc-section-sub cc-reveal">Powerful tools and features designed to make your campus life easier, smarter, and more connected.</p>
          <div className="cc-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="cc-feature-card cc-reveal" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="cc-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="cc-feature-arrow"><IconArrow /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BUILT FOR STUDENTS ══════════════ */}
      <section id="about" className="cc-section cc-built-section">
        <div className="cc-section-inner cc-built-inner">
          <div className="cc-built-content cc-reveal">
            <div className="cc-section-badge light">BUILT FOR STUDENTS</div>
            <h2 className="cc-section-title light">A Smarter Way to<br />Experience Campus</h2>
            <p className="cc-section-sub light">CampusConnect brings all essential student services together in one powerful platform. Stay informed, get involved, and make the most of your university life.</p>
            <ul className="cc-built-list">
              {['Easy to use and mobile friendly', 'Real-time updates and notifications', 'Trusted by thousands of students'].map((it, i) => (
                <li key={i}><span className="cc-check"><IconCheck /></span>{it}</li>
              ))}
            </ul>
          </div>
          <div className="cc-built-illustration cc-reveal">
            <div className="cc-illus-bg" />
            <div className="cc-illus-students">
              {/* Stylised student group illustration */}
              <div className="cc-student s1">
                <div className="cc-student-head" />
                <div className="cc-student-body" />
                <div className="cc-student-device laptop" />
              </div>
              <div className="cc-student s2">
                <div className="cc-student-head" />
                <div className="cc-student-body" />
                <div className="cc-student-device phone" />
              </div>
              <div className="cc-student s3">
                <div className="cc-student-head" />
                <div className="cc-student-body" />
                <div className="cc-student-device tablet" />
              </div>
            </div>
            <div className="cc-illus-badge b1">✅ Connected</div>
            <div className="cc-illus-badge b2">🎓 Engaged</div>
            <div className="cc-illus-badge b3">📊 Informed</div>
          </div>
        </div>
      </section>

      {/* ══════════════ EVENTS ══════════════ */}
      <section id="contact" className="cc-section cc-events-section">
        <div className="cc-section-inner">
          <div className="cc-section-badge cc-reveal">UPCOMING EVENTS</div>
          <h2 className="cc-section-title cc-reveal">Don't Miss What's Happening</h2>
          <p className="cc-section-sub cc-reveal">Stay updated with the latest events and activities on campus.</p>
          <div className="cc-events-grid">
            {EVENTS.map((ev, i) => (
              <div key={i} className="cc-event-card cc-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="cc-event-date">
                  <span className="day">{ev.day}</span>
                  <span className="month">{ev.month}</span>
                </div>
                <div className="cc-event-info">
                  <h3>{ev.title}</h3>
                  <p>{ev.desc}</p>
                  <div className="cc-event-meta">
                    <span><IconCalendar /> {ev.time}</span>
                    <span><IconPin /> {ev.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="cc-btn-primary">View All Events <span><IconArrow /></span></button>
          </div>
        </div>
      </section>

      {/* ══════════════ UNIQUE CTA ══════════════ */}
      <section className="cc-unique-cta">
        <div className="cc-cta-background">
          <div className="cc-cta-orb orb1"></div>
          <div className="cc-cta-orb orb2"></div>
          <div className="cc-cta-orb orb3"></div>
        </div>
        <div className="cc-cta-glass-card cc-reveal">
          <div className="cc-cta-content">
            <div className="cc-cta-badge">Join the Revolution</div>
            <h2 className="cc-cta-heading">Step into the <span>Future</span> of Campus Life</h2>
            <p className="cc-cta-description">
              Stop juggling multiple apps. Bring your entire university experience into one beautiful, unified platform. Experience CampusConnect today.
            </p>
            <div className="cc-cta-button-group">
              <button className="cc-btn-glow" onClick={() => navigate('/login')}>
                Sign In to Portal <span><IconArrow /></span>
              </button>
            </div>
          </div>

          <div className="cc-cta-floating-elements">
            <div className="cc-float-item fi-1">🚀</div>
            <div className="cc-float-item fi-2">💡</div>
            <div className="cc-float-item fi-3">🎓</div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="cc-footer">
        <div className="cc-footer-inner">
          <div className="cc-footer-brand">
            <div className="cc-logo">
              <div className="cc-logo-icon-wrapper small">
                <img src={logo} alt="Minhaj Logo" className="cc-logo-img" />
              </div>
              <div className="cc-logo-x small">X</div>
              <div className="cc-logo-text-col">
                <h1 className="cc-logo-title small">CAMPUS<span>CONNECT</span></h1>
                <span className="cc-logo-subtitle small">UNIVERSITY PORTAL</span>
              </div>
            </div>
            <p>Empowering students with connection, convenience, and smarter campus life.</p>
            <div className="cc-social">
              <a href="#!" aria-label="Facebook"><IconFacebook /></a>
              <a href="#!" aria-label="Instagram"><IconInstagram /></a>
              <a href="#!" aria-label="Twitter"><IconTwitter /></a>
              <a href="#!" aria-label="LinkedIn"><IconLinkedin /></a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="cc-footer-col">
              <h4>{group}</h4>
              <ul>{links.map(l => <li key={l}><a href="#!">{l}</a></li>)}</ul>
            </div>
          ))}

          <div className="cc-footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li>✉ info@mul.edu.pk</li>
              <li>📞 +92 42 35145621</li>
              <li style={{ lineHeight: '1.5' }}>📍 Minhaj University Lahore, <br/> Near Hamdard Chowk, <br/> Township, Lahore, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="cc-footer-bottom">
          <span>© 2025 CampusConnect. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
