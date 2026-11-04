import React from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css';

export default function RoleSelection() {
  return (
    <>
      <main className="role-selection-wrapper">
        <div className="role-header">
          <h1>Welcome to the Campus Event Portal</h1>
          <p>Select your role to continue.</p>
        </div>

        <div className="role-cards-grid">
          {/* Student Card */}
          <div className="role-card">
            <div>
              <div className="role-icon-box">🎓</div>
              <h2>STUDENT</h2>
              <p>Access events and manage your registrations.</p>
            </div>
            <div>
              <Link to="/student/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Student Login
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="role-card">
            <div>
              <div className="role-icon-box">🛡️</div>
              <h2>ADMIN</h2>
              <p>Manage campus events and registrations.</p>
            </div>
            <div>
              <Link to="/admin/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
