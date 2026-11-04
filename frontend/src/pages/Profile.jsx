import React, { useEffect, useState } from 'react';
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

export default function Profile() {
  const { user, updateUser, apiFetch, showToast } = useAuth();
  const [form, setForm] = useState({ name: '', department: '', year: '' });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch(`/api/students/${user?.userId || user?.studentId}`);
        setProfile(data);
        setForm({ name: data.name || '', department: data.department || '', year: data.year || '' });
      } catch (err) {
        showToast('Could not load profile.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    if (user) loadProfile();
  }, [user]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!form.name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const data = await apiFetch(`/api/students/${user?.userId || user?.studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: form.name.trim(), department: form.department, year: form.year })
      });
      updateUser(data.user);
      setProfile(prev => ({ ...prev, name: form.name, department: form.department, year: form.year }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
        Loading profile...
      </main>
    );
  }

  return (
    <main id="studentProfileView" className="container" style={{ padding: '40px 0' }}>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Student Profile</h2>
            <p>View and update your personal information</p>
          </div>

          <form id="profileEditForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="profileNameInput" className="form-label">Full Name</label>
              <input
                type="text"
                id="profileNameInput"
                className="form-control"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileStudentIdDisplay" className="form-label">Student ID (Read-only)</label>
              <input
                type="text"
                id="profileStudentIdDisplay"
                className="form-control"
                disabled
                value={profile?.studentId || ''}
                style={{ backgroundColor: '#f1f5f9' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileEmailDisplay" className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                id="profileEmailDisplay"
                className="form-control"
                disabled
                value={profile?.email || ''}
                style={{ backgroundColor: '#f1f5f9' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileDepartmentSelect" className="form-label">Department</label>
              <select
                id="profileDepartmentSelect"
                className="form-control"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profileYearSelect" className="form-label">Academic Year</label>
              <select
                id="profileYearSelect"
                className="form-control"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
