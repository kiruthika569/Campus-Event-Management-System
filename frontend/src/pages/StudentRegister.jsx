import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/student.css';

const DEPARTMENTS = [
  { value: 'Computer Science', label: 'Computer Science & Engineering' },
  { value: 'Electrical Engineering', label: 'Electrical & Electronics Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Information Technology', label: 'Information Technology' }
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function StudentRegister() {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', studentId: '', department: '', year: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full Name is required.';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required.';
    if (!form.email) {
      e.email = 'Valid college email is required.';
    } else if (!form.email.toLowerCase().endsWith('@greenfieldit.edu')) {
      e.email = 'Only @greenfieldit.edu email addresses are accepted.';
    }
    if (!form.department) e.department = 'Please select a department.';
    if (!form.year) e.year = 'Please select academic year.';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          studentId: form.studentId.trim(),
          email: form.email.trim().toLowerCase(),
          department: form.department,
          year: form.year,
          password: form.password
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => navigate('/student/login'), 1500);
      } else {
        showToast(data.message || 'Registration failed.', 'danger');
      }
    } catch (err) {
      showToast('Server connection error. Please try again later.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    className: `form-control ${errors[key] ? 'invalid' : ''}`
  });

  return (
    <main className="container">
      <div className="auth-wrapper" style={{ maxWidth: '560px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Student Account</h2>
            <p>Register to explore and participate in campus activities</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="regName" className="form-label">Full Name</label>
              <input type="text" id="regName" {...field('name')} placeholder="e.g. Alex Morgan" />
              {errors.name && <div className="form-error" style={{ display: 'block' }}>{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regStudentId" className="form-label">Student ID</label>
              <input type="text" id="regStudentId" {...field('studentId')} placeholder="e.g. GIT2026010" />
              {errors.studentId && <div className="form-error" style={{ display: 'block' }}>{errors.studentId}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regDepartment" className="form-label">Department</label>
              <select id="regDepartment" {...field('department')}>
                <option value="">-- Select Department --</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              {errors.department && <div className="form-error" style={{ display: 'block' }}>{errors.department}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regYear" className="form-label">Year</label>
              <select id="regYear" {...field('year')}>
                <option value="">-- Select Year --</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <div className="form-error" style={{ display: 'block' }}>{errors.year}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regEmail" className="form-label">Email</label>
              <input type="email" id="regEmail" {...field('email')} placeholder="student@greenfieldit.edu" />
              {errors.email && <div className="form-error" style={{ display: 'block' }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regPassword" className="form-label">Password</label>
              <input type="password" id="regPassword" {...field('password')} placeholder="Minimum 6 characters" />
              {errors.password && <div className="form-error" style={{ display: 'block' }}>{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="regConfirmPassword" className="form-label">Confirm Password</label>
              <input type="password" id="regConfirmPassword" {...field('confirmPassword')} placeholder="Re-enter password" />
              {errors.confirmPassword && <div className="form-error" style={{ display: 'block' }}>{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--muted)' }}>
            Already registered?{' '}
            <Link to="/student/login" style={{ fontWeight: 600 }}>Login here</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
