import React, { useState, useEffect } from 'react';
import './WelcomeBanner.css';
import logo from '../../assets/MUL-Logo.png';

const IconForum     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconPetitions = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>;
const IconBell      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;

const WelcomeBanner = ({ user, avatar }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when avatar prop changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Helper to extract clean initials from the user's name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;
  const initials = getInitials(user?.name);

  return (
    <div className="db-welcome-section">
      <div className="student-card-container">
        <div className="student-card">
          {/* Top Header Bar */}
          <div className="card-header">
            <span className="header-title">STUDENT CARD</span>
            <span className="header-valid">Valid Upto: Dec 2026</span>
          </div>

          {/* Main Content Section */}
          <div className="card-main">
            <div className="card-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.name || 'Sagheer Ahmad'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reg. #:</span>
                <span className="detail-value">{user?.registration_no || '2022F-mulbscs-104'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Class:</span>
                <span className="detail-value">{user?.class || 'BS'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dept:</span>
                <span className="detail-value">{user?.department || 'Computer Science'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Session:</span>
                <span className="detail-value">{user?.session || '2022-26 Fall'}</span>
              </div>
            </div>

            <div className="card-photo">
              <div className="photo-box">
                {showFallback ? (
                  <div 
                    className="photo-placeholder" 
                    style={{ fontSize: initials.length > 1 ? '36px' : '48px' }}
                  >
                    {initials}
                  </div>
                ) : (
                  <img 
                    src={avatar} 
                    alt="Profile" 
                    onError={() => setImageError(true)} 
                  />
                )}
              </div>
              <div className="card-id-label">ID PHOTO</div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="card-footer">
            <div className="footer-left">
              <div className="signature-area">
                <div className="signature-img">
                  <svg width="80" height="30" viewBox="0 0 100 40">
                    <path d="M10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#001529" strokeWidth="1.5" />
                    <path d="M20 25 L 80 25" fill="none" stroke="#001529" strokeWidth="0.5" strokeDasharray="2,2" />
                  </svg>
                </div>
                <span className="signature-label">Registrar Signature</span>
              </div>
            </div>
            <div className="footer-center">
              <div className="footer-logo-wrap">
                <img src={logo} alt="MUL Logo" className="footer-logo" />
              </div>
              <div className="footer-university">
                <span className="uni-name">Minhaj</span>
                <span className="uni-name">University</span>
                <span className="uni-name">Lahore</span>
              </div>
            </div>
            <div className="footer-right">
              <div className="qr-code">
                <svg viewBox="0 0 100 100" width="45" height="45">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="20" height="20" fill="black" />
                  <rect x="15" y="15" width="10" height="10" fill="white" />
                  <rect x="70" y="10" width="20" height="20" fill="black" />
                  <rect x="75" y="15" width="10" height="10" fill="white" />
                  <rect x="10" y="70" width="20" height="20" fill="black" />
                  <rect x="15" y="75" width="10" height="10" fill="white" />
                  <rect x="40" y="40" width="20" height="20" fill="black" />
                  <rect x="70" y="70" width="10" height="10" fill="black" />
                  <rect x="50" y="70" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Side Panel */}
      <div className="welcome-notif-panel">
        <div className="welcome-notif-header">
          <span className="notif-panel-title">Notifications</span>
        </div>
        <div className="welcome-notif-list">
          {/* Forum */}
          <div className="welcome-notif-item forum" title="Forum Notifications">
            <div className="notif-item-icon">
              <IconForum/>
              <span className="notif-badge">5</span>
            </div>
            <div className="notif-item-text">
              <span className="notif-item-label">Forums</span>
              <span className="notif-item-sub">New replies in your threads</span>
            </div>
          </div>

          {/* Petitions */}
          <div className="welcome-notif-item petitions" title="Petition Notifications">
            <div className="notif-item-icon">
              <IconPetitions/>
              <span className="notif-badge">2</span>
            </div>
            <div className="notif-item-text">
              <span className="notif-item-label">Petitions</span>
              <span className="notif-item-sub">2 petitions need your vote</span>
            </div>
          </div>

          {/* Updates */}
          <div className="welcome-notif-item updates" title="General Updates">
            <div className="notif-item-icon">
              <IconBell/>
              <span className="notif-badge">12</span>
            </div>
            <div className="notif-item-text">
              <span className="notif-item-label">Updates</span>
              <span className="notif-item-sub">University announcements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
