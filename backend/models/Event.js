const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Technical', 'Cultural', 'Sports', 'Other'],
    default: 'Technical'
  },
  description: {
    type: String,
    default: 'No detailed description provided.'
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    default: 'Greenfield Institute of Technology'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
