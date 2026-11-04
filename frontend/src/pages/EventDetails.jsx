import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/events.css';

export default function EventDetails() {
  const { id } = useParams();
  const { user, apiFetch, showToast } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [userRegStatus, setUserRegStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        showToast('Event not found.', 'danger');
        navigate('/events');
        return;
      }
      const ev = await res.json();
      setEvent(ev);

      // Check if student is already registered
      if (user?.role === 'student') {
        try {
          const regs = await apiFetch(`/api/registrations/student/${user.studentId || user.userId}`);
          const existing = regs.find(r => r.eventId === ev.id && r.status !== 'Cancelled');
          if (existing) setUserRegStatus(existing.status);
        } catch (e) {
          // User may not be logged in or has no registrations
        }
      }
    } catch (err) {
      showToast('Error loading event details.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user || user.role !== 'student') {
      showToast('Please login as a student to register for this event.', 'warning');
      navigate(`/student/login?redirect=/events/${id}`);
      return;
    }

    setRegistering(true);
    try {
      const data = await apiFetch('/api/registrations', {
        method: 'POST',
        body: JSON.stringify({ eventId: event.id })
      });
      showToast(`🎉 ${data.message}`, 'success');
      setUserRegStatus('Registered');
      await loadEvent(); // Refresh event data to update seats
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'danger');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
        <p>Loading event information...</p>
      </main>
    );
  }

  if (!event) return null;

  const today = new Date().toISOString().split('T')[0];
  const availableSeats = Math.max(0, event.capacity - event.registeredCount);
  const isFull = availableSeats <= 0;
  const isDeadlinePassed = event.deadline < today;
  const isEventPast = event.date < today;
  const catClass = (event.category || 'technical').toLowerCase();

  const renderActionBox = () => {
    if (!user) {
      return (
        <>
          <div className="alert alert-warning">🔒 Please login as a student to register for this event.</div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(`/student/login?redirect=/events/${id}`)}>
            Login to Register
          </button>
        </>
      );
    }
    if (user.role !== 'student') {
      return <div className="alert alert-info">Logged in as Admin. Admins cannot register for events.</div>;
    }
    if (userRegStatus) {
      return (
        <div className="alert alert-success">
          ✅ You are already registered for this event (Status: <strong>{userRegStatus}</strong>).
        </div>
      );
    }
    if (isEventPast) {
      return <div className="alert alert-danger">This event has already occurred. Registration is closed.</div>;
    }
    if (isDeadlinePassed) {
      return <div className="alert alert-danger">Registration deadline ({event.deadline}) has passed for this event.</div>;
    }
    if (isFull) {
      return <div className="alert alert-danger">This event is fully booked ({event.capacity}/{event.capacity} seats filled).</div>;
    }
    return (
      <button
        id="confirmRegisterBtn"
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? 'Registering...' : 'Register for Event'}
      </button>
    );
  };

  return (
    <main className="container" style={{ padding: '30px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/events" className="btn btn-outline btn-sm">&larr; Back to Events Catalog</Link>
      </div>

      <div id="eventDetailsView">
        <div className="event-details-wrapper">
          <div className="event-details-header">
            <div>
              <span className={`badge badge-${catClass}`} style={{ marginBottom: '8px' }}>{event.category}</span>
              <h1 className="event-details-title">{event.title}</h1>
              <p style={{ color: 'var(--muted)' }}>Organized by <strong>{event.organizer}</strong></p>
            </div>
            <span className={`badge badge-${event.status === 'Upcoming' ? 'confirmed' : 'full'}`}
              style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {event.status}
            </span>
          </div>

          <div className="details-grid">
            <div>
              <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>About This Event</h3>
              <p style={{ color: 'var(--muted)', lineHeight: '1.8', marginBottom: '24px', fontSize: '1.05rem' }}>
                {event.description}
              </p>

              <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>Registration Guidelines</h3>
              <ul style={{ color: 'var(--muted)', lineHeight: '1.7', paddingLeft: '20px', listStyleType: 'disc', marginBottom: '30px' }}>
                <li>Registration requires a valid Greenfield Institute student login.</li>
                <li>Each student can register only once for a given event.</li>
                <li>Registrations are accepted on a first-come, first-served basis until capacity is reached.</li>
                <li>Registration deadline: <strong>{event.deadline}</strong>.</li>
              </ul>

              <div id="registrationActionBox">{renderActionBox()}</div>
            </div>

            <div>
              <div className="details-info-box">
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>Event Information</h3>
                {[
                  ['Date', event.date],
                  ['Time', event.time],
                  ['Venue', event.venue],
                  ['Total Capacity', `${event.capacity} Seats`],
                  ['Registered', `${event.registeredCount} Students`],
                  ['Available Seats', availableSeats],
                  ['Reg. Deadline', event.deadline]
                ].map(([label, value]) => (
                  <div className="details-info-item" key={label}>
                    <span className="details-info-label">{label}</span>
                    <span className="details-info-value"
                      style={label === 'Available Seats' ? { color: availableSeats > 0 ? 'var(--success)' : 'var(--danger)' } : {}}>
                      {label === 'Available Seats' ? `${value} Seats` : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
