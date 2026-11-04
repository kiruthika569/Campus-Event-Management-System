import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/student.css';

export default function StudentLogin() {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: 'kiruthika@greenfieldit.edu', password: 'student123' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email address is required.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        showToast(`Login successful! Welcome ${data.user.name}`, 'success');
        // Redirect to original destination or dashboard
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        setTimeout(() => navigate(redirect || '/student/dashboard'), 1000);
      } else {
        showToast(data.message || 'Login failed. Please check your credentials.', 'danger');
      }
    } catch (err) {
      showToast('Server communication error. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Student Login</h2>
            <p>Enter your student account credentials</p>
          </div>

          <div className="demo-credentials-box">
            <strong>Demo Student Credentials:</strong><br />
            Email: <code>kiruthika@greenfieldit.edu</code><br />
            Password: <code>student123</code>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="loginEmail" className="form-label">Email Address</label>
              <input
                type="email"
                id="loginEmail"
                className={`form-control ${errors.email ? 'invalid' : ''}`}
                placeholder="kiruthika@greenfieldit.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <div className="form-error" style={{ display: 'block' }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword" className="form-label">Password</label>
              <input
                type="password"
                id="loginPassword"
                className={`form-control ${errors.password ? 'invalid' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <div className="form-error" style={{ display: 'block' }}>{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/student/register" style={{ fontWeight: 600 }}>Create Student Account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
