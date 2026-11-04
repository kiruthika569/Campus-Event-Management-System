import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/student.css';

export default function AdminLogin() {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@greenfieldit.edu', password: 'admin' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!form.email || !form.password) {
      showToast('Email and Password are required.', 'warning');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        showToast('Admin authentication successful!', 'success');
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      } else {
        showToast(data.message || 'Invalid admin credentials.', 'danger');
      }
    } catch (err) {
      showToast('Server connection error.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Admin Login</h2>
            <p>Login to administrative management panel</p>
          </div>

          <div className="demo-credentials-box" style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: 'var(--text)' }}>
            <strong>Demo Admin Credentials:</strong><br />
            Email: <code>admin@greenfieldit.edu</code><br />
            Password: <code>admin</code>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="adminEmail" className="form-label">Admin Email</label>
              <input
                type="email"
                id="adminEmail"
                className="form-control"
                placeholder="admin@greenfieldit.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword" className="form-label">Password</label>
              <input
                type="password"
                id="adminPassword"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Admin Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
