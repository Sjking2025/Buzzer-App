import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeamBuzzer from './pages/TeamBuzzer';
import HostDashboard from './pages/HostDashboard';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buzzer" element={<TeamBuzzer />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
