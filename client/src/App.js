import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import './App.css';

const Home = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {}
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Welcome to CampusConnect</h1>
      {token && user ? (
        <div style={{ marginTop: '30px', background: '#f8f9fa', padding: '30px', borderRadius: '15px', display: 'inline-block', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minWidth: '300px' }}>
          <h2 style={{ color: '#28a745', margin: '0 0 20px 0', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>Logged In Successfully! 🎉</h2>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize', background: '#17a2b8', color: 'white', padding: '3px 8px', borderRadius: '5px', fontSize: '14px' }}>{user.role.replace('_', ' ')}</span></p>
            
            {user.role === 'student' && (
              <>
                <p><strong>Department:</strong> {user.department}</p>
                <p><strong>Semester:</strong> {user.semester}</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: 'gray', fontSize: '18px', marginTop: '20px' }}>Please <Link to="/login">Login</Link> to continue.</p>
      )}
    </div>
  );
};

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To force re-render on route change
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Hide Navbar on Login page so it can be immersive
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav style={{ padding: '15px 40px', background: '#0D2A42', display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#008C9E', padding: '6px 12px', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>🎓</div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>CampusConnect</Link>
      </div>
      
      {!token ? (
        <Link to="/login" style={{ color: '#0D2A42', background: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>Login to Dashboard</Link>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#008C9E', fontWeight: '600', fontSize: '14px' }}>STUDENT HUB</span>
          <button 
            onClick={handleLogout} 
            style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0D2A42'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
