const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Registration = require('../models/Registration');
const { verifyToken } = require('../middleware/auth');

// Get Student Profile: GET /api/students/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [{ id: req.params.id }, { studentId: req.params.id }]
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    // Role check: Students can only view their own profile; Admin can view any
    if (req.user.role === 'student' && req.user.studentId !== student.studentId && req.user.userId !== student.id) {
      return res.status(403).json({ message: "Access denied. You can only view your own profile." });
    }

    return res.json(student);
  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({ message: "Server error retrieving profile." });
  }
});

// Update Student Profile: PUT /api/students/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [{ id: req.params.id }, { studentId: req.params.id }]
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    // Authorization: Student can only edit their own profile; Admin can edit any
    if (req.user.role === 'student' && req.user.studentId !== student.studentId && req.user.userId !== student.id) {
      return res.status(403).json({ message: "Access denied. You can only update your own profile." });
    }

    const { name, department, year } = req.body;
    if (name) student.name = name.trim();
    if (department) student.department = department;
    if (year) student.year = year;

    await student.save();

    // Sync student name in registrations if updated
    if (name) {
      await Registration.updateMany(
        { studentId: student.studentId },
        { $set: { studentName: student.name } }
      );
    }

    return res.json({
      message: "Profile updated successfully.",
      user: {
        userId: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        role: "student"
      }
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    return res.status(500).json({ message: "Server error updating profile." });
  }
});

module.exports = router;
