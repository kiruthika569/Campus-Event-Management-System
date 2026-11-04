require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.txt');
const EVENTS_FILE = path.join(DATA_DIR, 'events.txt');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.txt');

function readDataFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (content) return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return null;
}

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/greenfield_events';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Seed Students
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log("[Seed] Migrating students to MongoDB...");
      const fileStudents = readDataFile(STUDENTS_FILE) || [];
      for (const s of fileStudents) {
        const student = new Student({
          id: s.id,
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          password: s.password, // Pre-save hook will hash this
          department: s.department,
          year: s.year,
          registeredAt: s.registeredAt || new Date().toISOString().split('T')[0]
        });
        await student.save();
      }
      console.log(`[Seed] Seeded ${fileStudents.length} students into MongoDB.`);
    } else {
      console.log(`[Seed] Students collection already contains ${studentCount} documents.`);
    }

    // 2. Seed Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log("[Seed] Migrating events to MongoDB...");
      const fileEvents = readDataFile(EVENTS_FILE) || [];
      for (const e of fileEvents) {
        const event = new Event({
          id: e.id,
          title: e.title,
          category: e.category,
          description: e.description,
          date: e.date,
          time: e.time,
          venue: e.venue,
          organizer: e.organizer,
          capacity: e.capacity,
          registeredCount: e.registeredCount || 0,
          deadline: e.deadline,
          status: e.status || "Upcoming"
        });
        await event.save();
      }
      console.log(`[Seed] Seeded ${fileEvents.length} events into MongoDB.`);
    } else {
      console.log(`[Seed] Events collection already contains ${eventCount} documents.`);
    }

    // 3. Seed Registrations
    const regCount = await Registration.countDocuments();
    if (regCount === 0) {
      console.log("[Seed] Migrating registrations to MongoDB...");
      const fileRegs = readDataFile(REGISTRATIONS_FILE) || [];
      for (const r of fileRegs) {
        const reg = new Registration({
          id: r.id,
          studentId: r.studentId,
          studentName: r.studentName,
          studentEmail: r.studentEmail,
          eventId: r.eventId,
          eventTitle: r.eventTitle,
          eventCategory: r.eventCategory || 'General',
          eventDate: r.eventDate,
          eventVenue: r.eventVenue,
          registrationDate: r.registrationDate,
          status: r.status || "Registered"
        });
        await reg.save();
      }
      console.log(`[Seed] Seeded ${fileRegs.length} registrations into MongoDB.`);
    } else {
      console.log(`[Seed] Registrations collection already contains ${regCount} documents.`);
    }

    console.log("[Seed] Migration to MongoDB complete!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Migration failed:", err);
    process.exit(1);
  }
}

seedDatabase();
