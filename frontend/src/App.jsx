/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import MfaSetup from './pages/MfaSetup'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import IncidentDetail from './pages/IncidentDetail'
import Resources from './pages/Resources'
import Dispatch from './pages/Dispatch'
import AuditLog from './pages/AuditLog'
import AdminHospitals from './pages/admin/AdminHospitals'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSecurity from './pages/admin/AdminSecurity'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mfa-setup" element={
        <ProtectedRoute>
          <MfaSetup />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/incidents" element={
        <ProtectedRoute>
          <Layout><Incidents /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/incidents/:id" element={
        <ProtectedRoute>
          <Layout><IncidentDetail /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout><Resources /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dispatch" element={
        <ProtectedRoute roles={['DISPATCHER', 'ADMIN']}>
          <Layout><Dispatch /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/audit" element={
        <ProtectedRoute roles={['ADMIN', 'DISPATCHER']}>
          <Layout><AuditLog /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/hospitals" element={
        <ProtectedRoute roles={['ADMIN', 'HOSPITAL_ADMIN']}>
          <Layout><AdminHospitals /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><AdminUsers /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/security" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout><AdminSecurity /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
