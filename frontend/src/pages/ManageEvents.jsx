import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/admin.css';

const EMPTY_FORM = {
  title: '', category: 'Technical', description: '', date: '', time: '', venue: '', organizer: '', capacity: '', deadline: '', status: 'Upcoming'
};

const CATEGORIES = ['Academic', 'Technical', 'Cultural', 'Sports'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

function EventModal({ id, title, form, setForm, onClose, onSubmit, saving }) {
  return (
    <div id={id} className="modal-overlay active">
      <div className="modal-card">
        <div className="modal-header">
          <h3 style={{ color: 'var(--primary-dark)' }}>{title}</h3>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Event Name</label>
            <input type="text" className="form-control" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI Innovation Workshop" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input type="number" className="form-control" value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" placeholder="e.g. 100" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Provide event summary..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input type="date" className="form-control" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Event Time</label>
              <input type="text" className="form-control" value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM - 04:00 PM" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue</label>
            <input type="text" className="form-control" value={form.venue}
              onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Main Auditorium, GIT Campus" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Organizer</label>
              <input type="text" className="form-control" value={form.organizer}
                onChange={e => setForm({ ...form, organizer: e.target.value })} placeholder="e.g. Computer Science Dept" />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Deadline</label>
              <input type="date" className="form-control" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} required />
            </div>
          </div>

          {id === 'editEventModal' && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (id === 'addEventModal' ? 'Add Event' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageEvents() {
  const { apiFetch, showToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/events');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error fetching events.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async (evt) => {
    evt.preventDefault();
    if (!addForm.title || !addForm.category || !addForm.date || !addForm.time || !addForm.venue || !addForm.capacity || !addForm.deadline) {
      showToast('Please fill in all required event fields.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/api/events', { method: 'POST', body: JSON.stringify(addForm) });
      showToast('Event created successfully!', 'success');
      setShowAdd(false);
      setAddForm({ ...EMPTY_FORM });
      await fetchEvents();
    } catch (err) {
      showToast(err.message || 'Failed to create event.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (event) => {
    setEditId(event.id);
    setEditForm({
      title: event.title, category: event.category, description: event.description,
      date: event.date, time: event.time, venue: event.venue, organizer: event.organizer,
      capacity: event.capacity, deadline: event.deadline, status: event.status
    });
    setShowEdit(true);
  };

  const handleEdit = async (evt) => {
    evt.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/api/events/${editId}`, { method: 'PUT', body: JSON.stringify(editForm) });
      showToast('Event updated successfully!', 'success');
      setShowEdit(false);
      await fetchEvents();
    } catch (err) {
      showToast(err.message || 'Failed to update event.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete the event "${title}"?\nThis action cannot be undone.`)) return;
    try {
      await apiFetch(`/api/events/${eventId}`, { method: 'DELETE' });
      showToast('Event deleted successfully.', 'info');
      await fetchEvents();
    } catch (err) {
      showToast(err.message || 'Failed to delete event.', 'danger');
    }
  };

  return (
    <main id="manageEventsView" className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 700 }}>Manage Events</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Create, view, update, and delete campus events.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">➕ Add Event</button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Capacity</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adminEventsTbody">
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading events database...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center' }}>No events found. Click 'Add Event' to create one.</td></tr>
              ) : events.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.id}</strong></td>
                  <td><strong>{e.title}</strong></td>
                  <td><span className={`badge badge-${(e.category || 'technical').toLowerCase()}`}>{e.category}</span></td>
                  <td>{e.date}</td>
                  <td>{e.venue}</td>
                  <td>{e.capacity}</td>
                  <td>{e.registeredCount}</td>
                  <td><span className={`badge badge-${e.status === 'Upcoming' ? 'confirmed' : 'full'}`}>{e.status}</span></td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => openEdit(e)} className="btn btn-sm btn-outline">Edit</button>
                      <button onClick={() => handleDelete(e.id, e.title)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <EventModal
          id="addEventModal"
          title="Add Event"
          form={addForm}
          setForm={setAddForm}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
          saving={saving}
        />
      )}

      {showEdit && (
        <EventModal
          id="editEventModal"
          title="Edit Event"
          form={editForm}
          setForm={setEditForm}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
          saving={saving}
        />
      )}
    </main>
  );
}
