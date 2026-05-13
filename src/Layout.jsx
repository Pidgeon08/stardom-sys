import { useState } from 'react'
import { useNavigate, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import LoadingModal from './components/LoadingModal'

import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCircle,
  Calendar,
  CreditCard,
} from 'lucide-react'

const NAV_ITEMS = {
  // ================= ADMIN =================
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/teachers', label: 'Teachers', icon: UserCircle },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/users', label: 'Users', icon: UserCircle },
    { to: '/admin/schedule', label: 'Schedule', icon: Calendar },
    { to: '/admin/billing', label: 'Billing', icon: CreditCard },
  ],

  // ================= TEACHER =================
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/schedule', label: 'My Schedule', icon: Calendar },
    { to: '/teacher/students', label: 'My Students', icon: Users },
  ],

  // ================= STUDENT =================
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/schedule', label: 'My Schedule', icon: Calendar },
    { to: '/student/billing', label: 'My Billing', icon: CreditCard },
    { to: '/student/profile', label: 'Profile', icon: UserCircle },
  ],
}

// Unified colors for all roles
const ROLE_COLORS = {
  admin: 'bg-orange-600',
  teacher: 'bg-orange-600',
  student: 'bg-orange-600',
}

const ROLE_ACTIVE = {
  admin: 'bg-orange-700 text-white',
  teacher: 'bg-orange-700 text-white',
  student: 'bg-orange-700 text-white',
}

export default function Layout() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (loading) return null; 
  // Don't redirect if we are in the middle of logging out, otherwise the delay won't work
  if (!user && !isLoggingOut) return <Navigate to="/login" replace />;

  const role = user.role || 'student'
  const navItems = NAV_ITEMS[role] || []
  const bgColor = ROLE_COLORS[role]
  const activeClass = ROLE_ACTIVE[role]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const startTime = Date.now()
    
    await logout()
    
    // Enforce 2 second delay as requested
    const elapsed = Date.now() - startTime
    if (elapsed < 2000) {
      await new Promise(r => setTimeout(r, 2000 - elapsed))
    }
    
    setIsLoggingOut(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden relative">
      <NavBar
        user={user}
        navItems={navItems}
        bgColor={bgColor}
        activeClass={activeClass}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Logout Loading Modal */}
      <LoadingModal isOpen={isLoggingOut} message="Logging out..." />
    </div>
  )
}