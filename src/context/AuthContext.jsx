import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  // ================= RESTORE SESSION =================
  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (token) {
      api
        .get('/auth/me/')
        .then((res) => {

          // Normalize role
          const normalizedUser = {
            ...res.data,

            role:
              typeof res.data.role === 'string'
                ? res.data.role.toLowerCase()
                : res.data.role?.name?.toLowerCase(),
          }

          setUser(normalizedUser)
        })

        .catch((error) => {
          console.error('Session restore failed:', error)

          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')

          setUser(null)
        })

        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // ================= INACTIVITY TIMER =================
  useEffect(() => {
    if (!user) return

    let timer

    const resetTimer = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        setSessionExpired(true)
      }, 5 * 60 * 1000)
    }

    resetTimer()

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      if (timer) clearTimeout(timer)
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [user])

  // ================= LOGIN =================
  const login = async (username, password) => {
    try {
      const { data } = await api.post(
        '/auth/login/',
        {
          username,
          password,
        }
      )

      // Save tokens
      localStorage.setItem(
        'access_token',
        data.tokens.access
      )

      localStorage.setItem(
        'refresh_token',
        data.tokens.refresh
      )

      // Normalize role
      const normalizedUser = {
        ...data.user,

        role:
          typeof data.user.role === 'string'
            ? data.user.role.toLowerCase()
            : data.user.role?.name?.toLowerCase(),
      }

      setUser(normalizedUser)

      return normalizedUser

    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      const refreshToken =
        localStorage.getItem('refresh_token')

      await api.post('/auth/logout/', {
        refresh: refreshToken,
      })

    } catch (error) {
      console.error(
        'Logout request failed:',
        error
      )

    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
      {sessionExpired && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-4 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Session Expired</h3>
            <p className="text-sm text-slate-500 mb-6">
              You have been logged out due to 5 minutes of inactivity. Please log in again to continue.
            </p>
            <button
              onClick={() => {
                setSessionExpired(false)
              }}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition duration-200 shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
              Log In Again
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

// ================= CUSTOM HOOK =================
export const useAuth = () => {
  return useContext(AuthContext)
}