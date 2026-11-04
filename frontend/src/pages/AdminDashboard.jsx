import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/admin.css';

export default function AdminDashboard() {
  const { apiFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetch('/api/admin/statistics');
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = stats ? [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: '📅' },
    { label: 'Total Registrations', value: stats.totalRegistrations || 0, icon: '📋' },
    { label: 'Upcoming Events', value: stats.upcomingEvents || 0, icon: '⏳' },
    { label: 'Total Students', value: stats.totalStudents || 0, icon: '🎓' }
  ] : [];

  const getCatBadge = (cat) => (cat || 'technical').toLowerCase();
  const getStatusBadge = (status) => {
    if (status === 'Confirmed' || status === 'Approved') return 'badge-confirmed';
    if (status === 'Cancelled' || status === 'Rejected') return 'badge-cancelled';
    return 'badge-registered';
  };

  return (
    <main id="adminDashboardView" className="container" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>System statistics and recent activity overview.</p>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading statistics...</p>
      ) : (
        <>
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {statCards.map(card => (
              <div className="admin-stat-card" key={card.label}>
                <div>
                  <div className="admin-stat-label">{card.label}</div>
                  <div className="admin-stat-number">{card.value}</div>
                </div>
                <div className="admin-stat-icon-wrap">{card.icon}</div>
              </div>
            ))}
          </div>

          {/* Overview Tables */}
          <div className="admin-overview-grid">
            {/* Recent Events */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Recent Events</h3>
                <Link to="/admin/manage-events" className="btn btn-sm btn-outline">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody id="adminRecentEventsTbody">
                    {stats?.recentEvents?.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No events created yet.</td></tr>
                    ) : stats?.recentEvents?.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.id}</strong></td>
                        <td>{e.title}</td>
                        <td><span className={`badge badge-${getCatBadge(e.category)}`}>{e.category}</span></td>
                        <td>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Registrations */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Recent Registrations</h3>
                <Link to="/admin/manage-registrations" className="btn btn-sm btn-outline">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Event</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="adminRecentRegsTbody">
                    {stats?.recentRegistrations?.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No registrations yet.</td></tr>
                    ) : stats?.recentRegistrations?.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.id}</strong></td>
                        <td>{r.studentName}</td>
                        <td>{r.eventTitle}</td>
                        <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
