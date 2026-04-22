import { useState } from "react"
import { NavLink, useNavigate } from "react-router";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="w-64 bg-orange-800 text-white flex flex-col h-screen sticky top-0 overflow-hidden overflow-y-hidden pointer-events-auto">
      <div className="p-6 border-b border-orange-700">
        <h2 className="text-2xl font-bold">Stardom Music Center</h2>
        <p className="text-sm text-orange-200"></p>
      </div>

      <nav className="px-4 py-4 flex-1">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/studentlist"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Student List</span>
        </NavLink>
        <NavLink
          to="/admin/teacherlist"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Teacher List</span>
        </NavLink>
        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Courses</span>
        </NavLink>
        <NavLink
          to="/admin/billing"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Billins</span>
        </NavLink>
        <NavLink
          to="/admin/schedule"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive
                ? "bg-orange-600 text-white"
                : "text-orange-200 hover:bg-orange-700 hover:text-white"
            }`
          }
        >
          <span>Schedule</span>
        </NavLink>
        
      </nav>

      {/* Logout pinned to bottom */}
      <div className="p-4 border-t border-orange-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-orange-200 hover:bg-red-600 hover:text-white transition"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
