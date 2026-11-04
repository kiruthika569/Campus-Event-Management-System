import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/student.css';
import '../css/events.css';

function EventCard({ event }) {
  const catClass = (event.category || 'technical').toLowerCase();
  const availableSeats = Math.max(0, event.capacity - event.registeredCount);

  return (
    <div className="event-card card-hover">
      <div>
        <div className="event-card-header">
          <span className={`badge badge-${catClass}`}>{event.category}</span>
          <span className={`badge badge-${event.status === 'Upcoming' ? 'confirmed' : 'full'}`}>{event.status}</span>
        </div>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-meta">
          <div className="event-meta-item">📅 {event.date} | 🕒 {event.time}</div>
          <div className="event-meta-item">📍 {event.venue}</div>
        </div>
        <p className="event-description">{event.description}</p>
      </div>
      <div>
        <Link to={`/events/${event.id}`} className="btn btn-primary" style={{ width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, apiFetch } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsData = await apiFetch('/api/events');
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const upcoming = events.filter(e => e.status !== 'Cancelled').slice(0, 3);

  return (
    <main id="studentDashboardView" className="container" style={{ padding: '40px 0' }}>
      {/* Profile Summary */}
      <div className="student-profile-summary">
        <div>
          <h2>Welcome, {user?.name}</h2>
          <div className="student-meta-tags">
            <span className="student-meta-item">Student ID: <strong>{user?.studentId || user?.userId || '--'}</strong></span>
            <span className="student-meta-item">Department: <strong>{user?.department || '--'}</strong></span>
            <span className="student-meta-item">Year: <strong>{user?.year || '--'}</strong></span>
            <span className="student-meta-item">Email: <strong>{user?.email || '--'}</strong></span>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Upcoming Events</h2>
          <Link to="/events" className="btn btn-sm btn-outline">Browse All Events</Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading upcoming events...</p>
        ) : upcoming.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted)' }}>No upcoming events at this moment.</p>
        ) : (
          <div id="dashboardUpcomingEventsGrid" className="events-grid">
            {upcoming.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>
    </main>
  );
}
