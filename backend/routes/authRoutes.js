const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

// Helper to generate dynamic Student ID S001, S002...
async function generateStudentCustomId() {
  const students = await Student.find({}, 'id').lean();
  const max = students.reduce((acc, s) => {
    const num = parseInt((s.id || '').replace(/\D/g, ''), 10);
    return !isNaN(num) && num > acc ? num : acc;
  }, 0);
  return 'S' + String(max + 1).padStart(3, '0');
}

// Student Registration: POST /api/students/register
router.post('/students/register', async (req, res) => {
  try {
    const { name, studentId, email, department, year, password } = req.body;

    if (!name || !studentId || !email || !department || !year || !password) {
      return res.status(400).json({ message: "All registration fields are required." });
    }

    const domain = process.env.ALLOWED_STUDENT_DOMAIN || '@greenfieldit.edu';
    if (!email.toLowerCase().endsWith(domain.toLowerCase())) {
      return res.status(400).json({
        message: `Only ${domain} email addresses are accepted for student registration. Gmail, Yahoo, and other domains are not allowed.`
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // Check duplicate student ID
    const existingId = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (existingId) {
      return res.status(400).json({ message: "Student ID is already registered in the system." });
    }

    const nextId = await generateStudentCustomId();

    const newStudent = new Student({
      id: nextId,
      studentId: studentId.toUpperCase(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Pre-save hook will hash this
      department,
      year,
      registeredAt: new Date().toISOString().split('T')[0]
    });

    await newStudent.save();

    return res.status(201).json({
      message: "Registration successful! You can now log in.",
      student: {
        id: newStudent.id,
        studentId: newStudent.studentId,
        name: newStudent.name,
        email: newStudent.email,
        department: newStudent.department,
        year: newStudent.year,
        registeredAt: newStudent.registeredAt
      }
    });
  } catch (error) {
    console.error("Student registration error:", error);
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
});

// Student Login: POST /api/students/login
router.post('/students/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password. Please try again." });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password. Please try again." });
    }

    const userPayload = {
      userId: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      role: "student"
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: "Login successful",
      token,
      user: userPayload
    });
  } catch (error) {
    console.error("Student login error:", error);
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
});

// Admin Login: POST /api/admin/login
router.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@greenfieldit.edu').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    if (email && password && email.toLowerCase().trim() === adminEmail && password === adminPassword) {
      const userPayload = {
        userId: "ADM001",
        name: adminName,
        email: adminEmail,
        role: "admin"
      };

      const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: "Admin login successful",
        token,
        user: userPayload
      });
    }

    return res.status(401).json({ message: "Invalid admin credentials." });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error during admin login.", error: error.message });
  }
});

// Verify active session: GET /api/auth/me
router.get('/auth/me', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({
        $or: [{ id: req.user.userId }, { studentId: req.user.studentId }, { email: req.user.email }]
      }).select('-password');

      if (!student) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        userId: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        role: "student"
      });
    }

    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: "Server error checking session." });
  }
});

module.exports = router;
