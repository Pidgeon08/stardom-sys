import { useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import {
  LayoutDashboard, BookOpen, Users, UserCircle,
  Calendar, DollarSign
} from 'lucide-react'

const NAV_ITEMS = {
  admin: [
    { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/admin/teachers', label: 'Teachers',   icon: UserCircle      },
    { to: '/admin/courses',  label: 'Courses',    icon: BookOpen        },
    { to: '/admin/students', label: 'Students',   icon: Users           },
    { to: '/admin/users',    label: 'Users',      icon: UserCircle      },
    { to: '/admin/schedule', label: 'Schedule',   icon: Calendar        },
    { to: '/admin/billing',  label: 'Billing',    icon: DollarSign      },
  ],
  teacher: [
    { to: '/teacher',          label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/schedule', label: 'My Schedule', icon: Calendar      },
    { to: '/teacher/students', label: 'My Students', icon: Users         },
  ],
  student: [
    { to: '/student',          label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/student/schedule', label: 'My Schedule', icon: Calendar       },
    { to: '/student/billing',  label: 'My Billing',  icon: DollarSign     },
  ],
}

const ROLE_COLORS = {
  admin:   'bg-orange-600',
  teacher: 'bg-purple-600',
  student: 'bg-blue-600',
}

const ROLE_ACTIVE = {
  admin:   'bg-orange-700 text-white',
  teacher: 'bg-purple-700 text-white',
  student: 'bg-blue-700 text-white',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const role     = user?.role ?? 'student'
  const navItems = NAV_ITEMS[role] ?? []
  const bgColor  = ROLE_COLORS[role]
  const activeClass = ROLE_ACTIVE[role]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
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
    </div>
  )
}