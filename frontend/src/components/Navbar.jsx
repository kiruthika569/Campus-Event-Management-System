import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/role-selection');
  };

  const getPortalSubtitle = () => {
    if (user?.role === 'admin') return 'Admin Panel';
    if (user?.role === 'student') return 'Student Portal';
    return 'Campus Event Registration Portal';
  };

  const getPortalTitle = () => {
    if (user?.role === 'admin') return 'GREENFIELD CAMPUS EVENTS';
    if (user?.role === 'student') return 'GREENFIELD CAMPUS EVENTS';
    return 'GREENFIELD INSTITUTE OF TECHNOLOGY';
  };

  // On the welcome landing page (/) and role selection (/role-selection),
  // when not logged in, the original HTML had only the brand header without nav links.
  const isMinimalHeader = !user && (location.pathname === '/' || location.pathname === '/role-selection');

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="nav-brand">
            <div className="nav-logo-icon">GIT</div>
            <div className="nav-brand-text">
              <h1>{getPortalTitle()}</h1>
              <p>{getPortalSubtitle()}</p>
            </div>
          </div>
        </Link>

        {/* Mobile toggle only if there are menu items */}
        {!isMinimalHeader && (
          <button
            className="nav-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        )}

        {!isMinimalHeader && (
          <nav>
            <ul className={`nav-menu ${mobileMenuOpen ? 'show' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              {/* Student Navigation */}
              {user?.role === 'student' && (
                <>
                  <li>
                    <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Events
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/student/my-registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      My Registrations
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/student/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <a href="#logout" onClick={handleLogout} className="nav-link nav-btn-logout">
                      Logout
                    </a>
                  </li>
                </>
              )}

              {/* Admin Navigation */}
              {user?.role === 'admin' && (
                <>
                  <li>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/manage-events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Manage Events
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/manage-registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Manage Registrations
                    </NavLink>
                  </li>
                  <li>
                    <a href="#logout" onClick={handleLogout} className="nav-link nav-btn-logout">
                      Logout
                    </a>
                  </li>
                </>
              )}

              {/* Guest Navigation on other pages */}
              {!user && (
                <>
                  <li>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Events
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/role-selection" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Select Role
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
