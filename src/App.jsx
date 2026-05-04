import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './Layout'

import LoginPage from './pages/LoginPage'

// Admin pages
import DashboardAdmin   from './pages/admin/DashboardAdmin'
import CourseAdmin      from './pages/admin/CourseAdmin'
import StudentListAdmin from './pages/admin/StudentListAdmin'
import TeachersAdmin    from './pages/admin/TeachersAdmin'
import ScheduleAdmin    from './pages/admin/ScheduleAdmin'
import BillingAdmin     from './pages/admin/BillingAdmin'
import UsersAdmin       from './pages/admin/UsersAdmin'

// Teacher pages
import DashboardTeacher from './pages/teacher/DashboardTeacher'

// Student pages
import DashboardStudent from './pages/student/DashboardStudent'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index          element={<DashboardAdmin />} />
          <Route path="courses"  element={<CourseAdmin />} />
          <Route path="students" element={<StudentListAdmin />} />
          <Route path="teachers" element={<TeachersAdmin />} />
          <Route path="schedule" element={<ScheduleAdmin />} />
          <Route path="billing"  element={<BillingAdmin />} />
          <Route path="users"    element={<UsersAdmin />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardTeacher />} />
          {/* add more teacher sub-routes here */}
        </Route>

        {/* Student routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardStudent />} />
          {/* add more student sub-routes here */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}