import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import {
  LayoutDashboard, BookOpen, Users, UserCircle,
  Calendar, DollarSign, LogOut, Menu, X, Music
} from 'lucide-react'

const NAV_ITEMS = {
  admin: [
    { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/admin/courses',  label: 'Courses',    icon: BookOpen        },
    { to: '/admin/students', label: 'Students',   icon: Users           },
    { to: '/admin/teachers', label: 'Teachers',   icon: UserCircle      },
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const role     = user?.role ?? 'student'
  const navItems = NAV_ITEMS[role] ?? []
  const bgColor  = ROLE_COLORS[role]
  const activeClass = ROLE_ACTIVE[role]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    // FIX: h-screen instead of min-h-screen so the container is capped to the viewport
    // This allows overflow-auto on <main> to actually scroll instead of the whole page growing
    <div className="h-screen flex bg-slate-50 overflow-hidden">

      {/* Sidebar — h-full so it fills the fixed-height parent, not min-h-screen */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} ${bgColor} text-white flex flex-col transition-all duration-300 h-full shrink-0`}>
        
        {/* Logo + toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Music size={22} />
              <span className="font-bold text-sm leading-tight">Stardom<br/>Musical Center</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-white/20 transition ml-auto">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/20">
            <p className="text-xs text-white/60 uppercase tracking-wider">Logged in as</p>
            <p className="font-semibold truncate">{user?.first_name} {user?.last_name}</p>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{role}</span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium
                ${isActive ? activeClass : 'hover:bg-white/20 text-white/90'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/20 transition text-sm font-medium text-white/90"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content — overflow-auto now works because the parent is h-screen */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}