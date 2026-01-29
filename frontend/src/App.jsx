import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BedManagement from './pages/BedManagement';
import WaitingQueue from './pages/WaitingQueue';
import Admission from './pages/Admission';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
              <PublicRoute>
                  <Login />
              </PublicRoute>
          } />
          <Route path="/signup" element={
              <PublicRoute>
                  <Signup />
              </PublicRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          } />

          <Route path="/beds" element={
            <ProtectedRoute>
              <Layout>
                <BedManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/queue" element={
            <ProtectedRoute>
              <Layout>
                <WaitingQueue />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admit" element={
            <ProtectedRoute>
              <Layout>
                <Admission />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <div className="text-gray-500 p-8">Reports Module (Coming Soon)</div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <div className="text-gray-500 p-8">Settings Module (Coming Soon)</div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
