import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../css/events.css';

export default function Events() {
  const [allEvents, setAllEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setAllEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = allEvents.filter(ev => {
    const catMatch = category === 'All' || ev.category.toLowerCase() === category.toLowerCase();
    const q = query.toLowerCase().trim();
    const searchMatch = !q ||
      ev.title.toLowerCase().includes(q) ||
      (ev.description || '').toLowerCase().includes(q) ||
      (ev.venue || '').toLowerCase().includes(q) ||
      (ev.organizer || '').toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  const categories = ['All', 'Academic', 'Technical', 'Cultural', 'Sports'];

  return (
    <main className="container" style={{ padding: '40px 0' }}>
      <div className="section-title-wrap" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Explore Campus Events</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Search and filter upcoming workshops, bootcamps, tournaments, and cultural fests.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="eventSearchInput"
            className="search-input"
            placeholder="Search events by title, venue, or description..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="category-filter-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'All' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div id="eventsCatalogueGrid" className="events-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>Loading events...</p>
        ) : filtered.length === 0 ? (
          <div className="no-events-found" style={{ gridColumn: '1/-1' }}>
            <h3>No Events Found</h3>
            <p>No campus events match your current filter criteria. Try adjusting your search query.</p>
          </div>
        ) : (
          filtered.map(ev => <EventCard key={ev.id} event={ev} />)
        )}
      </div>
    </main>
  );
}

function EventCard({ event }) {
  const catClass = (event.category || 'technical').toLowerCase();
  const availableSeats = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

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
          <div className="event-meta-item">🏛️ {event.organizer}</div>
        </div>
        <p className="event-description">{event.description}</p>
      </div>
      <div>
        <div className="seat-progress-bar">
          <div className="seat-progress-fill" style={{ width: `${fillPercentage}%` }}></div>
        </div>
        <div className="seat-info">
          <span>Capacity: {event.capacity}</span>
          <span>Available: <strong style={{ color: availableSeats > 0 ? 'var(--success)' : 'var(--danger)' }}>{availableSeats}</strong></span>
        </div>
        <Link to={`/events/${event.id}`} className="btn btn-primary" style={{ width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
}
