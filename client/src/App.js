import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Forum from './pages/Forum/Forum';
import Canteen from './pages/Canteen/Canteen';
import Petitions from './pages/Petitions/Petitions';
import ModerationRoom from './pages/Moderation/ModerationRoom';
import LostFound from './pages/LostFound/LostFound';
import VendorLogin from './pages/Canteen/VendorLogin';
import VendorDashboard from './pages/Canteen/VendorDashboard';
import VendorRegister from './pages/Canteen/VendorRegister';
import MyProfile from './pages/Profile/MyProfile';
import PublicProfile from './pages/Profile/PublicProfile';
import UsersManager from './pages/Admin/UsersManager';
import RestaurantsManager from './pages/Admin/RestaurantsManager';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/user/:id" element={<PublicProfile />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/canteen" element={<Canteen />} />
          <Route path="/petitions" element={<Petitions />} />
          <Route path="/moderation" element={<ModerationRoom />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/users" element={<UsersManager />} />
          <Route path="/admin/restaurants" element={<RestaurantsManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
