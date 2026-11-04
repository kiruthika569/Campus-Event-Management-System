# Greenfield Campus Event Management System (Assignment 2)
### Greenfield Institute of Technology (GIT)

A full-stack, enterprise-grade Campus Event Management & Registration Portal upgraded from Assignment 1 (static HTML/vanilla JS & text-file storage) to **Assignment 2 (React.js + Express + MongoDB)**.

---

## 🚀 Key Improvements & Upgrades in Assignment 2

1. **Frontend**: Migrated to a modern single-page application (SPA) using **React.js** (Vite), React Router v7, React Context API (`AuthContext`), and responsive CSS.
2. **Design Fidelity**: Exact preservation of Greenfield Institute's original design system, CSS styling tokens, color palette, navigation bar, typography, and card layouts.
3. **Database**: Migrated flat-file storage (`data/*.txt`) to **MongoDB** using **Mongoose** with strict schema validation, indexes, and automated relations.
4. **Security & Authentication**:
   - Industry-standard **JWT (JSON Web Tokens)** with role-based middleware (`requireAdmin`, `requireStudent`).
   - Password hashing using **bcryptjs**.
   - Student email domain restriction strictly enforced for `@greenfieldit.edu`.
   - Fixed administrative access without student privilege escalation.
   - Cross-Origin Resource Sharing (CORS) and Vite reverse proxy configured.
5. **Business Logic & Automation**:
   - Automated seat availability tracking (`capacity - registeredCount`).
   - Duplicate registration prevention.
   - Event deadline validation.
   - Capacity increment/decrement on registration approval or cancellation.
   - Student dashboard showing personal registrations only; Admin dashboard with system-wide analytics, event CRUD, and registration moderation.

---

## 📁 Project Architecture & Structure

```
event pro/
├── backend/                        # Node.js + Express + MongoDB API Server
│   ├── config/
│   │   └── db.js                   # Mongoose connection configuration
│   ├── models/
│   │   ├── Student.js              # Student Mongoose Schema & bcrypt hashing
│   │   ├── Event.js                # Event Mongoose Schema & status enums
│   │   └── Registration.js         # Registration Mongoose Schema & status
│   ├── middleware/
│   │   └── auth.js                 # JWT verification & role authorization (Admin/Student)
│   ├── routes/
│   │   ├── authRoutes.js           # Student & Admin authentication endpoints
│   │   ├── studentRoutes.js        # Student profile view & update endpoints
│   │   ├── eventRoutes.js          # Public event listings & Admin event CRUD
│   │   ├── registrationRoutes.js   # Student registration, cancellation & Admin review
│   │   └── adminRoutes.js          # Admin dashboard statistics & metrics
│   ├── scripts/
│   │   └── seed.js                 # Database migration script (from Assignment 1 txt files)
│   ├── .env                        # Backend environment configuration
│   ├── package.json
│   └── server.js                   # Express application entry point
│
├── frontend/                       # React.js SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Role-aware navigation header
│   │   │   ├── Footer.jsx          # Campus portal footer
│   │   │   ├── Toast.jsx           # Global notification alerts
│   │   │   └── ProtectedRoute.jsx  # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state, JWT token & API client
│   │   ├── css/                    # Preserved original CSS stylesheets
│   │   │   ├── style.css
│   │   │   ├── home.css
│   │   │   ├── student.css
│   │   │   ├── events.css
│   │   │   └── admin.css
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Splash welcome page
│   │   │   ├── RoleSelection.jsx   # Student / Admin portal selector
│   │   │   ├── StudentLogin.jsx    # Student login with demo credentials
│   │   │   ├── StudentRegister.jsx # Student registration (@greenfieldit.edu only)
│   │   │   ├── AdminLogin.jsx      # Admin login with fixed account
│   │   │   ├── StudentDashboard.jsx# Student personalized dashboard
│   │   │   ├── Events.jsx          # Live search & category filter catalogue
│   │   │   ├── EventDetails.jsx    # Event details & registration booking
│   │   │   ├── MyRegistrations.jsx # Student registration tracking & cancellation
│   │   │   ├── Profile.jsx         # Student profile update
│   │   │   ├── AdminDashboard.jsx  # Admin stats & recent activity
│   │   │   ├── ManageEvents.jsx    # Admin Event CRUD (Create, Edit, Delete)
│   │   │   └── ManageRegistrations.jsx # Admin registration approval/rejection
│   │   ├── App.jsx                 # React Router routing configuration
│   │   └── main.jsx
│   ├── vite.config.js              # Vite proxy configuration for /api
│   ├── package.json
│   └── index.html
│
├── data/                           # Original Assignment 1 text files (preserved)
├── package.json                    # Unified root package.json
└── README.md
```

---

## 🔑 Demo Login Credentials

### Student Account
- **Email:** `kiruthika@greenfieldit.edu`
- **Password:** `student123`
*(Or create a new student account using any `@greenfieldit.edu` email)*

### Administrator Account (Fixed)
- **Email:** `admin@greenfieldit.edu`
- **Password:** `admin`

---

## ⚙️ Setup & Running the Application

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
Run the following in the project root:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Seed Database (Optional - Already seeded)
To re-import all original events and students from the Assignment 1 text files into MongoDB:
```bash
npm run seed
```

### 3. Start Frontend & Backend Concurrently
From the project root directory:
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
