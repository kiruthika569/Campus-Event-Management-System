# Greenfield Campus Event Management System
### Greenfield Institute of Technology (GIT)

A full-stack web application designed to simplify campus event management and student registration. The platform allows students to explore campus events, register for events, and manage their registrations, while administrators can manage events and monitor student participation.

## Features

### Student Module
- Student registration and login
- Email validation using `@greenfieldit.edu`
- Personalized student dashboard
- Browse and search campus events
- View event details
- Register for events
- View and cancel registrations
- Update student profile

### Admin Module
- Secure administrator login
- Admin dashboard with event and registration statistics
- Create, view, update, and delete events
- Manage student registrations
- Monitor event participation
- Approve or reject registrations

### Security and Functionality
- JWT-based authentication
- Role-based access control
- Password hashing using bcryptjs
- Duplicate event registration prevention
- Event capacity management
- Registration deadline validation
- Protected student and admin routes

## Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, React Router, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| API Communication | REST API |

## Project Structure

```text
Campus-Event-Management-System/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── css/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or above)
- MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/kiruthika569/Campus-Event-Management-System.git
cd Campus-Event-Management-System
```

### 2. Install Dependencies

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder and configure the MongoDB connection string and required authentication secret.

### 4. Start the Application

From the project root directory:

```bash
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

## Demo Login Credentials

**Student Account**

- Email: `kiruthika@greenfieldit.edu`
- Password: `student123`

**Administrator Account**

- Email: `admin@greenfieldit.edu`
- Password: `admin`

New students can also register using a valid `@greenfieldit.edu` email address.

## Project Objective

To provide a centralized and user-friendly platform for managing campus events, simplifying student registrations, and helping administrators efficiently organize and monitor college activities.
