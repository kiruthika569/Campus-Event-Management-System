import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/admin.css';

const STATUSES = ['All', 'Registered', 'Approved', 'Rejected', 'Confirmed', 'Cancelled'];

export default function ManageRegistrations() {
  const { apiFetch, showToast } = useAuth();
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/registrations');
      setAllRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error fetching registrations.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const updateStatus = async (regId, newStatus) => {
    try {
      await apiFetch(`/api/registrations/${regId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Registration ${regId} status changed to ${newStatus}.`, 'success');
      await fetchRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to update registration status.', 'danger');
    }
  };

  const filtered = allRegistrations.filter(r => {
    const statusMatch = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const q = search.toLowerCase().trim();
    const searchMatch = !q ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.studentId || '').toLowerCase().includes(q) ||
      (r.studentEmail || '').toLowerCase().includes(q) ||
      (r.eventTitle || '').toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    if (status === 'Confirmed' || status === 'Approved') return 'badge-confirmed';
    if (status === 'Cancelled' || status === 'Rejected') return 'badge-cancelled';
    return 'badge-registered';
  };

  return (
    <main id="manageRegistrationsView" className="container" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Manage Registrations</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Review student event registrations and update status.</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              id="regSearchInput"
              className="form-control"
              placeholder="Search by student name, ID, email, or event title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="regStatusFilterSelect" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>Status Filter:</label>
            <select
              id="regStatusFilterSelect"
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Student Details</th>
                <th>Event Title</th>
                <th>Event Date</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adminRegistrationsTbody">
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading registrations roster...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No registration records found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td>
                    <div><strong>{r.studentName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.studentId} | {r.studentEmail}</div>
                  </td>
                  <td>{r.eventTitle}</td>
                  <td>{r.eventDate}</td>
                  <td>{r.registrationDate}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="btn-group">
                      {r.status !== 'Approved' && (
                        <button onClick={() => updateStatus(r.id, 'Approved')} className="btn btn-sm btn-primary">Approve</button>
                      )}
                      {r.status !== 'Rejected' && (
                        <button onClick={() => updateStatus(r.id, 'Rejected')} className="btn btn-sm btn-outline">Reject</button>
                      )}
                      {r.status !== 'Cancelled' && (
                        <button onClick={() => updateStatus(r.id, 'Cancelled')} className="btn btn-sm btn-danger">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
