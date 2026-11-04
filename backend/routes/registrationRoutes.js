const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { verifyToken, requireAdmin, requireStudent } = require('../middleware/auth');

// Helper to generate dynamic Registration ID (R001, R002...)
async function generateRegistrationCustomId() {
  const regs = await Registration.find({}, 'id').lean();
  const max = regs.reduce((acc, r) => {
    const num = parseInt((r.id || '').replace(/\D/g, ''), 10);
    return !isNaN(num) && num > acc ? num : acc;
  }, 0);
  return 'R' + String(max + 1).padStart(3, '0');
}

// Read All Registrations (Admin Only): GET /api/registrations
router.get('/', requireAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    return res.json(registrations);
  } catch (error) {
    console.error("Fetch registrations error:", error);
    return res.status(500).json({ message: "Server error retrieving registrations." });
  }
});

// Read Registrations by Student: GET /api/registrations/student/:studentId
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const studentIdentifier = req.params.studentId;

    // Access control: Student can only view their own registrations; Admin can view any
    if (req.user.role === 'student') {
      const isOwner =
        req.user.studentId === studentIdentifier ||
        req.user.userId === studentIdentifier ||
        req.user.email === studentIdentifier;

      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. You can only view your own registrations." });
      }
    }

    const studentRegs = await Registration.find({
      $or: [
        { studentId: studentIdentifier.toUpperCase() },
        { studentEmail: studentIdentifier.toLowerCase() },
        { studentId: studentIdentifier }
      ]
    }).sort({ createdAt: -1 });

    return res.json(studentRegs);
  } catch (error) {
    console.error("Fetch student registrations error:", error);
    return res.status(500).json({ message: "Server error retrieving student registrations." });
  }
});

// Read Registrations by Event (Admin Only): GET /api/registrations/event/:eventId
router.get('/event/:eventId', requireAdmin, async (req, res) => {
  try {
    const eventRegs = await Registration.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    return res.json(eventRegs);
  } catch (error) {
    console.error("Fetch event registrations error:", error);
    return res.status(500).json({ message: "Server error retrieving event registrations." });
  }
});

// Create Registration (Student): POST /api/registrations
router.post('/', requireStudent, async (req, res) => {
  try {
    const { eventId } = req.body;
    // Derive student details from authenticated session token for security
    const studentId = req.user.studentId;
    const studentName = req.user.name;
    const studentEmail = req.user.email;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required for registration." });
    }

    const event = await Event.findOne({ id: eventId });
    if (!event) {
      return res.status(404).json({ message: "Target event does not exist." });
    }

    // Business Rule 1: Cannot register twice for the same event
    const existingReg = await Registration.findOne({
      $or: [{ studentId: studentId }, { studentEmail: studentEmail }],
      eventId: event.id,
      status: { $ne: 'Cancelled' }
    });

    if (existingReg) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // Business Rule 2: Cannot register if event is fully booked
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: "Registration failed. This event is fully booked." });
    }

    // Business Rule 3: Cannot register after registration deadline
    const today = new Date().toISOString().split('T')[0];
    if (event.deadline < today) {
      return res.status(400).json({ message: "Registration deadline for this event has passed." });
    }

    // Business Rule 4: Cannot register for past event
    if (event.date < today) {
      return res.status(400).json({ message: "Cannot register for an event that has already taken place." });
    }

    const nextId = await generateRegistrationCustomId();

    const newReg = new Registration({
      id: nextId,
      studentId: studentId,
      studentName: studentName,
      studentEmail: studentEmail,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventDate: event.date,
      eventVenue: event.venue,
      registrationDate: today,
      status: "Registered"
    });

    await newReg.save();

    // Business Rule 5: Registration count increases after successful registration
    event.registeredCount += 1;
    await event.save();

    return res.status(201).json({
      message: "Registration successful! You are enrolled in " + event.title,
      registration: newReg,
      availableSeats: event.capacity - event.registeredCount
    });
  } catch (error) {
    console.error("Create registration error:", error);
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
});

// Update Registration Status (Admin Only): PUT /api/registrations/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const reg = await Registration.findOne({ id: req.params.id });
    if (!reg) {
      return res.status(404).json({ message: "Registration record not found." });
    }

    const { status } = req.body;
    const allowed = ['Registered', 'Confirmed', 'Approved', 'Rejected', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status value provided. Must be one of: ${allowed.join(', ')}.`
      });
    }

    const previousStatus = reg.status;
    reg.status = status;
    await reg.save();

    // Handle seat count adjustments when status changes to/from Cancelled
    const event = await Event.findOne({ id: reg.eventId });
    if (event) {
      if (previousStatus !== 'Cancelled' && status === 'Cancelled') {
        event.registeredCount = Math.max(0, event.registeredCount - 1);
        await event.save();
      } else if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
        event.registeredCount += 1;
        await event.save();
      }
    }

    return res.json({ message: `Registration status updated to '${status}'.`, registration: reg });
  } catch (error) {
    console.error("Update registration status error:", error);
    return res.status(500).json({ message: "Server error updating registration status." });
  }
});

// Cancel Registration (Student or Admin): DELETE /api/registrations/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reg = await Registration.findOne({ id: req.params.id });
    if (!reg) {
      return res.status(404).json({ message: "Registration record not found." });
    }

    // Role check: If student, ensure registration belongs to them
    if (req.user.role === 'student') {
      const isOwner =
        reg.studentId === req.user.studentId ||
        reg.studentEmail === req.user.email;

      if (!isOwner) {
        return res.status(403).json({ message: "Access denied. You can only cancel your own registrations." });
      }
    }

    // Business Rule 6: Registration count decreases after cancellation
    const event = await Event.findOne({ id: reg.eventId });
    if (event && reg.status !== 'Cancelled') {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      await event.save();
    }

    reg.status = "Cancelled";
    await reg.save();

    return res.json({ message: "Registration cancelled successfully.", registration: reg });
  } catch (error) {
    console.error("Cancel registration error:", error);
    return res.status(500).json({ message: "Server error during cancellation." });
  }
});

module.exports = router;
