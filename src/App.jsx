import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'
import LoginPage from './pages/auth/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAttendancePage from './pages/admin/AdminAttendancePage'
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage'
import AdminLeavesPage from './pages/admin/AdminLeavesPage'
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import CheckInPage from './pages/employee/CheckInPage'
import AttendanceHistoryPage from './pages/employee/AttendanceHistoryPage'
import EmployeeLeavesPage from './pages/employee/EmployeeLeavesPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161b27',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontSize: '0.88rem',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="leaves" element={<AdminLeavesPage />} />
            <Route path="departments" element={<AdminDepartmentsPage />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<EmployeeDashboard />} />
            <Route path="checkin" element={<CheckInPage />} />
            <Route path="attendance" element={<AttendanceHistoryPage />} />
            <Route path="leaves" element={<EmployeeLeavesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
