import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LogOut, Menu, X, Music } from "lucide-react"
import ConfirmationModal from "./ConfirmationModal"

export default function NavBar({ user, navItems, bgColor, activeClass, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
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
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${user?.role}`}
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
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/20 transition text-sm font-medium text-white/90"
        >
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to log out? You will need to log in again to access your account."
        confirmText="Logout"
        onConfirm={onLogout}
        onCancel={() => setShowLogoutModal(false)}
        isDangerous={true}
        isLoading={false}
      />
    </aside>
  )
}