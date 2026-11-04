const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Student = require('../models/Student');
const Registration = require('../models/Registration');
const { requireAdmin } = require('../middleware/auth');

// Admin Statistics: GET /api/admin/statistics
router.get('/statistics', requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalEvents, upcomingEvents, totalStudents, totalRegistrations, recentEvents, recentRegistrations] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ date: { $gte: today }, status: { $ne: 'Cancelled' } }),
      Student.countDocuments(),
      Registration.countDocuments({ status: { $ne: 'Cancelled' } }),
      Event.find().sort({ createdAt: -1 }).limit(5),
      Registration.find().sort({ createdAt: -1 }).limit(5)
    ]);

    return res.json({
      totalEvents,
      upcomingEvents,
      totalStudents,
      totalRegistrations,
      recentEvents,
      recentRegistrations
    });
  } catch (error) {
    console.error("Fetch admin statistics error:", error);
    return res.status(500).json({ message: "Server error retrieving administrative statistics." });
  }
});

module.exports = router;
