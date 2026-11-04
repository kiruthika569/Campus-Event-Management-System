import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/student.css';

export default function MyRegistrations() {
  const { user, apiFetch, showToast } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const id = user?.studentId || user?.userId;
      const data = await apiFetch(`/api/registrations/student/${id}`);
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error retrieving your event registrations.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async (regId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) return;
    try {
      await apiFetch(`/api/registrations/${regId}`, { method: 'DELETE' });
      showToast('Registration cancelled successfully.', 'info');
      loadRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration.', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Confirmed' || status === 'Approved') return 'badge-confirmed';
    if (status === 'Cancelled' || status === 'Rejected') return 'badge-cancelled';
    return 'badge-registered';
  };

  return (
    <main id="myRegistrationsView" className="container" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 700 }}>My Event Registrations</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Track your enrolled campus activities and registration statuses.</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Event Info</th>
                <th>Category</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="myRegistrationsTbody">
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading your registrations...</td></tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>You currently have no event registrations.</p>
                    <a href="/events" className="btn btn-primary btn-sm">Explore Upcoming Events</a>
                  </td>
                </tr>
              ) : (
                registrations.map(reg => {
                  const isCancelled = reg.status === 'Cancelled';
                  return (
                    <tr key={reg.id}>
                      <td><strong>{reg.id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{reg.eventTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>📅 {reg.eventDate} | 📍 {reg.eventVenue}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${(reg.eventCategory || 'technical').toLowerCase()}`}>
                          {reg.eventCategory || 'Event'}
                        </span>
                      </td>
                      <td>{reg.registrationDate}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(reg.status)}`}>{reg.status}</span>
                      </td>
                      <td>
                        {!isCancelled ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancel(reg.id, reg.eventTitle)}
                          >
                            Cancel Registration
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
