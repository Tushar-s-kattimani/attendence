import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Users, CalendarCheck, IndianRupee, Loader2 } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Employees from './pages/Employees';
import SalaryReport from './pages/SalaryReport';
import Login from './pages/Login';
import './index.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CalendarCheck />
        <span>Attendance</span>
      </NavLink>
      <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users />
        <span>Employees</span>
      </NavLink>
      <NavLink to="/salary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <IndianRupee />
        <span>Salary</span>
      </NavLink>
    </nav>
  );
};

const App = () => {
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const { loading } = useAppContext();

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-primary)' }}>
        <Loader2 className="animate-spin" size={48} style={{ animation: 'spin 0.4s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontWeight: '500' }}>Loading your data...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAppUnlocked) {
    return <Login onUnlock={() => setIsAppUnlocked(true)} />;
  }

  return (
    <Router>
      <div className="app-container with-sidebar">
        <div className="page-header">
          <h1>Gajanan Enterprises</h1>
          <p>Employee Management</p>
        </div>
        
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/salary" element={<SalaryReport />} />
          </Routes>
        </div>

        <BottomNav />
      </div>
    </Router>
  );
};

export default App;
