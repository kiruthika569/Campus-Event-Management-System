import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageEvents from './pages/ManageEvents';
import ManageRegistrations from './pages/ManageRegistrations';

import './css/style.css';
import './css/home.css';

function Layout({ children, hideFooter }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Toast />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}

function SplashLayout({ children }) {
  return (
    <div>
      <Toast />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public home with exact original navbar, center card, and footer */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />

          {/* Role selection (no student/admin nav) */}
          <Route path="/role-selection" element={
            <Layout>
              <RoleSelection />
            </Layout>
          } />

          {/* Public event browsing */}
          <Route path="/events" element={
            <Layout>
              <Events />
            </Layout>
          } />

          {/* Auth pages */}
          <Route path="/student/login" element={
            <Layout>
              <StudentLogin />
            </Layout>
          } />
          <Route path="/student/register" element={
            <Layout>
              <StudentRegister />
            </Layout>
          } />
          <Route path="/admin/login" element={
            <Layout>
              <AdminLogin />
            </Layout>
          } />

          {/* Student protected pages */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRole="student">
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <Layout>
              <EventDetails />
            </Layout>
          } />
          <Route path="/student/my-registrations" element={
            <ProtectedRoute allowedRole="student">
              <Layout>
                <MyRegistrations />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRole="student">
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin protected pages */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-events" element={
            <ProtectedRoute allowedRole="admin">
              <Layout>
                <ManageEvents />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-registrations" element={
            <ProtectedRoute allowedRole="admin">
              <Layout>
                <ManageRegistrations />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
