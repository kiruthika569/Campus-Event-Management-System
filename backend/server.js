require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Greenfield Campus Event Management System Backend is running with MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if it exists
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  const indexHtml = path.join(frontendDistPath, 'index.html');
  if (require('fs').existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.json({
      message: 'Greenfield Campus Event Backend API is running. Access the React frontend at http://localhost:5173'
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server uncaught error:", err);
  res.status(500).json({ message: "An internal server error occurred.", error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  GREENFIELD CAMPUS EVENT SYSTEM BACKEND (MONGODB)   `);
  console.log(`====================================================`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  Connected Database: ${process.env.MONGODB_URI}`);
  console.log(`====================================================`);
});
