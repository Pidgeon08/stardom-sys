import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

// Matching the exact filename 'logo..png' from your assets folder
import logo from '../assets/logo..png' 

export default function LoginPage() {
  const [uname, setUsername] = useState('')
  const [pword, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(uname, pword)
      // Redirect based on role
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
               ?? err.response?.data?.detail
               ?? 'Invalid credentials'
      setError(msg)
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

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">Password</label>
            <input
              type="password"
              value={pword}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Enter password"
              required
            />
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
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  )
}