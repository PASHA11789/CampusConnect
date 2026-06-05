import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Forum from './pages/Forum/Forum';
import Canteen from './pages/Canteen/Canteen';
import Petitions from './pages/Petitions/Petitions';

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
          <Route path="/petitions" element={<Petitions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
