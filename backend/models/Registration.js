const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  eventId: {
    type: String,
    required: true,
    trim: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventCategory: {
    type: String,
    default: 'General'
  },
  eventDate: {
    type: String,
    required: true
  },
  eventVenue: {
    type: String,
    required: true
  },
  registrationDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    enum: ['Registered', 'Confirmed', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Registered'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
