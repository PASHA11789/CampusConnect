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
import Career from './pages/Career/Career';
import VendorLogin from './pages/Canteen/VendorLogin';
import VendorDashboard from './pages/Canteen/VendorDashboard';
import VendorRegister from './pages/Canteen/VendorRegister';
import RiderLogin from './pages/Canteen/RiderLogin';
import RiderRegister from './pages/Canteen/RiderRegister';
import RiderMarketplace from './pages/Canteen/RiderMarketplace';
import BusRoutes from './pages/BusRoutes/BusRoutes';
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

          <Route path="/forum" element={<Forum />} />
          <Route path="/canteen" element={<Canteen />} />
          {/* Rider Routes & Spelling Aliases */}
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider/register" element={<RiderRegister />} />
          <Route path="/rider/rigerster" element={<RiderRegister />} />
          <Route path="/rider/registar" element={<RiderRegister />} />
          <Route path="/rider/regestir" element={<RiderRegister />} />
          <Route path="/rider/dashboard" element={<RiderMarketplace />} />
          <Route path="/rider" element={<RiderMarketplace />} />
          <Route path="/petitions" element={<Petitions />} />
          <Route path="/moderation" element={<ModerationRoom />} />
          <Route path="/bus-routes" element={<BusRoutes />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/career" element={<Career />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />

          {/* Alias support for common URL typos like /vender/* */}
          <Route path="/vender/login" element={<VendorLogin />} />
          <Route path="/vender/register" element={<VendorRegister />} />
          <Route path="/vender/dashboard" element={<VendorDashboard />} />
          <Route path="/vender" element={<Navigate to="/vendor/dashboard" replace />} />

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
