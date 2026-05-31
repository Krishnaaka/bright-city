import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './components/MainLayout';
import Navbar from './components/Navbar'; // Keep for public pages if needed, or remove later
import Settings from './pages/Settings';
import { isAuthenticated, isAdmin } from './utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const publicPaths = ['/login', '/register', '/'];
  const isPublic = publicPaths.includes(location.pathname);

  const content = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      /> {/* Fallback to settings or a 404 */}
    </Routes>
  );

  if (isPublic) {
    return (
      <div className="min-h-screen">
        {location.pathname !== '/' && <Navbar />} {/* Optional Navbar for auth pages */}
        {content}
      </div>
    );
  }

  return <MainLayout>{content}</MainLayout>;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
