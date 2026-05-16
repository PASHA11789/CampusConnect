import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Layout Components
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

// Dashboard Widgets
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import CanteenWidget from '../../components/dashboard/CanteenWidget';
import { ForumsWidget, PetitionsWidget, LostFoundWidget, BusRoutesWidget } from '../../components/dashboard/DashboardWidgets';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Auth guard
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch(e) {}
    }
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) setAvatar(savedAvatar);

    // Greeting
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');

    // Clock
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem('userAvatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <div className="db-root">
      <Sidebar />

      <main className="db-main">
        <Topbar 
          time={time} 
          user={user} 
          avatar={avatar} 
          handleAvatarChange={handleAvatarChange} 
        />

        <div className="db-content">
          <WelcomeBanner user={user} avatar={avatar} />
          <CanteenWidget />
          
          <div className="db-main-grid">
            <div className="db-left-col">
              <ForumsWidget />
            </div>
            
            <div className="db-right-col">
              <PetitionsWidget />
              <div className="utility-container">
                <LostFoundWidget />
                <BusRoutesWidget />
              </div>
            </div>
          </div>

          <footer className="db-footer">
            <p>© 2026 CampusConnect. Idea by <span>Mr. Sagheer Ahmad</span> & <span>Mr. Shujaat Ali Hashim</span></p>
          </footer>
        </div>
      </main>
    </div>
  );
}
