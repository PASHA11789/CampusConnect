import React, { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Forum from './pages/Forum/Forum';
import Canteen from './pages/Canteen/Canteen';
import Petitions from './pages/Petitions/Petitions';
import ModerationRoom from './pages/Moderation/ModerationRoom';
import LostFound from './pages/LostFound/LostFound';
import Career from './pages/Career/Career';
import PartnerLogin from './pages/Canteen/PartnerLogin';
import PartnerRegister from './pages/Canteen/PartnerRegister';
import VendorDashboard from './pages/Canteen/VendorDashboard';
import RiderMarketplace from './pages/Canteen/RiderMarketplace';
import BusRoutes from './pages/BusRoutes/BusRoutes';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import UsersManager from './pages/Admin/UsersManager';
import RestaurantsManager from './pages/Admin/RestaurantsManager';
import MULClone from './pages/MUL-clone';
import MULDashboard from './pages/MUL-clone/MULDashboard';
import DisciplinaryWarningModal from './components/common/DisciplinaryWarningModal';
import { setupPushNotifications } from './utils/pushNotificationSetup';


function App() {
  // Set up Web Push Notifications once the app loads, if the user is logged in.
  // Safe to call on every render cycle — setupPushNotifications() bails out early
  // if the service worker is already registered and a subscription already exists.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setupPushNotifications();
    }
  }, []);

  return (
    <Router>
      <DisciplinaryWarningModal />
      <div className="App w-full h-screen max-w-full overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/forum" element={<Forum />} />
          <Route path="/canteen" element={<Canteen />} />
          {/* Rider Routes */}
          <Route path="/rider/login" element={<PartnerLogin />} />
          <Route path="/rider/dashboard" element={<RiderMarketplace />} />
          <Route path="/rider" element={<RiderMarketplace />} />
          <Route path="/petitions" element={<Petitions />} />
          <Route path="/moderation" element={<ModerationRoom />} />
          <Route path="/bus-routes" element={<BusRoutes />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/career" element={<Career />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/vendor/login" element={<PartnerLogin />} />
          <Route path="/vendor/register" element={<PartnerRegister />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />

          {/* Alias support for common URL typos like /vender/* */}
          <Route path="/vender/login" element={<PartnerLogin />} />
          <Route path="/vender/register" element={<PartnerRegister />} />
          <Route path="/vender/dashboard" element={<VendorDashboard />} />
          <Route path="/vender" element={<Navigate to="/vendor/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/users" element={<UsersManager />} />
          <Route path="/admin/restaurants" element={<RestaurantsManager />} />

          {/* MUL Login Clone Standalone Route */}
          <Route path="/mul-clone" element={<Navigate to="/mul-login" replace />} />
          <Route path="/mul-login" element={<MULClone />} />
          <Route path="/mul-dashboard" element={<MULDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
