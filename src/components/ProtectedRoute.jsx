import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {

  const {
    user,
    loading,
  } = useAuth()

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-lg font-semibold">
          Loading...
        </h1>
      </div>
    )
  }

  // ================= NOT LOGGED IN =================
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // ================= NORMALIZE ROLE =================
  const role =
    typeof user.role === 'string'
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase()

  // ================= ROLE CHECK =================
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // ================= ALLOWED =================
  return children
}