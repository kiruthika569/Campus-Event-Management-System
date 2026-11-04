const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { requireAdmin } = require('../middleware/auth');

// Helper to generate dynamic Event ID (E001, E002...)
async function generateEventCustomId() {
  const events = await Event.find({}, 'id').lean();
  const max = events.reduce((acc, e) => {
    const num = parseInt((e.id || '').replace(/\D/g, ''), 10);
    return !isNaN(num) && num > acc ? num : acc;
  }, 0);
  return 'E' + String(max + 1).padStart(3, '0');
}

// Read All Events: GET /api/events
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { venue: { $regex: q, $options: 'i' } },
        { organizer: { $regex: q, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter).sort({ date: 1 });
    return res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error);
    return res.status(500).json({ message: "Server error retrieving events." });
  }
});

// Read Single Event: GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json(event);
  } catch (error) {
    console.error("Fetch event details error:", error);
    return res.status(500).json({ message: "Server error retrieving event details." });
  }
});

// Create Event: POST /api/events (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, category, description, date, time, venue, organizer, capacity, deadline, status } = req.body;

    if (!title || !category || !date || !time || !venue || !capacity || !deadline) {
      return res.status(400).json({ message: "Please fill in all required event details." });
    }

    const cap = parseInt(capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      return res.status(400).json({ message: "Event capacity must be a positive integer." });
    }

    const nextId = await generateEventCustomId();

    const newEvent = new Event({
      id: nextId,
      title: title.trim(),
      category,
      description: description ? description.trim() : "No detailed description provided.",
      date,
      time: time.trim(),
      venue: venue.trim(),
      organizer: organizer ? organizer.trim() : "Greenfield Institute of Technology",
      capacity: cap,
      registeredCount: 0,
      deadline,
      status: status || "Upcoming"
    });

    await newEvent.save();
    return res.status(201).json({ message: "Event created successfully.", event: newEvent });
  } catch (error) {
    console.error("Create event error:", error);
    return res.status(500).json({ message: "Server error creating event.", error: error.message });
  }
});

// Update Event: PUT /api/events/:id (Admin Only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const { title, category, description, date, time, venue, organizer, capacity, deadline, status } = req.body;

    if (!title || !category || !date || !time || !venue || !capacity || !deadline) {
      return res.status(400).json({ message: "Please fill in all required event details." });
    }

    const cap = parseInt(capacity, 10);
    if (isNaN(cap) || cap < event.registeredCount) {
      return res.status(400).json({
        message: `Capacity cannot be lower than current registered students count (${event.registeredCount}).`
      });
    }

    event.title = title.trim();
    event.category = category;
    if (description !== undefined) event.description = description.trim();
    event.date = date;
    event.time = time.trim();
    event.venue = venue.trim();
    if (organizer !== undefined) event.organizer = organizer.trim();
    event.capacity = cap;
    event.deadline = deadline;
    if (status) event.status = status;

    await event.save();

    // Sync event details across active registrations
    await Registration.updateMany(
      { eventId: event.id },
      {
        $set: {
          eventTitle: event.title,
          eventCategory: event.category,
          eventDate: event.date,
          eventVenue: event.venue
        }
      }
    );

    return res.json({ message: "Event updated successfully.", event });
  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({ message: "Server error updating event.", error: error.message });
  }
});

// Delete Event: DELETE /api/events/:id (Admin Only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Mark associated registrations as Cancelled
    await Registration.updateMany(
      { eventId: req.params.id },
      { $set: { status: "Cancelled" } }
    );

    return res.json({ message: "Event deleted successfully.", event });
  } catch (error) {
    console.error("Delete event error:", error);
    return res.status(500).json({ message: "Server error deleting event.", error: error.message });
  }
});

module.exports = router;
