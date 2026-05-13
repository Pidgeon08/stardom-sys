import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import LoadingModal from '../components/LoadingModal'

// Matching the exact filename 'logo..png' from your assets folder
import logo from '../assets/logo..png'

export default function LoginPage() {
  const [uname, setUsername] = useState('')
  const [pword, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const navigate = useNavigate()
  const { login } = useAuth()

  // Load saved username on mount
  useEffect(() => {
    const savedUname = localStorage.getItem('remembered_username')
    if (savedUname) {
      setUsername(savedUname)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const startTime = Date.now()

    try {
      // 1. AUTHENTICATE
      const user = await login(uname, pword)

      // 2. AUTHORIZE
      // Check if user is active
      if (user.is_active === false) {
        setError('Your account is currently inactive. Please contact your administrator.')
        // Ensure we wait for 2 seconds even on failure
        const elapsed = Date.now() - startTime
        if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed))
        return
      }

      // Check for valid roles
      const allowedRoles = ['admin', 'teacher', 'student']
      if (!user.role || !allowedRoles.includes(user.role)) {
        setError('You are not authorized to access this system.')
        const elapsed = Date.now() - startTime
        if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed))
        return
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('remembered_username', uname)
      } else {
        localStorage.removeItem('remembered_username')
      }

      // Enforce 2 second delay for premium feel
      const elapsed = Date.now() - startTime
      if (elapsed < 2000) {
        await new Promise(r => setTimeout(r, 2000 - elapsed))
      }

      // 3. NAVIGATE TO DASHBOARD
      navigate(`/${user.role}`, { replace: true })

    } catch (err) {
      // Clear ONLY the password field on error as requested
      setPassword('')
      
      const msg = err.response?.data?.non_field_errors?.[0]
        ?? err.response?.data?.detail
        ?? 'Invalid credentials'
      setError(msg)
      
      // Enforce 2 second delay for premium feel even on error
      const elapsed = Date.now() - startTime
      if (elapsed < 2000) {
        await new Promise(r => setTimeout(r, 2000 - elapsed))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100'>
      <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100'>
        <div className='text-center mb-8'>

          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Stardom Music Center"
              className="w-full h-auto max-h-28 object-contain"
            />
          </div>

          <p className='text-gray-600 text-sm font-medium'>
            Student Enrollment & Information Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Username</label>
            <input
              type="text"
              value={uname}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={pword}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer font-medium hover:text-gray-800 transition-colors">
              Remember me
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-md disabled:opacity-50"
          >
            LOGIN
          </button>
        </form>

        <LoadingModal isOpen={loading} message="Logging in..." />
      </div>
    </div>
  )
}